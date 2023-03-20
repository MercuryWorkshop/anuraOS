#!/bin/bash
debootstrap --verbose --arch i386 stable public/
cd public
ls > index.list
find . -type d -exec bash -c "cd '{}' && ls > index.list" \;
