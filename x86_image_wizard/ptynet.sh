#!/bin/bash

while true; do
  read url
  curl -s -D - -o /dev/stdout $url | base64
  echo -en "\x03\n";
done
