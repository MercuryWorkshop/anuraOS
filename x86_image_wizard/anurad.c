#include <asm-generic/ioctls.h>
#define _XOPEN_SOURCE 700
#include <fcntl.h> /* open */
#include <poll.h>
#include <pthread.h>
#include <pty.h>
#include <stdbool.h>
#include <stdint.h> /* uint64_t  */
#include <stdio.h>  /* printf */
#include <stdlib.h> /* size_t */
#include <sys/mman.h>
#include <sys/select.h>
#include <sys/time.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h> /* pread, sysconf */
#define SHARED_BUFFER_MAX_SIZE 64

typedef struct {
  uint64_t pfn : 55;
  unsigned int soft_dirty : 1;
  unsigned int file_page : 1;
  unsigned int swapped : 1;
  unsigned int present : 1;
} PagemapEntry;

typedef struct {
  int master;
  int slave;
  bool closed;
} pty_t;

char *getl(FILE *f) {
  char *line = malloc(100), *linep = line;
  size_t lenmax = 100, len = lenmax;
  int c;

  if (line == NULL)
    return NULL;

  for (;;) {
    c = fgetc(f);
    if (c == EOF)
      break;

    if (--len == 0) {
      len = lenmax;
      char *linen = realloc(linep, lenmax *= 2);

      if (linen == NULL) {
        free(linep);
        return NULL;
      }
      line = linen + (line - linep);
      linep = linen;
    }

    if ((*line++ = c) == '\n')
      break;
  }
  *line = '\0';
  return linep;
}
/* Parse the pagemap entry for the given virtual address.
 *
 * @param[out] entry      the parsed entry
 * @param[in]  pagemap_fd file descriptor to an open /proc/pid/pagemap file
 * @param[in]  vaddr      virtual address to get entry for
 * @return 0 for success, 1 for failure
 */
int pagemap_get_entry(PagemapEntry *entry, int pagemap_fd, uintptr_t vaddr) {
  size_t nread;
  ssize_t ret;
  uint64_t data;
  uintptr_t vpn;

  vpn = vaddr / sysconf(_SC_PAGE_SIZE);
  nread = 0;
  while (nread < sizeof(data)) {
    ret = pread(pagemap_fd, ((uint8_t *)&data) + nread, sizeof(data) - nread,
                vpn * sizeof(data) + nread);
    nread += ret;
    if (ret <= 0) {
      return 1;
    }
  }
  entry->pfn = data & (((uint64_t)1 << 55) - 1);
  entry->soft_dirty = (data >> 55) & 1;
  entry->file_page = (data >> 61) & 1;
  entry->swapped = (data >> 62) & 1;
  entry->present = (data >> 63) & 1;
  return 0;
}

/* Convert the given virtual address to physical using /proc/PID/pagemap.
 *
 * @param[out] paddr physical address
 * @param[in]  pid   process to convert for
 * @param[in] vaddr virtual address to get entry for
 * @return 0 for success, 1 for failure
 */
int virt_to_phys_user(uintptr_t *paddr, pid_t pid, uintptr_t vaddr) {
  char pagemap_file[BUFSIZ];
  int pagemap_fd;

  snprintf(pagemap_file, sizeof(pagemap_file), "/proc/%ju/pagemap",
           (uintmax_t)pid);
  pagemap_fd = open(pagemap_file, O_RDONLY);
  if (pagemap_fd < 0) {
    return 1;
  }
  PagemapEntry entry;
  if (pagemap_get_entry(&entry, pagemap_fd, vaddr)) {
    return 1;
  }
  close(pagemap_fd);
  *paddr =
      (entry.pfn * sysconf(_SC_PAGE_SIZE)) + (vaddr % sysconf(_SC_PAGE_SIZE));
  return 0;
}

pty_t *ptys;

int num_ptys = 0;

volatile int write_intent = 0;
volatile int read_intent = 0;
volatile int new_intent = 0;

volatile int s_rows = 0;
volatile int s_cols = 0;
volatile int resize_intent = 0;

volatile int read_nbytes = 0;
volatile int write_nbytes = 0;

uintptr_t read_intent_phys_addr;
uintptr_t read_nbytes_phys_addr;

uintptr_t s_rows_phys_addr;
uintptr_t s_cols_phys_addr;
uintptr_t resize_intent_phys_addr;

uintptr_t write_nbytes_phys_addr;
uintptr_t write_intent_phys_addr;
uintptr_t new_intent_phys_addr;
pid_t pid;

