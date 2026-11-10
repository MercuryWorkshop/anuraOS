# @gex/runtime

Linux programs in a web page: a kernel, the programs it runs, and their files.
A page builds a `System`, gives it a filesystem, boots it, and runs programs in
it with a terminal or with pipes. Windows, persistence, network, sound and GL
are parts of their own, each a class that takes the system as its first
argument.

```js
import { System } from "@gex/runtime";
import { Filesystem } from "@gex/runtime/fs";

const sys = new System();
const fs = new Filesystem(sys);
fs.addTar("/trees/base.tar.zst");
await sys.boot();

const { code, stdout } = await sys.run(["uname", "-a"]);

const sh = sys.spawn(["bash", "-l"], {
	pty: { cols: 80, rows: 24 },
	env: { TERM: "xterm-256color" },
});
sh.pty.addEventListener("data", (e) => term.write(e.data));
term.onData((d) => sh.pty.write(d));
```

## In a web desktop

How a web desktop (AnuraOS, say) runs Linux and Windows programs through
the runtime. Its windows go to the desktop's own window manager, and its root
stays across loads. Each step is one of the parts below; the reference sections
say the rest.

**Serve it.** Import the package from the desktop's code, through its bundler
or served as it is, from the desktop's own origin. Every page that makes a system must be served with
`Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp`. Anything the page loads from
another origin (an iframe, an image) then needs CORP or CORS. Keep one
`System` for the desktop's life: a page has one.

**Give it a tree.** A root is one or more tars laid at `/`. A large tree
should be lazy: a list of files fetched from the desktop's origin when a program
first reads them, so boot fetches only what boot reads. A tree with an
aarch64 or x86-64 program gets that architecture beside wasm32 (see The
page). A Debian tree of wasm32 packages with arm64 beside them (as
debdemo builds one) runs apt as it comes, over the network below.

```js
import { System } from "@gex/runtime";
import { Filesystem } from "@gex/runtime/fs";
import { IdbPersist } from "@gex/runtime/persist/idb";
import { Wisp } from "@gex/runtime/net/wisp";
import { HostWindows } from "@gex/runtime/windows/host";

const sys = new System({ xcache: true }); // translated code kept across loads
const fs = new Filesystem(sys);
fs.addTar("/gex-trees/debian.tar.zst", { lazy: "/gex-trees/debian-lazy.json" });
new IdbPersist(fs, { db: "debian" }); // the root, kept
new Wisp(sys); // connections out (wss://anura.pro/)
const hw = new HostWindows(sys, { width: innerWidth, height: innerHeight });
await sys.boot();
```

**Keep the root.** The `IdbPersist` keeps what programs change (installed
packages, a home directory) and lays it back over the same tars at the next
load. The tars must be the same at every load, so give a new tree a new
`db`. Saves are a second after changes settle, every 30 s, and when the tab
is hidden: a desktop need not call `save()`, though it may before it unloads.
`/tmp`, `/run` and mounts are never kept.

**Terminals.** A terminal is a `spawn` with a `pty`; its `data` events go to the
desktop's terminal widget and its keys come back with `pty.write`. Resize
with `pty.resize(cols, rows)`. Nothing is inherited, so give every program its
`env`.

```js
const env = {
	PATH: "/usr/local/bin:/usr/bin:/bin",
	HOME: "/root",
	TERM: "xterm-256color",
	LANG: "C.UTF-8",
	...hw.env,
};
const sh = sys.spawn(["bash", "-l"], {
	pty: { cols: 80, rows: 24 },
	env,
	cwd: "/root",
});
sh.pty.addEventListener("data", (e) => term.write(e.data));
term.onData((d) => sh.pty.write(d));
sh.exited.then(() => closeTerminalWindow());
```

**Windows.** With `HostWindows`, each guest window, Wayland or X11, arrives
as a `window` event carrying a `GuestWindow`. Its `canvas` goes into one of
the desktop's frames:

- `decorations: 'host'`: the desktop draws the title bar (`title`, and the
  `title` event).
