# So, you want to set up your own v86 rootfs?

-   step 1. make the rootfs
    for debian, you can start with debian/build-debian-bin.sh
-   step 2. init the ram fs
    go into ../src/v86.ts and set bzImage and initrd
-   step 3. anurad
    chroot into your rootfs, compile anurad.c and place it at /bin/anurad
    make sure whatever your init system is, it mounts host9p and runs anurad>/dev/ttyS0
-   step 4. upload your rootfs
    file2()
