#!/usr/bin/env bash
set -veu

IMAGES="$(dirname "$0")"/../../build/images
OUT_ROOTFS_TAR="$IMAGES"/debian-rootfs.tar
OUT_ROOTFS_BIN="$IMAGES"/debian-rootfs.bin
OUT_ROOTFS_MNT="$IMAGES"/debian-rootfs.mntpoint
CONTAINER_NAME=debian-full
IMAGE_NAME=i386/debian-full

rm -rf "$IMAGES/debian-boot" || :
cp ../anurad.c .

mkdir -p "$IMAGES"
docker build . --platform linux/386 --rm --tag "$IMAGE_NAME"
docker rm "$CONTAINER_NAME" || true
docker create --platform linux/386 -t -i --name "$CONTAINER_NAME" "$IMAGE_NAME" bash

docker export "$CONTAINER_NAME" > "$OUT_ROOTFS_TAR"
dd if=/dev/zero "of=$OUT_ROOTFS_BIN" bs=512M count=10

loop=$(sudo losetup -f)
sudo losetup -P "$loop" "$OUT_ROOTFS_BIN"
sudo mkfs.ext4 "$loop"
mkdir -p "$OUT_ROOTFS_MNT"
sudo mount "$loop" "$OUT_ROOTFS_MNT"

sudo tar -xf "$OUT_ROOTFS_TAR" -C "$OUT_ROOTFS_MNT"

cp -r "$OUT_ROOTFS_MNT/boot" "$IMAGES/debian-boot"

sudo umount "$loop"
sudo losetup -d "$loop"
rm "$OUT_ROOTFS_TAR"
rm -rf "$OUT_ROOTFS_MNT"
rm anurad.c

echo "done! created"
