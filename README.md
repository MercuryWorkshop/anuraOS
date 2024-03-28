![AnuraOS logo](/assets/logo_dark.png#gh-light-mode-only)
![AnuraOS logo](/assets/logo_light.png#gh-dark-mode-only)

The next-gen webOS and development environment with full Linux emulation.

---

## What is AnuraOS?

An entirely local browser-based "OS" and development environment with complete graphical Linux emulation, visually based on ChromiumOS. See a demo [here](https://anura.pro), fully in your browser.

> [!WARNING]  
> Due to numerous issues with its implementation of certain web standards, Firefox is not supported on Anura.
> Please use a Chromium-based browser or you will have a significantly diminished user experience.
>
> Safari is also fully compatible, as long as you have macOS Sonoma, or iOS/iPadOS 17 or later.

Anura uses the features of a PWA (Progressive Web App) to make its environment work fully offline, providing a virtual filesystem (synced with the Linux emulator), a code editor, and a modular and extensible app system. You can even edit Anura's code live while inside of it!

Anura shows as more of a proof-of-concept with what's possible on the modern web rather than an actual product. However, it proves useful in many actual cases and is a useful educational tool.
![](/assets/showcase1.gif)

## Development

> [!IMPORTANT]  
> Anura will not build on Windows. Please use a Linux VM or WSL.

### Easy Install for GitHub Codespaces

-   Run `bash codespace-basic-setup.sh`

> [!NOTE]
>
> -   If you are not in a codespace skip to the regular installation steps.
> -   This does NOT build RootFS.

### Dependencies

-   Recent versions of `node.js` and `npm`
-   `wget`
-   A recent version of `java`
-   `inotifytools`
-   `rustup`
-   `make`
-   `gcc` (or any other C compiler)

> [!NOTE]
> You will have to install the required Rust toolchain by running `rustup target add wasm32-unknown-unknown`.

#### Building

-   Clone the repository with `git clone --recursive https://github.com/MercuryWorkshop/anuraOS`
-   Then, `make all`

> [!TIP]
> You can use `make all -B` instead if you want to force a full build.

### Building the Linux RootFS

-   Make sure you have `Docker` installed and running.
-   Run `make rootfs`
-   Make sure to add yourself to the Docker group using `usermod -a -G docker $USER`
-   (Special Use Case) In the event that you should need to override/manually add the initrd and kernel, remember to keep track of the file names of initrd and vmlinuz in build/images/(rootfs)-boot/. Then, copy them to the Anura root directory and rename them to initrd.img and bzimage respectively.(See the extended instructions [here](./documentation/Kernel_Override.md).)

### Running Anura Locally

You can run Anura with the command

```sh
make server
```

Or, run authenticated with

```sh
cd server
npm start -- --auth
```

Anura should now be running at `localhost:8000`.

## App Development

App development is highly encouraged! Good apps can even be added to the official workstore after review by an AnuraOS maintainer. Apps are stored in .app files which are read by AnuraOS to provide you, well, an app!

For more information about developing an AnuraOS app visit [here](./documentation/appdevt.md).

## Documentation

Still being written. (See the current index of documentation [here](./documentation/README.md))

## Security

See [SECURITY.md](./SECURITY.md) for reporting instructions.

## Credits

AnuraOS is created by [Mercury Workshop](https://mercurywork.shop). Linux emulation is based off of the [v86](https://github.com/copy/v86) project. For more credits, see [CREDITS.MD](./CREDITS.md).

(p.s. for hackers: the entrypoint to anura is [src/Boot.tsx](./src/Boot.tsx))