- `'client'`: the window draws its own (a Win32 window under Wine). Place it
  bare, where its `x` and `y` say when it is `placed`.
- Popups and subsurfaces are never framed: put them at `x`, `y` over their
  `parent`.

Then wire it to the desktop's window manager:

- **Moves:** after each move the frame makes, call `place(x, y)`.
- **Resizes:** forward them with `resize(w, h)` or `setStates(...)`, and size
  the frame on `resized`.
- **Close:** the frame's close button calls `close()`. Drop the frame on
  `closed`.
- **Client-side frames:** `request` events (`move`, `resize`, `maximize`,
  ...) are the window asking the desktop's manager to act.

An X11 program needs nothing more: `DISPLAY` is in `hw.env`, and the
runtime starts its X server for the first client. When the desktop's work
area changes, call `hw.setOutputSize(width, height)`.

**The desktop's files.** `fs.mount('/mnt/desktop', provider)` shows a
directory of the desktop's own filesystem to every program, while it runs
(Mounts says what a provider implements). A mount is the desktop's to keep:
persistence leaves it out.

**Calls out of the guest.** To let a program open a URL in the desktop's
browser, or show a notification, register a host call. A guest script then
uses it as `xdg-open` would.

```js
sys.hostCalls.register("open-url", ({ url }) => {
	openBrowserWindow(url);
	return true;
});
// guest: /usr/local/bin/xdg-open
//   exec 3<>/dev/gex-host; printf 'open-url\0{"url":"%s"}' "$1" >&3; cat <&3 > /dev/null
```

**Sound, GL, input.**

- Sound: make a `WebAudio` in the first click's handler. Browsers hold audio
  until a gesture.
- GL: a `MesaGl` made before boot gives programs OpenGL and Vulkan in their
  windows. Mesa is fetched when the first program opens GL.
- Input: `PointerLock`, `Clipboard` and `Gamepads` give programs a locked
  pointer, the browser's clipboard and controllers.

**Windows programs.** Wine is a tree too: its install (lazy: it is large)
and a prefix, laid beside the Linux tree. A Windows program is then
`wine 'C:\path\prog.exe'`, with `WINEPREFIX` naming the prefix. The
first Wine program starts Wine's server and the services Wine runs; the
next ones reuse them while they last. Its windows come as any other, framed by the program
itself (`decorations: 'client'`) and `placed`. Persistence keeps the
prefix's changes with the rest of the root. Each 64-bit Wine process takes a
memory of about 2 GiB (most of it reserved, not touched), so a desktop
running several Windows programs at once should expect the tab's address
space to reach well past 8 GiB.

**Start time.** `xcache: true` keeps translated code across loads in the
origin's private file system, so a second start of the same programs
translates little. `units` points a system at compiled function-tier units
for a tree's hot images (`gexc cgen-image`), which start at full speed with
no translation.

**What a desktop can see.** `state` and the system's events (`running`,
`console`, `stopped`) for a status area, and `describe()` for a task manager's
processes and memory.

## The page

- Programs run in Workers on a shared memory, so the page must be
  cross-origin isolated: `Cross-Origin-Opener-Policy: same-origin` and
  `Cross-Origin-Embedder-Policy: require-corp`.
- Install the package and import it; nothing else to do. The modules name
  each file the runtime fetches (`new URL('./…', import.meta.url)`) and each
  Worker (`new Worker(new URL('./…', import.meta.url), { type: 'module' })`),
  so the page's bundler takes them into its build as files, with no
  settings (vite and webpack 5 are tested), and vite 8's dev server serves
  them from `node_modules`. vite 7's dev server does not point a
  pre-bundled package's URLs back at it: there, the package fails to start
  unless it is left out of pre-bundling
  (`optimizeDeps: { exclude: ['@gex/runtime'] }`); vite 7's build works as
  it is. Every Worker is one file with no imports, so a bundler's default
  classic-script Workers build too. No file becomes a `data:` URL.
