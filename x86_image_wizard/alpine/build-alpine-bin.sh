#!/usr/bin/env bash
set -veu

if [ -w /var/run/docker.sock ]
then
    echo true
else 
    echo "You aren't in the docker group, please run usermod -a -G docker $USER && newgrp docker"
    exit 2
fi
# good for debugging
pause() {
    while read -r -t 0.001; do :; done
    read -n1 -rsp $'Press any key to continue or Ctrl+C to exit...\n'
}

IMAGES="$(dirname "$0")"/../../build/x86images
OUT_ROOTFS_TAR="$IMAGES"/alpine-rootfs.tar
OUT_ROOTFS_BIN="$IMAGES"/alpine-rootfs.bin
OUT_ROOTFS_MNT="$IMAGES"/alpine-rootfs.mntpoint
CONTAINER_NAME=alpine-full
IMAGE_NAME=i386/alpine-full

rm -rf "$IMAGES/alpine-boot" || :
rm -rf "$IMAGES/alpine-rootfs" || :
rm -rf $OUT_ROOTFS_BIN || :
cp ../xfrog.sh .
cp ../xsetrandr.sh .
cp -r ../anuramouse .
cd ../twisp; RUSTFLAGS="-C target-feature=+crt-static" cargo +nightly b -r --target i686-unknown-linux-gnu --no-default-features; cp target/i686-unknown-linux-gnu/release/twisp ../alpine/;
cd ../alpine;

mkdir -p "$IMAGES"
docker build . --platform linux/386 --rm --tag "$IMAGE_NAME"
docker rm "$CONTAINER_NAME" || true
docker create --platform linux/386 -t -i --name "$CONTAINER_NAME" "$IMAGE_NAME" bash

docker export "$CONTAINER_NAME" > "$OUT_ROOTFS_TAR"
dd if=/dev/zero "of=$OUT_ROOTFS_BIN" bs=512M count=2

loop=$(sudo losetup -f)
sudo losetup -P "$loop" "$OUT_ROOTFS_BIN"
sudo mkfs.ext4 "$loop"
mkdir -p "$OUT_ROOTFS_MNT"
sudo mount "$loop" "$OUT_ROOTFS_MNT"

sudo tar -xf "$OUT_ROOTFS_TAR" -C "$OUT_ROOTFS_MNT"
sudo rm -f "$OUT_ROOTFS_MNT/.dockerenv"
sudo cp resolv.conf "$OUT_ROOTFS_MNT/etc/resolv.conf"
sudo cp hostname "$OUT_ROOTFS_MNT/etc/hostname"

sudo cp -r "$OUT_ROOTFS_MNT/boot" "$IMAGES/alpine-boot"
sudo umount "$loop"
sudo losetup -d "$loop"
rm "$OUT_ROOTFS_TAR"
rm -rf "$OUT_ROOTFS_MNT"
rm xfrog.sh
rm xsetrandr.sh
rm twisp
rm -rf whisper
rm -rf anuramouse

echo "done! created"
sudo chown -R $USER:$USER $IMAGES/alpine-boot
cd "$IMAGES"
mkdir -p alpine-rootfs
split -b50M alpine-rootfs.bin alpine-rootfs/
cd ../
find x86images/alpine-rootfs/* | jq -Rnc "[inputs]"