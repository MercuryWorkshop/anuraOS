#!/bin/bash
if [ $EUID -ne 0 ]; then
  echo "need root :("
  exit
fi
debootstrap --verbose --arch i386 stable rootfs/
cp symlinks rootfs/symlinks
./unfuck_symlinks.sh

sudo chown -R ${SUDO_USER:-$USER} .
