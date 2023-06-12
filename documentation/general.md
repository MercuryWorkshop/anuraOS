# Getting started

Users: setup
To run
`make bundle`
`cd server; npx ts-node server.ts # sudo: Docker is not installed for non-root users.`


To set up before running
make sure you clone with --recursive!!!
You need to have `rustup` and run the command: `rustup target add wasm32-unknown-unknown`
`mkdir build/`
`mkdir build/lib`
`yay -S typescript` (for tsc)
`make all`

ROOTFS
Make sure Docker is installed and running.
`sudo make rootfs`
Keep track of the file names of initrd and vmlinuz in build/images/debian-boot/. Then, edit src/v86.ts to edit the url of those two tools to have those file names.

To set up (client)
NOTE: The login is `root:root`.
Select the debian rootfs. build/images/debian-rootfs.bin
TODO FIX: set up rootfs by entering in the JS console: `await loadfile(document.all.input.files[0])`
Once the console prints `1` and the call returns `undefined`, reload the page.
Wait for the Debian machine to boot.
Open Terminal (second app in the shelf) and type `anura-boot.sh`. Wait for it to print `forked to background`.