- Served without a bundler, from any directory, the modules find their
  files beside themselves. `new System({ baseUrl })` takes them from a
  directory of the page's instead, laid out as gex's own site has them
  (`gex/…`).
- One system per page: a second `new System()` throws.
- A system runs wasm32 programs (built with gexcc) and the programs of one
  translated architecture, x86-64 or aarch64, which it takes from the tree's
  programs at boot (`/bin/sh` first); aarch64 when the tree has none. The
  kernel is built for one, so this is fixed for the system's life: a program
  of the other one fails to start (`ENOEXEC`).
- Pid 1 is the kernel's own unless `boot` is given an init: no
  program runs as it. Each program `spawn` starts is its child, in a
  session of its own; a program whose parent ends is given to it, and its
  exit is collected in the kernel, as an init's would be. `getppid()` of
  either is 1, `/proc/1` names `init`, and a signal sent to pid 1 is
  ignored.
- With an init (`await sys.boot(['/sbin/init'], opts)`, the arguments
  `spawn` takes), that program is pid 1 and owns the processes, as on
  Linux: it collects its children and the orphans given to it, and `spawn`
  throws. Without `env`, its environment is Linux's for an init, `HOME=/`
  and `TERM=linux`. The page reaches programs
  through what the init starts: terminals, windows, `/dev/gex-host`.
  `sys.init` is its `Process`. When it ends, the system stops, and
  `state.init` says how it ended.
- A page makes one `System` (a second throws), for now: the page runtime
  keeps its kernel and switches in page-wide state.
- Nothing runs at boot but the init. Without one, a tree's own start (its
  daemons) is the page's first `spawn`s, made once `boot()` resolves.

## System

| Member                                          | Does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new System({ baseUrl, units, xcache, debug })` | A system, not started; a page makes one. `units`: the URL of a directory of compiled function-tier units (a unit cache, as `gexc cgen-image` writes it); each image mapped at the base its unit was built for runs from it, the rest are translated as they run. `{ url, require: true }` makes a program image without one fail to start. `xcache: true` keeps the translated code across loads, in the origin's private file system (on the Node test host, the directory GEX_XCACHE_DIR names): the next load of the same runtime with the same switches starts with it, and code whose file changed since is translated again. `debug` holds the runtime's switches for debugging (`{ strace: 1 }`, `{ console: true }` to log the runtime's console); they are not a stable API. The runtime is quiet by default: the browser's console hears its errors and rare events, not a line per program started or library loaded; `debug: { log: '1' }` brings those back, `{ log: 'debug' }` adds the runtime's narration. |
| `boot(argv, opts)`                              | Starts the kernel and lays the filesystem's sources into its root. Parts that work before boot (the filesystem) must be made before it. With arguments, `spawn`'s, the program that is pid 1 (see above); without, pid 1 is the kernel's.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `spawn(argv, opts)`                             | Starts a program and returns its `Process` at once; throws when the system has an init. `opts`: `pty: { cols, rows, encoding }` for a terminal, else three pipes; `env` (`{K: V}` or `['K=V']`; nothing is inherited), `cwd`, `uid`, `gid`, `detached` (no terminal or pipes: output goes nowhere). The program is found on `env.PATH`, or in `/usr/local/bin:/usr/bin:/bin` and the `sbin`s.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `run(argv, opts)`                               | `spawn`, then `{ code, signal, stdout, stderr }` once it ends. `input` is written to its stdin; `encoding` (default `'utf-8'`, `null` for bytes). It reads both outputs as they come, so a program never waits on it. The output is what was written before the program ended: a daemon it started that still holds its pipes (a persistent server) does not keep `run` waiting.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `init`                                          | The init's `Process`, or null without one.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `state`                                         | `{ phase, error, console, init }`; phase is `new`, `booting`, `running`, `stopped` or `failed`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Events                                          | On the system itself (`sys.addEventListener`): `running` when it boots, `stopped` when it ends, `console` (`text`) for what the runtime says.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `describe()`                                    | `{ phase, arch, processes, pids, threads, memory }`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `shutdown()`                                    | Ends every program and the kernel.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

## Process

| Member                      | Does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pid`                       | Its pid once it runs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `started`                   | Resolves with the pid; rejects when the program could not start (`no such program`, with `errno`).                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `exited`                    | Resolves with `{ code, signal }`: a program killed by a signal has `signal` set (`'SIGTERM'`) and `code` 128 plus its number. An `exit` event too. Rejects as `started` does when the program never ran.                                                                                                                                                                                                                                                                                                               |
| `pty`                       | With a terminal: `write(data)` (a string or bytes, any size), `resize(cols, rows)` (the program hears `SIGWINCH`), and `data` events (bytes, or strings with an `encoding`).                                                                                                                                                                                                                                                                                                                                           |
| `stdin`, `stdout`, `stderr` | Without a terminal: a `WritableStream` and two `ReadableStream`s of bytes. The outputs are read from the program's pipes as the page reads the streams: a program whose output nobody reads waits when its pipe is full (64 KiB), as on Linux and in Node, and may never end. Read both, cancel one you do not want (the program then gets `EPIPE`, or `SIGPIPE`), or spawn it `detached`. A terminal's output is always read, into `data` events. An init (`boot(argv)`) has pipes too, unless `detached`: read them. |
| `kill(signal)`              | `'SIGTERM'` by default; a name or a number.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

