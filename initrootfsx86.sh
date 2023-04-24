#!/bin/bash
if [ $EUID -ne 0 ]; then
  echo "need root :("
  exit
fi
debootstrap --verbose --arch i386 stable rootfs/
cp symlinks rootfs/symlinks
./unfuck_symlinks.sh

chown -R ${SUDO_USER:-$USER} .
echo "anura:x:1000:0::/home:/bin/bash" >> rootfs/etc/passwd

mkdir rootfs/data
