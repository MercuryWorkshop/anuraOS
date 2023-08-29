#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include "userdma.c"
#include "pack.c"

int main(int argc, char *argv[]){

    Display *dpy;
    Window root_window;
    dpy = XOpenDisplay(0);

    root_window = XRootWindow(dpy, 0);

    uintptr_t physaddr;
    uint32_t comm = 6553610;
    virt_to_phys_user(&physaddr, getpid(), (uintptr_t)&comm);
    printf("%lu\n",physaddr);
    fflush(stdout);
    // Insert some way to send the physical address here
    while (1) {
        uint32_t* coords = unpack(comm);
        XWarpPointer(dpy, None, root_window, 0, 0, 0, 0, coords[0], coords[1]);
        XFlush(dpy);
        uint32_t oldcomm = comm;
        usleep(30000);
        while(oldcomm == comm) {
          usleep(10000);
        }
    }

    
    return 0;
  }