## Filesystem

One per system. Before boot, it is the tars and files a page adds, laid one
over another in the order added (a later one wins). After boot, a tar or
files are written into the running tree.

| Member                                                                                                                                                   | Does                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addTar(src, { at, lazy })`                                                                                                                              | A tar (zstd or not) as bytes, a `Blob`, a `Response`, a stream or a URL, laid at `at` (default `/`). `lazy`: files fetched when first read, `[[path, size, url, mode], ...]` (mode optional, 0644 without) or the URL of such a list (JSON; or `{ base, files }`, each url relative to `base`); their URLs must be on the page's own origin and answer range requests. |
| `addFiles({ path: data }, { mode })`                                                                                                                     | Single files: bytes, a `Blob`, a URL, or a string (the file's text); `mode` default 0644.                                                                                                                                                                                                                                                                              |
| `readFile(path, { encoding })`                                                                                                                           | Bytes, or text with an `encoding`.                                                                                                                                                                                                                                                                                                                                     |
| `writeFile(path, data, { mode, append, exclusive })`                                                                                                     | Writes the file, made if missing.                                                                                                                                                                                                                                                                                                                                      |
| `stat(path, { follow })`                                                                                                                                 | `{ type, mode, size, ino, mtime, nlink }`; `follow: false` does not follow a last symlink.                                                                                                                                                                                                                                                                             |
| `readdir(path)`                                                                                                                                          | `[{ name, type }]`.                                                                                                                                                                                                                                                                                                                                                    |
| `mkdir(path, { recursive, mode })`, `rm(path, { recursive, force })`, `rename(from, to)`, `symlink(target, path)`, `readlink(path)`, `chmod(path, mode)` | As their commands.                                                                                                                                                                                                                                                                                                                                                     |
| `watch(path, fn)`                                                                                                                                        | `fn({ type, path })` for each change to a directory's entries or to a file, by a program or the page: `create`, `change` (a write finished), `attrib`, `delete`, `move-out` and `move-in` (one rename's halves share a `cookie`), and `gone` when `path` itself went. Returns a function that stops it.                                                                |

Errors carry `code` (`'ENOENT'`, ...) and `errno`.

### Mounts

`fs.mount(path, provider)` serves a directory from the page's own filesystem
(a desktop's files, OPFS, IndexedDB, the network), before boot or while the
system runs: every program sees it at once, those already running too, over
whatever the tree has there (back at `unmount`). It returns a `Mount`
(`path`, `ready`, `unmount()`, an `unmounted` event); `fs.unmount(path)` and
`fs.mounts()` too. A program's call on it waits for the provider's promise,
in its own thread only.

The provider's methods take paths inside it (`/`, `/a/b`), are async, and
throw errors with a `code` (`'ENOENT'`, `'EEXIST'`, ...) or an `errno`:

| Method                                                                                                                                    | Does                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `stat(path)`                                                                                                                              | `{ type: 'file' \| 'directory' \| 'symlink', size, mode, mtime (ms or a Date), ino }` (`mode`, `ino` optional) |
| `readdir(path)`                                                                                                                           | `[{ name, type }]`, or names (each is then stat'ed)                                                            |
| `open(path, { read, write, create, truncate, exclusive, append, mode })`                                                                  | A handle, any value, for the three below                                                                       |
| `read(handle, offset, length)`, `write(handle, offset, bytes)`, `close(handle)`                                                           | Bytes; a count                                                                                                 |
| `mkdir(path, mode)`, `unlink(path)`, `rename(from, to)`                                                                                   |                                                                                                                |
| `lstat`, `rmdir`, `truncate(path, length, handle)`, `chmod(path, mode)`, `utimes(path, mtime)`, `readlink(path)`, `symlink(target, path)` | Optional. Without `chmod` and `utimes` those calls succeed and change nothing; without the others they fail    |

A mount's own symlinks are not followed on the way through it, and a rename
or a hard link between it and the rest of the tree is `EXDEV` (`mv` copies).

## Persistence

The root, kept across page loads: a `Persist` on the filesystem, made
before boot, lays what it kept over the sources before the first
program, and keeps what the programs change from then on: about a second
after their changes settle, every 30 s, when the page is hidden or left,
and at `shutdown()`. Files, directories, symlinks, modes and deletions of
the sources' paths; never `/tmp`, `/proc`, `/sys`, `/dev`, `/run` or a
mount (its provider keeps its own). A snapshot reads only the files a
program wrote: a lazy file nobody wrote is never fetched for it.

```js
import { IdbPersist } from "@gex/runtime/persist/idb";
const persist = new IdbPersist(fs, { db: "my-tree" }); // before boot
await sys.boot();
```

| Member                                                  | Does                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `new IdbPersist(fs, { db, exclude, every, quiet })`     | Kept in the IndexedDB database `db`, one per tree. `exclude`: more paths never kept; `every` (ms, default 30000), `quiet` (default 1000).                                                                                                                                                                                                                                                                                |
| `new Persist(fs, store, opts)` (`@gex/runtime/persist`) | Kept by a store of the page's: `load()` resolves the records it holds, `store({ put, drop })` takes new records and the paths whose records go, `reset()` forgets them. A record is `{ path, kind, stamp }` and, by kind, `'file'` (`data`, `mode`, `mtime`), `'dir'` (`mode`), `'symlink'` (`target`), `'mode'` (a source file's mode), `'gone'` (a source path deleted, with all under it); a store keeps it as it is. |
| `save()`                                                | Store what changed now: `{ stored, dropped, bytes }`.                                                                                                                                                                                                                                                                                                                                                                    |
| `reset()`                                               | Forget what is kept; saving stops. The next load is the sources alone.                                                                                                                                                                                                                                                                                                                                                   |
| `stats`                                                 | `{ saves, stored, dropped, bytes, last, error }`.                                                                                                                                                                                                                                                                                                                                                                        |
| Events                                                  | `stored` (`stored`, `dropped`, `bytes`), `error`.                                                                                                                                                                                                                                                                                                                                                                        |

A tree's sources must be the same at every load: what is kept is laid over
them, path by path.

## Network

Where the guest's connections out go: one `Network` per system, made before
or after boot. Until there is one a program's connection fails as
unreachable. TCP only; a program's name lookups reach the network as the
name.

```js
import { Wisp } from "@gex/runtime/net/wisp";
new Wisp(sys); // wss://anura.pro/
// or, through another proxy (one network per system):
// new Wisp(sys, { url: 'wss://wisp.example/' });
```

| Member                                                           | Does                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new Wisp(sys, { url })` (`@gex/runtime/net/wisp`)               | Over a Wisp proxy, default `wss://anura.pro/`: one WebSocket, dialled again when it drops. Events `open`, `closed`.                                                                                                                                                                                                                                                  |
| `new Network(sys, { connect(host, port) })` (`@gex/runtime/net`) | The page's own: `connect` returns (or resolves) `{ readable, writable }`, a ReadableStream and a WritableStream of bytes; a throw or rejection refuses the connection. The page closing its readable ends the program's reads; the program closing its socket closes the writable. A program's `shutdown(SHUT_WR)` does not reach the page (Wisp has no half close). |
| `ready`                                                          | Resolves once connections go through it.                                                                                                                                                                                                                                                                                                                             |
| Events                                                           | `connect` (`host`, `port`).                                                                                                                                                                                                                                                                                                                                          |

