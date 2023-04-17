# Satan: My child will create a permanent solution to the problem
# Jesus:

if [ $EUID -ne 0 ]; then
  echo "need root :("
  exit
fi
chroot rootfs /bin/bash -c "./symlinks -cr ."
