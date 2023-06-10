# Getting started

To set up an anuraOS instance, you must first install nodejs, ts-node, and debootstrap, rustup, and wasm32, and also make sure you have cloned the required repos.

Run `npm install` in both the root of the repo and in /server/.

Run `make all` for first time setup and `make rootfs` to setup v86 and the terminal app 

Run `make bundle` after every change to rebuild the files and apply changes.

Finally cd in to server/ and run `npx ts-node server.ts`