Into the guest, `sys.net.connectGuest(port)` connects to what a program
listens on at `127.0.0.1:port`. It resolves `{ readable, writable, close() }`
and a `close` event; closing the writable is a half close, which the
program reads as the end. It rejects with `ECONNREFUSED` when nothing
listens.

## Host calls

The page's functions a guest program calls. A program opens
`/dev/gex-host`, writes `NAME`, a NUL and the JSON value (in one write or
several), then reads from the same descriptor to its end: a status byte, 0
when the function returned and 1 when it threw, then what it returned, as
JSON, or the error's text. The first read makes the call; each open is one
call, and many may be open at once.

```js
const off = sys.hostCalls.register("notify", ({ title }) => {
	showToast(title);
	return true;
});
// guest: exec 3<>/dev/gex-host; printf 'notify\0{"title":"built"}' >&3; cat <&3
//        -> "\0true"
```

| Member                        | Does                                                                      |
| ----------------------------- | ------------------------------------------------------------------------- |
| `register(name, fn)`          | `fn(value)` may return a promise. Returns a function that unregisters it. |
| `unregister(name)`, `names()` |                                                                           |

## Audio

What programs play on `/dev/dsp` (and ALSA, Pulse or Wine over it) comes
out of the page through an AudioWorklet once there is a `WebAudio`; until
then it is played to nobody at the wall clock's pace. Browsers start audio
only after a user gesture, so make it in a gesture's handler (or the first
pointer or key event after it resumes the context). One per system, made
any time.

