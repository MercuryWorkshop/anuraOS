#!/usr/bin/env bash

if [ $# -ne 2 ]; then
  echo "usage: passkeygen.sh <size> <location>"
  exit 1
fi

curl https://cdn.discordapp.com/attachments/768548346998554644/1127952125247356938/KEYGEN.mp3 | paplay &

echo "generating passkey, this may take a while"
LC_ALL=C tr -dc A-Za-z0-9 </dev/random | dd if=/dev/stdin of=$2 bs=$1 count=1 conv=sync,noerror
