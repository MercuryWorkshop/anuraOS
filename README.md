# AnuraOS

WebOS complete with v86 integration and a minimal yet capable desktop enviroment.
Formerly known as Chimera. Based off of the AliceWM.

### Easy Install(When in a codespace)

-   Run `bash codespace-basic-setup.sh`

**NOTE**: If you are not in a codespace skip to the regular installation steps.

**NOTE**: This does NOT build RootFS.

### Installation

-   Make sure you have `rustup` and run the command: `rustup target add wasm32-unknown-unknown`
-   You also need to have a C compiler, inotifytools and a decent version of java installed
-   Clone the repository with `git clone --recursive`
-   Then, `make all`

*   NOTE: You can use `make all -B` instead if you want to force a full build.

### Building ROOTFS

-   Make sure you have `Docker` installed and running.
-   Run `make rootfs`
-   Make sure to add yourself to the Docker group using `usermod -a -G docker $USER`
-   (Special Use Case) In the event that you should need to override/manually add the initrd and kernel, remember to keep track of the file names of initrd and vmlinuz in build/images/debian-boot/. Then, copy them to the Anura root directory and rename them to initrd.img and bzimage respectively.(See the extended instructions [here](documentation/Kernel%20Override.md).)

### Running Anura

You can run anura with the command

```sh
make server
```

Or, run authenticated with

```sh
cd server
npm start -- --auth
```

## After Installation

**NOTE**: The login for rootfs images is `root:root`.

**NOTE**: Anura uses recent web technologies, and is unstable in Gecko. Chromium is **strongly recommended** as it has seen the best results.

-   If you started the server, Anura should be running at `localhost:8000`.
-   Select the Debian rootfs. If you built it from this repository, its location is `./build/images/debian-rootfs.bin`.
-   Set up rootfs by entering `await loadfile(document.all.input.files[0])` in your console.

## Changelog

Will be utilized after the first Build of AnuraOS.

## Documentation

Still being written.(See documentation folder)

<sub>
The AnuraOS Team and Mercury Workshop are both not liable to any loss of braincells and maybe even your sanity after working with this product.
</sub>