```js
import { WebAudio } from "@gex/runtime/audio";
button.onclick = () => new WebAudio(sys);
```

| Member                           | Does                                                                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new WebAudio(sys, { latency })` | `latency`: the AudioContext's hint ('interactive', 'playback', or seconds).                                                                                         |
| `ready`, `context`               | Resolves once the player is set up; its AudioContext.                                                                                                               |
| `stats`                          | The player's last report (about twice a second): `backlog` (ms queued, `avg`, `min`, `max`), `base` and `output` (the context's latencies, ms), `rms`, `underruns`. |
| `close()`                        | Stop playing.                                                                                                                                                       |
| Events                           | `running`, once the context plays.                                                                                                                                  |

## GL

The guest's OpenGL, OpenGL ES, Vulkan and (with `d3d`) Direct3D run on the
host's Mesa over WebGPU and draw into the windows' own surfaces. A
`MesaGl` is made before boot, beside a windows class. Mesa is about 20 MB
before compression. It is fetched when a program first opens its GL, or
at `start()`, not at boot.

```js
import { MesaGl } from "@gex/runtime/gl";
import { HostWindows } from "@gex/runtime/windows/host";
const hw = new HostWindows(sys); // the windows GL draws into
const gl = new MesaGl(sys); // before boot
```

| Member                                    | Does                                                                                                                                                                                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new MesaGl(sys, { eager, d3d, source })` | `eager`: start Mesa at boot. `d3d`: the Direct3D device too (a Mesa built with it). `source(name)`: Mesa's files from the page (`gex-wgpu-replay.js`, `.wasm`, `.deferred.wasm`) as bytes, or null to fetch the package's own (or `baseUrl`'s). |
| `start()`                                 | Start Mesa now; resolves its description. A program's first GL call shares the same start.                                                                                                                                                      |
| Events                                    | `started` (`description`), `failed` (`error`), for starts through `start()`.                                                                                                                                                                    |

## Input

The input a browser holds back until the page asks for it, from
`@gex/runtime/input`. Each is made any time, one per system.

`new PointerLock(sys)`: a click on a window whose program asks for a locked
pointer takes the browser's pointer lock. The program asks through Wayland's
pointer constraints; Xwayland asks for an X program that grabs the pointer
and hides it, as games do. The mouse's movement then reaches the program as
relative motion, until Escape, `release()`, or the program letting go.
`locked` says whether it holds; the events are `lock` and `unlock`. A program
that asks for nothing never locks the pointer. A program that asks just
after the click that started it (an X game grabbing on a click) gets the
lock while that click still counts as the user's gesture. Xwayland locks
the pointer for an X program only when the program hides the cursor with
XFixes (`XFixesHideCursor`). A grab with a blank cursor image only confines
the pointer, so it gets no relative motion.

`new Clipboard(sys, { sync })`: text copied and pasted between the page and
the guest's programs. A Wayland program's selection, or an X program's
CLIPBOARD (the X window manager owns and converts it for them), comes out as
a `copy` event with `text`; `setText(text)` offers text to every program,
and an X program that pastes gets it as UTF8_STRING or STRING. One program's
copy reaches another as well. `text` is the last text either side set. With
`sync` (the default) a copy also goes onto the browser's clipboard, and the
browser's text comes in on a paste into the page and, where the browser
allows reading it, when the page gets the focus. Text only, up to 1 MiB
(256 KiB to and from X programs).

`new Gamepads(sys, { source })`: the browser's game controllers as the
guest's `/dev/input/event0` to `event3`, Linux evdev joysticks. SDL reads
them, and Wine reads them through SDL. A controller the browser maps to the
standard layout appears as an Xbox 360 pad, with the ids, name, buttons and
axes Linux's xpad driver gives one, so SDL's mapping database knows it. Any
other controller appears as a joystick under its own name and USB ids. A
node exists while its controller is connected. A program without udev finds
controllers by scanning `/dev/input`; SDL scans again when the directory's
mtime moves. Add `env` (`SDL_JOYSTICK_DISABLE_UDEV=1`) to `spawn`'s
environment so SDL scans even where libudev is installed. `pads` lists
`{ slot, id, mapping }`; the events are `connect` and `disconnect`, with
`slot`. A browser shows a page a controller only after one of its buttons
is pressed. `source` replaces `navigator.getGamepads` (a test's made-up
controllers). Rumble is accepted and dropped.

## Windows

One windows part per system, made before boot. A program finds the
compositor through its environment: add the part's `env` to `spawn`'s.

X11 programs' windows come as any other: with windows, display `:0` is the
runtime's own X server (Xwayland, rootless, gex's window manager framing
nothing), started when the first X client connects, which waits for it. The
tree needs only the clients' libraries.

