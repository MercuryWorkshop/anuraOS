#!/bin/bash
debootstrap --verbose --arch i386 stable public/
cd public
ls > index.list
find . -maxdepth 1 -type d \( ! -name . \) -exec bash -c "cd '{}' && ls > index.list" \;
