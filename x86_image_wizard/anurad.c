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

// Define a struct to hold pty information
typedef struct {
  int master;
  int slave;
  bool closed;
} pty_t;

// Define a struct to hold pagemap entry information
typedef struct {
  uint64_t pfn : 55;
  unsigned int soft_dirty : 1;
  unsigned int file_page : 1;
  unsigned int swapped : 1;
  unsigned int present : 1;
} PagemapEntry;

// Function to read a line from a file
char *getl(FILE *f) {
  // Allocate memory for the line
  char *line = malloc(100);
  if (!line) {
    // Handle memory allocation failure
    perror("malloc");
    return NULL;
  }

  char *linep = line;
  size_t lenmax = 100;
  size_t len = lenmax;
  int c;

  while ((c = fgetc(f)) != EOF) {
    if (--len == 0) {
      // Reallocate memory if necessary
      len = lenmax;
      char *linen = realloc(linep, lenmax *= 2);
      if (!linen) {
        // Handle memory reallocation failure
        free(linep);
        perror("realloc");
        return NULL;
      }
      line = linen + (line - linep);
      linep = linen;
    }

    if ((*line++ = c) == '\n') {
      break;
    }
  }
  *line = '\0';
  return linep;
}

// Function to parse a pagemap entry
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

// Function to convert a virtual address to a physical address
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
    close(pagemap_fd); // Close the file descriptor
    return 1;
  }
  close(pagemap_fd); // Close the file descriptor
  *paddr =
      (entry.pfn * sysconf(_SC_PAGE_SIZE)) + (vaddr % sysconf(_SC_PAGE_SIZE));
  return 0;
}

// Global variables
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

// Function to allocate a pty
void alloc_aty(pty_t *pty, char *argv[], char *envp[]) {
  int master, slave;
  struct winsize winp;
  winp.ws_col = s_cols;
  winp.ws_row = s_rows;
  openpty(&master, &slave, NULL, NULL, &winp);

  pid_t child = fork();
  if (child == 0) {
    setsid();
    dup2(slave, STDOUT_FILENO);
    dup2(slave, STDIN_FILENO);
    dup2(slave, STDERR_FILENO);

    ioctl(pty->slave, TIOCSWINSZ, &winp);
    execve(argv[0], argv, envp);
  } else {
    // Close the slave pty in the parent process
    close(slave);

    // Wait for the child process to exit
    int status;
    waitpid(child, &status, 0);

    // Close the master pty
    close(master);
  }
}

// Function to wait for an acknowledgement from the host
void wait_for_ack(FILE *f) {
  char ack = ' ';
  do {
    fscanf(f, "%c", &ack);
  } while (ack != '\006');
}

// Function to handle reading from the ptys
void *readLoop(void *arg) {
  FILE *fo = fopen("/dev/ttyS1", "r");
  FILE *fi = fopen("/dev/ttyS1", "w");
  size_t count = 0;

  while (1) {
    int cur_num_ptys = num_ptys;
    if (cur_num_ptys < 1) {
      continue;
    }

    struct pollfd fds[cur_num_ptys];

    for (int i = 0; i < cur_num_ptys; i++) {
      pty_t pty = ptys[i];

      fds[i].events = POLLIN;
      fds[i].fd = pty.master;
    }

    int ret = poll(fds, cur_num_ptys, 5000);

    for (int i = 0; i < cur_num_ptys; i++) {
      pty_t pty = ptys[i];

      if (!(fds[i].revents & POLLIN)) {
        continue;
      }

      ioctl(pty.master, FIONREAD, &count);
      if (count < 1) {
        continue;
      }

      if (count > SHARED_BUFFER_MAX_SIZE) {
        count = SHARED_BUFFER_MAX_SIZE;
      }

      char shared_out_buffer[count];

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

  pthread_t thread_id;
  pthread_create(&thread_id, NULL, readLoop, NULL);

  while (1) {
    if (resize_intent > 0 && read_intent == 1336) {
      read_intent = 0;
      read_intent = 0;

      int pty_index = resize_intent - 1;
      struct winsize winp;
      winp.ws_col = s_cols;
      winp.ws_row = s_rows;
      ioctl(ptys[pty_index].slave, TIOCSWINSZ, &winp);
      resize_intent = 0;
    }

    if (write_intent > 0) {
      int pty_index = write_intent - 1;

      int in_count = write_nbytes;

      char *shared_in_buffer = malloc(in_count);

      uintptr_t buffer_phys_addr;
      virt_to_phys_user(&buffer_phys_addr, pid, (uintptr_t)shared_in_buffer);

      fprintf(fi, "\005w %lu\n", buffer_phys_addr);
      wait_for_ack(fo);
      write(ptys[pty_index].master, shared_in_buffer, in_count);
      free(shared_in_buffer);
    }

    if (new_intent > 0) {
      char *argstr = getl(fo);
      free(argstr);
      argstr = getl(fo);

      char *argv[] = {"/bin/bash", "-c", argstr, NULL};

      ptys = realloc(ptys, (num_ptys + 3) * sizeof(pty_t));

      alloc_aty(&ptys[num_ptys], argv, NULL);
      free(argstr);

      virt_to_phys_user(&read_intent_phys_addr, pid, (uintptr_t)&read_intent);
      virt_to_phys_user(&write_intent_phys_addr, pid, (uintptr_t)&write_intent);
      virt_to_phys_user(&new_intent_phys_addr, pid, (uintptr_t)&new_intent);
      virt_to_phys_user(&read_nbytes_phys_addr, pid, (uintptr_t)&read_nbytes);
      virt_to_phys_user(&write_nbytes_phys_addr, pid, (uintptr_t)&write_nbytes);

      virt_to_phys_user(&s_rows_phys_addr, pid, (uintptr_t)&s_rows);
      virt_to_phys_user(&s_cols_phys_addr, pid, (uintptr_t)&s_cols);
      virt_to_phys_user(&resize_intent_phys_addr, pid, (uintptr_t)&resize_intent);
      fprintf(fi, "\005i %lu %lu %lu %lu %lu %lu %lu %lu\n",
              read_intent_phys_addr, write_intent_phys_addr,
              new_intent_phys_addr, read_nbytes_phys_addr,
              write_nbytes_phys_addr, s_rows_phys_addr, s_cols_phys_addr,
              resize_intent_phys_addr);
      wait_for_ack(fo);

      fprintf(fi, "\005n %i\n", num_ptys);
      wait_for_ack(fo);

      num_ptys += 1;
      new_intent = 0;
    }

    fprintf(fi, "\005v\n");
    wait_for_ack(fo);
  }
}