### HostWindows (`@gex/runtime/windows/host`)

Each guest window is handed to the page to frame and place, as a desktop's
window manager does.

```js
import { HostWindows } from "@gex/runtime/windows/host";
const hw = new HostWindows(sys, { width: 1280, height: 720 });
hw.addEventListener("window", ({ window: w }) => {
	if (w.kind === "toplevel" && w.decorations === "host")
		frame(w); // a title bar, w.canvas inside
	else desktop.append(w.canvas); // popups: at w.x, w.y over w.parent
});
await sys.boot();
sys.spawn(["foot"], { env: { PATH: "/usr/bin:/bin", ...hw.env } });
```

| Member                                           | Does                                                                                                                                                 |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new HostWindows(sys, { width, height, scale })` | The output programs see as their screen, in CSS pixels (default the viewport) and device pixels per CSS pixel (default `devicePixelRatio`, rounded). |
| `setOutputSize(width, height, scale)`            | When the page's desktop changes size.                                                                                                                |
| `env`                                            | `{ XDG_RUNTIME_DIR, WAYLAND_DISPLAY, DISPLAY }` for `spawn`.                                                                                         |
| `windows()`, `focused`                           | Every window; the one with the keyboard.                                                                                                             |
| `keyEvent(e, pressed)`                           | A `keydown`/`keyup` heard elsewhere (the frame), for the window with the keyboard.                                                                   |
| `window` event                                   | `{ window }`: a new `GuestWindow`. A `cursor` event (`css`) when the client's cursor changes; it is also set on every window's canvas.               |

`process.windows()` lists a process's windows.

**GuestWindow**

| Member                                                                 | Does                                                                                                                                                                                                               |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `canvas`                                                               | Its pixels, CSS-sized to the window. Focusable: keys go to the window whose canvas has the page's focus; pointer and wheel input are its own.                                                                      |
| `kind`                                                                 | `'toplevel'`, `'popup'` (a menu, a tooltip: never framed, drawn above its parent and outside its frame) or `'subsurface'`.                                                                                         |
| `parent`, `pid`, `title`, `width`, `height`                            |                                                                                                                                                                                                                    |
| `decorations`                                                          | `'host'` (frame it), `'client'` (it draws its own: a Win32 window under Wine) or `'none'`.                                                                                                                         |
| `placed`, `x`, `y`                                                     | A popup's or subsurface's place relative to its parent's canvas; a placed window's (`placed`, Wine's) on the output, where its client moves and stacks it (`restack`).                                             |
| `place(x, y)`                                                          | Where the page put it on the output; call after each move (X windows' menus read it).                                                                                                                              |
| `resize(w, h)`, `setStates({ maximized, fullscreen, resizing }, w, h)` | Ask for a size, with states.                                                                                                                                                                                       |
| `focus()`, `close()`                                                   | The keyboard; a polite close.                                                                                                                                                                                      |
| `appId`                                                                | `null` for now.                                                                                                                                                                                                    |
| Events                                                                 | `title`, `resized`, `position`, `restack` (`below`), `request` (`kind`: `'move'`, `'resize'` with `edges`, `'maximize'`, `'unmaximize'`, `'fullscreen'`, `'unfullscreen'`: from the client's own frame), `closed`. |

### SingleCanvas (`@gex/runtime/windows/single`)

`new SingleCanvas(sys, { container })`: the windows drawn straight into one
positioned element, unframed, the first at its corner, popups over their
parents, a window its client places (Wine's) where it says. The element's size
is the output's; call `resized()` after changing it. For a page that is one
program (a game, a Win32 program that draws its own frames). `env`,
`describe()` and a `change` event as windows come and go.

### CompositorWindows (`@gex/runtime/windows/compositor`)

`new CompositorWindows(sys, { canvas, scale })`: the whole desktop in one
canvas, drawn by gex's scene compositor on WebGPU in a Worker: frames, title
bars, stacking, the cursor. `env`, `resize(width, height)` (device pixels),
`describe()`.

`process.windows()` is for HostWindows; the other two keep their windows to
themselves.

## Building

`web/runtime/build.sh DIR` builds the package into `DIR`: its modules, their
Workers, and beside them, each named by its content, the shim, kernel and
seed of each guest architecture the tree has built (`shims/browser/build.sh`, `GEX_ARCH=x86 shims/browser/build.sh`), the
GL's WebGPU replay and the X server (`web/build-xwayland-wasm.sh`), stripped
of names and DWARF (`GEX_KEEP_NAMES=1` keeps them). The
package is for browser pages only. Node runs the runtime from its sources
as a test host (`test/run.mjs --host node`), not as a host the API
supports.

## Tests

The runtime's tests are gex's test runner's `core`, `windows`, `gl`,
`image` and `wine` groups (test/README.md): `node test/run.mjs --group core,windows,gl,image,wine`.
`--package DIR` runs the browser's against a built package.