void alloc_aty(pty_t *pty, char *argv[], char *envp[]) {
  int master, slave;
  struct winsize winp;
  winp.ws_col = s_cols;
  winp.ws_row = s_rows;
  openpty(&master, &slave, NULL, NULL, &winp);

  printf("IIII%i %i\n", master, slave);

  pid_t child = fork();
  if (child == 0) {
    setsid();
    // this particular setsid() fixes the "no job control" error.
    // i don't know why, but we'll accept it
    // i had to read alacritty source code to find this :despair:

    dup2(slave, STDOUT_FILENO);
    dup2(slave, STDIN_FILENO);
    dup2(slave, STDERR_FILENO);

    ioctl(pty->slave, TIOCSWINSZ, &winp);
    execve(argv[0], argv, envp);
  }
  // sleep(1);

  ioctl(pty->slave, TIOCSWINSZ, &winp);
  pty->master = master;
  pty->slave = slave;
  pty->closed = false;
}
void wait_for_ack(FILE *f) {
  char ack = ' ';
  do {
    fscanf(f, "%c", &ack);
  } while (ack != '\006');
}
void *readLoop() {

  FILE *fo = fopen("/dev/ttyS1", "r");
  FILE *fi = fopen("/dev/ttyS1", "w");
  size_t count = 0;
  while (1) {
    int cur_num_ptys = num_ptys;
    // gotta make sure it doesn't race condition
    if (cur_num_ptys < 1) {
      continue;
    }
    // printf("readloop! %i %i\n", cur_num_ptys, ptys[0].master);

    struct pollfd fds[cur_num_ptys];

    for (int i = 0; i < cur_num_ptys; i++) {

      pty_t pty = ptys[i];

      fds[i].events = POLLIN;
      fds[i].fd = pty.master;
    }
    // printf("ptys: %i\n", cur_num_ptys);
    //
    // printf("fd: %i\n", fds[0].fd);

    int ret = poll(fds, cur_num_ptys, 5000);

    for (int i = 0; i < cur_num_ptys; i++) {
      // printf("to: %i %i %i\n", i, ptys[i].master, ptys[i].slave);
      pty_t pty = ptys[i];

      if (!(fds[i].revents & POLLIN))
        continue;

      ioctl(pty.master, FIONREAD, &count);
      if (count < 1)
        continue;
      // printf("total avail: %lu bytes\n", count);
      if (count > SHARED_BUFFER_MAX_SIZE)
        count = SHARED_BUFFER_MAX_SIZE;
      char shared_out_buffer[count];
      // shared_buffer is the pointer that can be read by the host

      count = read(pty.master, shared_out_buffer, count);

      uintptr_t buffer_phys_addr;
      virt_to_phys_user(&buffer_phys_addr, pid, (uintptr_t)shared_out_buffer);
      read_nbytes = count;
      fprintf(fi, "\005r %lu %i\n", buffer_phys_addr, i);
      wait_for_ack(fo);
    }
  }
}

