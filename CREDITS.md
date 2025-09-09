# Credits

- Contributors
  - Project Name: @ember3141
  - Project Maintainers:
    - @ProgrammerIn-wonderland
    - @Endercass
    - @Percslol
  - Large contributors
    - @CoolElectronics
    - @r58playz
    - @MadjikDotPng
    - @BomberFish

  - A full list of contributors can be found [here](https://github.com/MercuryWorkshop/anuraOS/graphs/contributors)

- Libraries and applications sources
  - Filesystem base - [Filer.js](https://filer.js.org/)
    - Formerly the only filesystem library used in the project, now the default filesystem library and the base of the Anura Filesystem API
  - MIME type detection - [mime-db](https://github.com/broofa/mime)
  - Service Worker <-> Main Thread communication - [Comlink](https://github.com/GoogleChromeLabs/comlink)
  - Service worker library - [Workbox](https://developers.google.com/web/tools/workbox)
  - Anura Shell is a heavily modified version of [Puter's Phoenix Shell](https://github.com/HeyPuter/phoenix)
    - This shell was implemented so that Anura users could have a more traditional shell experience, and if they had experience with Puter's Phoenix Shell, they could easily transfer that knowledge to Anura.
    - Replaces the original Anura Shell, which was a modified eval-based shell.
  - JS Framework - [dreamland.js](https://github.com/MercuryWorkshop/dreamlandjs)
  - TCP Networking support [wisp-server-node](https://github.com/MercuryWorkshop/wisp-server-node)
  - x86 Emulation - [v86](https://copy.sh/v86/)
  - Service worker web proxy - [Ultraviolet](https://github.com/titaniumnetwork-dev/Ultraviolet)
  - Material Components - [Matter CSS](https://github.com/finnhvman/matter)
  - Default networking stack- [libcurl.js with WolfSSL](https://github.com/ading2210/libcurl.js)
  - A full list of dependencies can be found [here](https://github.com/MercuryWorkshop/anuraOS/network/dependencies)

- Retired Libraries and applications sources
  - Old Websocket to TCP Bridge - [WSProxy](https://github.com/herenow/wsProxy)
  - Old Filesystem HTTP bridge - [MercuryWorkshop Nohost](https://github.com/MercuryWorkshop/nohost) (Fork of [Humphd Nohost](https://github.com/humphd/nohost))
    - Now the functionality is provided by a fully rewritten version of the original code, using the Anura Filesystem API
  - VNC Client [noVNC](https://github.com/novnc/noVNC)
    - No longer vendored in this repository, moved to the [Anura App Repository](https://github.com/MercuryWorkshop/anura-repo)
  - SSH Client [sshy](https://github.com/stuicey/SSHy)
    - No longer vendored in this repository, moved to the [Anura App Repository](https://github.com/MercuryWorkshop/anura-repo)

- Code snippets used

  Note: This list is non-exhaustive and may not contain all of the code snippets used in production of this software.
  - [original base](https://gist.github.com/chwkai/290488)
  - Resizable Table columns in fsapp [codepen](https://codepen.io/adam-lynch/pen/GaqgXP)
  - [Calendar panel](https://www.geeksforgeeks.org/how-to-design-a-simple-calendar-using-javascript/)

- Design & Assets
  - UI design inspiration - [Google ChromeOS](https://www.google.com/chromebook/chrome-os/)
  - Various icons - [papirus icon theme](https://github.com/PapirusDevelopmentTeam/papirus-icon-theme)
  - Various assets - [Google ChromeOS](https://www.google.com/chromebook/chrome-os/)
