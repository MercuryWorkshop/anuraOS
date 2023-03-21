if [ $EUID -ne 0 ]; then
  echo "need root :("
  exit
fi
chroot rootfs /bin/bash -c "./symlinks -cr ."
