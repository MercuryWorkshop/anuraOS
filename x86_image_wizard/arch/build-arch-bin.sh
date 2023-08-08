#!/usr/bin/env bash
set -veu

IMAGES="$(dirname "$0")"/../../build/images
OUT_ROOTFS_TAR="$IMAGES"/arch-rootfs.tar
OUT_ROOTFS_BIN="$IMAGES"/arch-rootfs.bin
OUT_ROOTFS_MNT="$IMAGES"/arch-rootfs.mntpoint
CONTAINER_NAME=arch-full
IMAGE_NAME=ljmf00/archlinux:latest
DEBUG_MODE=true

rm -rf "$IMAGES/arch-boot" || :
rm -rf "$IMAGES/arch-rootfs" || :
rm -rf "$IMAGES/arch-rootfs.bin" || :
cp ../anurad.c .
cp ../xfrog.sh .
cp ../xsetrandr.sh .

if [ "${DEBUG_MODE}" = "true" ]; then
    read -n 1 -s -r -p "Press any key to continue (build images)"
fi

mkdir -p "$IMAGES"
docker pull "$IMAGE_NAME"
docker build . --platform linux/386 --no-cache --rm --tag "$IMAGE_NAME"
docker rm "$CONTAINER_NAME" || true
docker create --platform linux/386 -t -i --name "$CONTAINER_NAME" "$IMAGE_NAME" bash

docker export "$CONTAINER_NAME" > "$OUT_ROOTFS_TAR"
dd if=/dev/zero "of=$OUT_ROOTFS_BIN" bs=512M count=4

if [ "${DEBUG_MODE}" = "true" ]; then
    read -n 1 -s -r -p "Press any key to continue (mounting drives)"
fi

loop=$(sudo losetup -f)
sudo wipefs -a "$loop"
sudo losetup -P "$loop" "$OUT_ROOTFS_BIN"
sudo mkfs.ext4 "$loop"
mkdir -p "$OUT_ROOTFS_MNT"
sudo mount "$loop" "$OUT_ROOTFS_MNT"

sudo tar -xf "$OUT_ROOTFS_TAR" -C "$OUT_ROOTFS_MNT"

sudo cp -r "$OUT_ROOTFS_MNT/boot" "$IMAGES/arch-boot"

if [ "${DEBUG_MODE}" = "true" ]; then
    read -n 1 -s -r -p "Press any key to continue (unmounting and cleaning up)"
fi

sudo umount -R "$OUT_ROOTFS_MNT"
sudo losetup -d "$loop"
rm "$OUT_ROOTFS_TAR"
rm -rf "$OUT_ROOTFS_MNT"
rm anurad.c
rm xfrog.sh
rm xsetrandr.sh

echo "done! created"
sudo chown -R $USER:$USER $IMAGES/arch-boot
cd "$IMAGES"
mkdir -p arch-rootfs
split -b50M arch-rootfs.bin arch-rootfs/
cd ../
find images/arch-rootfs/* | jq -Rnc "[inputs]"