int main() {
  FILE *fo = fopen("/dev/ttyS0", "r");
  FILE *fi = fopen("/dev/ttyS0", "w");
  size_t count = 0;
  ptys = malloc(0);

  // THIS IS USERSPACE DMA BITCH!! WE COMPILE IN THIS MUTHAFUCKER BETTER TAKE YO
  // SENSITIVE ASS BACK TO KERNEL DRIVER
  pid = getpid();
  printf("pid: %u\n", pid);

  virt_to_phys_user(&read_intent_phys_addr, pid, (uintptr_t)&read_intent);
  virt_to_phys_user(&write_intent_phys_addr, pid, (uintptr_t)&write_intent);
  virt_to_phys_user(&new_intent_phys_addr, pid, (uintptr_t)&new_intent);
  virt_to_phys_user(&read_nbytes_phys_addr, pid, (uintptr_t)&read_nbytes);
  virt_to_phys_user(&write_nbytes_phys_addr, pid, (uintptr_t)&write_nbytes);

  virt_to_phys_user(&s_rows_phys_addr, pid, (uintptr_t)&s_rows);
  virt_to_phys_user(&s_cols_phys_addr, pid, (uintptr_t)&s_cols);
  virt_to_phys_user(&resize_intent_phys_addr, pid, (uintptr_t)&resize_intent);
  fprintf(fi, "\005i %lu %lu %lu %lu %lu %lu %lu %lu\n", read_intent_phys_addr,
          write_intent_phys_addr, new_intent_phys_addr, read_nbytes_phys_addr,
          write_nbytes_phys_addr, s_rows_phys_addr, s_cols_phys_addr,
          resize_intent_phys_addr);

  fprintf(fi, "dbg: %i %i %i %i %i\n", read_intent, write_intent, new_intent,
          read_nbytes, write_nbytes);
  wait_for_ack(fo);
  // printf("%d\n", __LINE__);
  pthread_t thread_id;
  pthread_create(&thread_id, NULL, readLoop, NULL);

  // fprintf(fi, "%d\n", __LINE__);
  while (1) {

    // fprintf(fi, "%d\n", __LINE__);
    if (resize_intent > 0 && read_intent == 1336) {
      read_intent = 0;
      read_intent = 0;
      // printf("%d\n", __LINE__);

      int pty_index = resize_intent - 1;
      struct winsize winp;
      winp.ws_col = s_cols;
      winp.ws_row = s_rows;
      ioctl(ptys[pty_index].slave, TIOCSWINSZ, &winp);
      // printf("resizing: %i %i WITH INTENT %i\n", s_cols, s_rows,
      // resize_intent);
      resize_intent = 0;
    }

    if (write_intent > 0) {

      // printf("dbg: %i %i %i %i %i\n", read_intent, write_intent, new_intent,
      //        read_nbytes, write_nbytes);
      // printf("%d\n", __LINE__);
      int pty_index = write_intent - 1;

      int in_count = write_nbytes;

      // pty_t *pty = ptys + pty_index * sizeof(pty_t);

      char *shared_in_buffer = malloc(in_count);
      // this is the buffer that will now be written to by the host after this

      uintptr_t buffer_phys_addr;
      virt_to_phys_user(&buffer_phys_addr, pid, (uintptr_t)shared_in_buffer);

      fprintf(fi, "\005w %lu\n", buffer_phys_addr);
      wait_for_ack(fo);
      write(ptys[pty_index].master, shared_in_buffer, in_count);
      free(shared_in_buffer);
      // write_intent = 0;
    }
    if (new_intent > 0) {
      printf("%d\n", __LINE__);
      char *argstr = getl(fo); // this one is used to flush the newline.
                               // not good practice but i don't really care
      free(argstr);
      argstr = getl(fo);

      char *argv[] = {"/bin/bash", "-c", argstr, NULL};

      ptys = realloc(ptys, (num_ptys + 3) * sizeof(pty_t));

      alloc_aty(&ptys[num_ptys], argv, NULL);
      printf("SDJKASDBJK: %i: %i\n", ptys[num_ptys].master,
             ptys[num_ptys].slave);
      free(argstr);

      // don't know why but the kernel loves to rearrange addrs after realloc()

      virt_to_phys_user(&read_intent_phys_addr, pid, (uintptr_t)&read_intent);
      virt_to_phys_user(&write_intent_phys_addr, pid, (uintptr_t)&write_intent);
      virt_to_phys_user(&new_intent_phys_addr, pid, (uintptr_t)&new_intent);
      virt_to_phys_user(&read_nbytes_phys_addr, pid, (uintptr_t)&read_nbytes);
      virt_to_phys_user(&write_nbytes_phys_addr, pid, (uintptr_t)&write_nbytes);

      virt_to_phys_user(&s_rows_phys_addr, pid, (uintptr_t)&s_rows);
      virt_to_phys_user(&s_cols_phys_addr, pid, (uintptr_t)&s_cols);
      virt_to_phys_user(&resize_intent_phys_addr, pid,
                        (uintptr_t)&resize_intent);
      fprintf(fi, "\005i %lu %lu %lu %lu %lu %lu %lu %lu\n",
              read_intent_phys_addr, write_intent_phys_addr,
              new_intent_phys_addr, read_nbytes_phys_addr,
              write_nbytes_phys_addr, s_rows_phys_addr, s_cols_phys_addr,
              resize_intent_phys_addr);
      wait_for_ack(fo);
      // while (1) {
      printf("ASDJKASDBJK: %i: %i\n", ptys[num_ptys].master,
             ptys[num_ptys].slave);
      // usleep(5000000);
      // }
      //
      fprintf(fi, "\005n %i\n", num_ptys);
      wait_for_ack(fo);

      num_ptys += 1;
      new_intent = 0;
    }
    // printf("%d\n", __LINE__);

    fprintf(fi, "\005v\n");
    wait_for_ack(fo);
  }
}
