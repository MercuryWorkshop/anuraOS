# anuraOS
Web OS with v86 integration

## Getting Started

### Installation
- make sure you clone with --recursive!!!
- You need to have `rustup` and run the command: `rustup target add wasm32-unknown-unknown`
- `make bootstrap`
- `make all`
 * NOTE: you can use `make all -B` to force a full build.

### Building rootfs
- Make sure Docker is installed and running.
- `make rootfs`, Make sure to add yourself to the docker group: usermod -a -G docker $USER
- Keep track of the file names of initrd and vmlinuz in build/images/debian-boot/. Then, edit src/v86.ts to edit the `url` of those two tools to have those file names.

### Run
```sh
make bundle
cd server
npx ts-node server.ts 
```

## Post-installation (client)
**NOTE**: The login for rootfs images is `root:root`.

- Visit `localhost:8000` in your browser. **NOTE**: anuraOS uses the latest web technologies, and is unstable in Gecko. Chromium is **strongly recommended**
- Select the debian rootfs. If you built it from this repository, its location is `./build/images/debian-rootfs.bin`.
- Set up rootfs by entering in the JS console: `await loadfile(document.all.input.files[0])`
 * Once the console prints `1` and the command returns `undefined`, reload the page.
 * If you ever need to update your rootfs image, clear the webpage cache and indexedDB database.
- Wait for the Debian machine to boot completely (a prompt for `localhost login:`)
- Open Terminal (second app in the shelf) and type `dhcpcd`. Wait for it to print `forked to background`.
