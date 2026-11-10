// This code implements the `-sMODULARIZE` settings by taking the generated
// JS program code (INNER_JS_CODE) and wrapping it in a factory function.

// When targeting node and ES6 we use `await import ..` in the generated code
// so the outer function needs to be marked as async.
async function Module(moduleArg = {}) {
	var Module = moduleArg;
	// include: shell.js
	// include: minimum_runtime_check.js
	(function () {
		// "30.0.0" -> 300000
		function humanReadableVersionToPacked(str) {
			str = str.split("-")[0];
			// Remove any trailing part from e.g. "12.53.3-alpha"
			var vers = str.split(".").slice(0, 3);
			while (vers.length < 3) vers.push("00");
			vers = vers.map((n, i, arr) => n.padStart(2, "0"));
			return vers.join("");
		}
		// 300000 -> "30.0.0"
		var packedVersionToHumanReadable = (n) =>
			[(n / 1e4) | 0, ((n / 100) | 0) % 100, n % 100].join(".");
		var TARGET_NOT_SUPPORTED = 2147483647;
		// Note: We use a typeof check here instead of optional chaining using
		// globalThis because older browsers might not have globalThis defined.
		var currentNodeVersion =
			typeof process !== "undefined" && process.versions?.node
				? humanReadableVersionToPacked(process.versions.node)
				: TARGET_NOT_SUPPORTED;
		if (currentNodeVersion < 180300) {
			throw new Error(
				`This emscripten-generated code requires node v${packedVersionToHumanReadable(180300)} (detected v${packedVersionToHumanReadable(currentNodeVersion)})`,
			);
		}
		var userAgent = typeof navigator !== "undefined" && navigator.userAgent;
		if (!userAgent) {
			return;
		}
		var currentSafariVersion =
			userAgent.includes("Safari/") &&
			!userAgent.includes("Chrome/") &&
			userAgent.match(/Version\/(\d+\.?\d*\.?\d*)/)
				? humanReadableVersionToPacked(
						userAgent.match(/Version\/(\d+\.?\d*\.?\d*)/)[1],
					)
				: TARGET_NOT_SUPPORTED;
		if (currentSafariVersion < 15e4) {
			throw new Error(
				`This emscripten-generated code requires Safari v${packedVersionToHumanReadable(15e4)} (detected v${currentSafariVersion})`,
			);
		}
		var currentFirefoxVersion = userAgent.match(/Firefox\/(\d+(?:\.\d+)?)/)
			? parseFloat(userAgent.match(/Firefox\/(\d+(?:\.\d+)?)/)[1])
			: TARGET_NOT_SUPPORTED;
		if (currentFirefoxVersion < 114) {
			throw new Error(
				`This emscripten-generated code requires Firefox v114 (detected v${currentFirefoxVersion})`,
			);
		}
		var currentChromeVersion = userAgent.match(/Chrome\/(\d+(?:\.\d+)?)/)
			? parseFloat(userAgent.match(/Chrome\/(\d+(?:\.\d+)?)/)[1])
			: TARGET_NOT_SUPPORTED;
		if (currentChromeVersion < 85) {
			throw new Error(
				`This emscripten-generated code requires Chrome v85 (detected v${currentChromeVersion})`,
			);
		}
	})();

	// end include: minimum_runtime_check.js
	// The Module object: Our interface to the outside world. We import
	// and export values on it. There are various ways Module can be used:
	// 1. Not defined. We create it here
	// 2. A function parameter, function(moduleArg) => Promise<Module>
	// 3. pre-run appended it, var Module = {}; ..generated code..
	// 4. External script tag defines var Module.
	// We need to check if Module already exists (e.g. case 3 above).
	// Substitution will be replaced with actual code on later stage of the build,
	// this way Closure Compiler will not mangle it (e.g. case 4. above).
	// Note that if you want to run closure, and also to use Module
	// after the generated code, you will need to define   var Module = {};
	// before the code. Then that object will be used in the code, and you
	// can continue to use Module afterwards as well.
	// Determine the runtime environment we are in. You can customize this by
	// setting the ENVIRONMENT setting at compile time (see settings.js).
	// Attempt to auto-detect the environment
	var ENVIRONMENT_IS_WEB = !!globalThis.window;

	var ENVIRONMENT_IS_WORKER = !!globalThis.WorkerGlobalScope;

	// N.b. Electron.js environment is simultaneously a NODE-environment, but
	// also a web environment.
	var ENVIRONMENT_IS_NODE =
		globalThis.process?.versions?.node &&
		globalThis.process?.type != "renderer";

	var ENVIRONMENT_IS_SHELL =
		!ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

	// Three configurations we can be running in:
	// 1) We could be the application main() thread running in the main JS UI thread. (ENVIRONMENT_IS_WORKER == false and ENVIRONMENT_IS_PTHREAD == false)
	// 2) We could be the application main() running directly in a worker. (ENVIRONMENT_IS_WORKER == true, ENVIRONMENT_IS_PTHREAD == false)
	// 3) We could be an application pthread running in a worker. (ENVIRONMENT_IS_WORKER == true and ENVIRONMENT_IS_PTHREAD == true)
	// The way we signal to a worker that it is hosting a pthread is to construct
	// it with a specific name.
	var ENVIRONMENT_IS_PTHREAD =
		ENVIRONMENT_IS_WORKER && globalThis.name?.startsWith("em-pthread");

	if (ENVIRONMENT_IS_PTHREAD) {
		assert(
			!globalThis.moduleLoaded,
			"module should only be loaded once on each pthread worker",
		);
		globalThis.moduleLoaded = true;
	}

	if (ENVIRONMENT_IS_NODE) {
		// When building an ES module `require` is not normally available.
		// We need to use `createRequire()` to construct the require()` function.
		const { createRequire } = await import("node:module");
		/** @suppress{duplicate} */ var require = createRequire(import.meta.url);
		var worker_threads = require("node:worker_threads");
		globalThis.Worker = worker_threads.Worker;
		ENVIRONMENT_IS_WORKER = !worker_threads.isMainThread;
		// Under node we set `workerData` to `em-pthread` to signal that the worker
		// is hosting a pthread.
		ENVIRONMENT_IS_PTHREAD =
			ENVIRONMENT_IS_WORKER && worker_threads.workerData == "em-pthread";
	}

	// --pre-jses are emitted after the Module integration code, so that they can
	// refer to Module (if they choose; they can also define Module)
	var programArgs = [];

	var thisProgram = "./this.program";

	var quit_ = (status, toThrow) => {
		throw toThrow;
	};

	var _scriptName = import.meta.url;

	// `/` should be present at the end if `scriptDirectory` is not empty
	var scriptDirectory = "";

	function locateFile(path) {
		if (Module["locateFile"]) {
			return Module["locateFile"](path, scriptDirectory);
		}
		return scriptDirectory + path;
	}

	// Hooks that are implemented differently in different runtime environments.
	var readAsync, readBinary;

	if (ENVIRONMENT_IS_NODE) {
		const isNode =
			globalThis.process?.versions?.node &&
			globalThis.process?.type != "renderer";
		if (!isNode)
			throw new Error(
				"not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)",
			);
		// These modules will usually be used on Node.js. Load them eagerly to avoid
		// the complexity of lazy-loading.
		var fs = require("node:fs");
		if (_scriptName.startsWith("file:")) {
			scriptDirectory =
				require("node:path").dirname(
					require("node:url").fileURLToPath(_scriptName),
				) + "/";
		}
		// include: node_shell_read.js
		readBinary = (filename) => {
			// We need to re-wrap `file://` strings to URLs.
			filename = isFileURI(filename)
				? new URL(/* @vite-ignore */ /* webpackIgnore: true */ filename)
				: filename;
			var ret = fs.readFileSync(filename);
			assert(Buffer.isBuffer(ret));
			return ret;
		};
		readAsync = async (filename, binary = true) => {
			// See the comment in the `readBinary` function.
			filename = isFileURI(filename)
				? new URL(/* @vite-ignore */ /* webpackIgnore: true */ filename)
				: filename;
			var ret = fs.readFileSync(filename, binary ? undefined : "utf8");
			assert(binary ? Buffer.isBuffer(ret) : typeof ret == "string");
			return ret;
		};
		// end include: node_shell_read.js
		if (process.argv.length > 1) {
			thisProgram = process.argv[1].replace(/\\/g, "/");
		}
		programArgs = process.argv.slice(2);
		quit_ = (status, toThrow) => {
			process.exitCode = status;
			throw toThrow;
		};
	} else if (ENVIRONMENT_IS_SHELL) {
	} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
		// Note that this includes Node.js workers when relevant (pthreads is enabled).
		// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
		// ENVIRONMENT_IS_NODE.
		try {
			scriptDirectory = new URL(".", _scriptName).href;
		} catch {}
		if (!(globalThis.window || globalThis.WorkerGlobalScope))
			throw new Error(
				"not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)",
			);
		// Differentiate the Web Worker from the Node Worker case, as reading must
		// be done differently.
		if (!ENVIRONMENT_IS_NODE) {
			// include: web_or_worker_shell_read.js
			if (ENVIRONMENT_IS_WORKER) {
				readBinary = (url) => {
					var xhr = new XMLHttpRequest();
					xhr.open("GET", url, false);
					xhr.responseType = "arraybuffer";
					xhr.send(null);
					return new Uint8Array(/** @type{!ArrayBuffer} */ (xhr.response));
				};
			}
			readAsync = async (url) => {
				assert(!isFileURI(url), "readAsync does not work with file:// URLs");
				var response = await fetch(url, {
					credentials: "same-origin",
				});
				if (response.ok) {
					return response.arrayBuffer();
				}
				throw new Error(response.status + " : " + response.url);
			};
		}
	} else {
		throw new Error("environment detection error");
	}

	// Set up the out() and err() hooks, which are how we can print to stdout or
	// stderr, respectively.
	// Normally just binding console.log/console.error here works fine, but
	// under node (with workers) we see missing/out-of-order messages so route
	// directly to stdout and stderr.
	// See https://github.com/emscripten-core/emscripten/issues/14804
	var defaultPrint = console.log.bind(console);

	var defaultPrintErr = console.error.bind(console);

	if (ENVIRONMENT_IS_NODE) {
		var utils = require("node:util");
		var stringify = (a) => (typeof a == "object" ? utils.inspect(a) : a);
		defaultPrint = (...args) =>
			fs.writeSync(1, args.map(stringify).join(" ") + "\n");
		defaultPrintErr = (...args) =>
			fs.writeSync(2, args.map(stringify).join(" ") + "\n");
	}

	var out = defaultPrint;

	var err = defaultPrintErr;

	var IDBFS = "IDBFS is no longer included by default; build with -lidbfs.js";

	var PROXYFS =
		"PROXYFS is no longer included by default; build with -lproxyfs.js";

	var WORKERFS =
		"WORKERFS is no longer included by default; build with -lworkerfs.js";

	var FETCHFS =
		"FETCHFS is no longer included by default; build with -lfetchfs.js";

	var ICASEFS =
		"ICASEFS is no longer included by default; build with -licasefs.js";

	var JSFILEFS =
		"JSFILEFS is no longer included by default; build with -ljsfilefs.js";

	var OPFS = "OPFS is no longer included by default; build with -lopfs.js";

	var NODEFS =
		"NODEFS is no longer included by default; build with -lnodefs.js";

	// perform assertions in shell.js after we set up out() and err(), as otherwise
	// if an assertion fails it cannot print the message
	assert(
		ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER || ENVIRONMENT_IS_NODE,
		"pthreads do not work in this environment yet (need Web Workers, or an alternative to them)",
	);

	assert(
		!ENVIRONMENT_IS_SHELL,
		"shell environment detected but not enabled at build time (add `shell` to `-sENVIRONMENT` to enable)",
	);

	// end include: shell.js
	// include: preamble.js
	// === Preamble library stuff ===
	// Documentation for the public APIs defined in this file must be updated in:
	//    site/source/docs/api_reference/preamble.js.rst
	// A prebuilt local version of the documentation is available at:
	//    site/build/text/docs/api_reference/preamble.js.txt
	// You can also build docs locally as HTML or other formats in site/
	// An online HTML version (which may be of a different version of Emscripten)
	//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html
	var wasmBinary;

	if (!globalThis.WebAssembly) {
		err("no native wasm support detected");
	}

	// Wasm globals
	// For sending to workers.
	var wasmModule;

	//========================================
	// Runtime essentials
	//========================================
	// whether we are quitting the application. no code should run after this.
	// set in exit() and abort()
	var ABORT = false;

	// set by exit() and abort().  Passed to 'onExit' handler.
	// NOTE: This is also used as the process return code in shell environments
	// but only when noExitRuntime is false.
	var EXITSTATUS;

	// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
	// don't define it at all in release modes.  This matches the behaviour of
	// MINIMAL_RUNTIME.
	// TODO(sbc): Make this the default even without STRICT enabled.
	/** @type {function(*, string=)} */ function assert(condition, text) {
		if (!condition) {
			abort("Assertion failed" + (text ? ": " + text : ""));
		}
	}

	// We used to include malloc/free by default in the past. Show a helpful error in
	// builds with assertions.
	/**
	 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
	 * @noinline
	 */ var isFileURI = (filename) => filename.startsWith("file://");

	// include: runtime_common.js
	// include: runtime_stack_check.js
	// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
	function writeStackCookie() {
		var max = _emscripten_stack_get_end();
		assert((max & 3) == 0);
		// If the stack ends at address zero we write our cookies 4 bytes into the
		// stack.  This prevents interference with SAFE_HEAP and ASAN which also
		// monitor writes to address zero.
		if (max == 0) {
			max += 4;
		}
		// The stack grow downwards towards _emscripten_stack_get_end.
		// We write cookies to the final two words in the stack and detect if they are
		// ever overwritten.
		(growMemViews(), HEAPU32)[max >> 2] = 34821223;
		(growMemViews(), HEAPU32)[(max + 4) >> 2] = 2310721022;
		// Also test the global address 0 for integrity.
		(growMemViews(), HEAPU32)[0 >> 2] = 1668509029;
	}

	function checkStackCookie() {
		if (ABORT) return;
		var max = _emscripten_stack_get_end();
		// See writeStackCookie().
		if (max == 0) {
			max += 4;
		}
		var cookie1 = (growMemViews(), HEAPU32)[max >> 2];
		var cookie2 = (growMemViews(), HEAPU32)[(max + 4) >> 2];
		if (cookie1 != 34821223 || cookie2 != 2310721022) {
			abort(
				`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`,
			);
		}
		// Also test the global address 0 for integrity.
		if ((growMemViews(), HEAPU32)[0 >> 2] != 1668509029) {
			abort(
				"Runtime error: The application has corrupted its heap memory area (address zero)!",
			);
		}
	}

	// end include: runtime_stack_check.js
	// include: runtime_exceptions.js
	// Base Emscripten EH error class
	class EmscriptenEH {}

	class EmscriptenSjLj extends EmscriptenEH {}

	// end include: runtime_exceptions.js
	// include: runtime_debug.js
	var runtimeDebug = true;

	// Switch to false at runtime to disable logging at the right times
	// Used by XXXXX_DEBUG settings to output debug messages.
	function dbg(...args) {
		if (!runtimeDebug && typeof runtimeDebug != "undefined") return;
		// Avoid using the console for debugging in multi-threaded node applications
		// See https://github.com/emscripten-core/emscripten/issues/14804
		if (ENVIRONMENT_IS_NODE) {
			// TODO(sbc): Unify with err/out implementation in shell.sh.
			var fs = require("node:fs");
			var utils = require("node:util");
			function stringify(a) {
				switch (typeof a) {
					case "object":
						return utils.inspect(a);

					case "undefined":
						return "undefined";
				}
				return a;
			}
			fs.writeSync(2, args.map(stringify).join(" ") + "\n");
		} // TODO(sbc): Make this configurable somehow.  Its not always convenient for
		else
			// logging to show up as warnings.
			console.warn(...args);
	}

	// Endianness check
	(() => {
		var h16 = new Int16Array(1);
		var h8 = new Int8Array(h16.buffer);
		h16[0] = 25459;
		if (h8[0] !== 115 || h8[1] !== 99)
			abort(
				"Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)",
			);
	})();

	function consumedModuleProp(prop) {
		var value = Module[prop];
		var msg = `Attempt to modify \`Module.${prop}\` after it has already been processed.  This can happen, for example, when code is injected via '--post-js' rather than '--pre-js'`;
		if (Array.isArray(value)) {
			value = new Proxy(value, {
				set(target, key, val) {
					abort(msg);
					return false;
				},
				defineProperty(target, key, descriptor) {
					abort(msg);
					return false;
				},
				deleteProperty(target, key) {
					abort(msg);
					return false;
				},
			});
		}
		Object.defineProperty(Module, prop, {
			configurable: true,
			get() {
				return value;
			},
			set() {
				abort(msg);
			},
		});
	}

	function makeInvalidEarlyAccess(name) {
		return () =>
			assert(
				false,
				`call to '${name}' via reference taken before Wasm module initialization`,
			);
	}

	function ignoredModuleProp(prop) {
		if (Object.getOwnPropertyDescriptor(Module, prop)) {
			abort(
				`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`,
			);
		}
	}

	// forcing the filesystem exports a few things by default
	function isExportedByForceFilesystem(name) {
		return (
			name === "FS_createPath" ||
			name === "FS_createDataFile" ||
			name === "FS_createPreloadedFile" ||
			name === "FS_preloadFile" ||
			name === "FS_unlink" ||
			name === "addRunDependency" || // The old FS has some functionality that WasmFS lacks.
			name === "FS_createLazyFile" ||
			name === "FS_createDevice" ||
			name === "removeRunDependency"
		);
	}

	function missingLibrarySymbol(sym) {
		// Any symbol that is not included from the JS library is also (by definition)
		// not exported on the Module object.
		unexportedRuntimeSymbol(sym);
	}

	function unexportedRuntimeSymbol(sym) {
		if (ENVIRONMENT_IS_PTHREAD) {
			return;
		}
		if (!Object.getOwnPropertyDescriptor(Module, sym)) {
			Object.defineProperty(Module, sym, {
				configurable: true,
				get() {
					var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
					if (isExportedByForceFilesystem(sym)) {
						msg +=
							". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
					}
					abort(msg);
				},
			});
		}
	}

	/**
	 * Override `err`/`out`/`dbg` to report thread / worker information
	 */ function initWorkerLogging() {
		function getLogPrefix() {
			var t = 0;
			if (runtimeInitialized && typeof _pthread_self != "undefined") {
				t = _pthread_self();
			}
			return `w:${workerID},t:${ptrToString(t)}:`;
		}
		// Prefix all dbg() messages with the calling thread info.
		var origDbg = dbg;
		dbg = (...args) => origDbg(getLogPrefix(), ...args);
	}

	initWorkerLogging();

	// end include: runtime_debug.js
	// Support for growable heap + pthreads, where the buffer may change, so JS views
	// must be updated.
	function growMemViews() {
		// `updateMemoryViews` updates all the views simultaneously, so it's enough to check any of them.
		if (wasmMemory.buffer != HEAP8.buffer) {
			updateMemoryViews();
		}
	}

	if (ENVIRONMENT_IS_NODE && ENVIRONMENT_IS_PTHREAD) {
		// Create as web-worker-like an environment as we can.
		globalThis.self = globalThis;
		var parentPort = worker_threads.parentPort;
		// Deno and Bun already have `postMessage` defined on the global scope and
		// deliver messages to `globalThis.onmessage`, so we must not duplicate that
		// behavior here if `postMessage` is already present.
		if (!globalThis.postMessage) {
			parentPort.on("message", (msg) =>
				globalThis.onmessage?.({
					data: msg,
				}),
			);
			globalThis.postMessage = (msg) => parentPort.postMessage(msg);
		}
		// Node.js Workers do not pass postMessage()s and uncaught exception events to the parent
		// thread necessarily in the same order where they were generated in sequential program order.
		// See https://github.com/nodejs/node/issues/59617
		// To remedy this, capture all uncaughtExceptions in the Worker, and sequentialize those over
		// to the same postMessage pipe that other messages use.
		process.on("uncaughtException", (err) => {
			postMessage({
				cmd: 8,
				error: err,
			});
			// Also shut down the Worker to match the same semantics as if this uncaughtException
			// handler was not registered.
			// (n.b. this will not shut down the whole Node.js app process, but just the Worker)
			process.exit(1);
		});
	}

	// include: runtime_pthread.js
	// Pthread Web Worker handling code.
	// This code runs only on pthread web workers and handles pthread setup
	// and communication with the main thread via postMessage.
	// Unique ID of the current pthread worker (zero on non-pthread-workers
	// including the main thread).
	var workerID = 0;

	var startWorker;

	if (ENVIRONMENT_IS_PTHREAD) {
		// Thread-local guard variable for one-time init of the JS state
		var initializedJS = false;
		// Turn unhandled rejected promises into errors so that the main thread will be
		// notified about them.
		self.onunhandledrejection = (e) => {
			throw e.reason || e;
		};
		function handleMessage(e) {
			try {
				var msgData = e.data;
				//dbg('msgData: ' + Object.keys(msgData));
				var cmd = msgData.cmd;
				if (cmd == 1) {
					// Preload command that is called once per worker to parse and load the Emscripten code.
					workerID = msgData.workerID;
					// Until we initialize the runtime, queue up any further incoming messages.
					let messageQueue = [];
					self.onmessage = (e) => messageQueue.push(e);
					// And add a callback for when the runtime is initialized.
					startWorker = () => {
						// Notify the main thread that this thread has loaded.
						postMessage({
							cmd: 3,
						});
						// Process any messages that were queued before the thread was ready.
						for (let msg of messageQueue) {
							handleMessage(msg);
						}
						// Restore the real message handler.
						self.onmessage = handleMessage;
					};
					// Use `const` here to ensure that the variable is scoped only to
					// that iteration, allowing safe reference from a closure.
					for (const handler of msgData.handlers) {
						// If the main module has a handler for a certain event, but no
						// handler exists on the pthread worker, then proxy that handler
						// back to the main thread.
						if (!Module[handler] || Module[handler].proxy) {
							Module[handler] = (...args) => {
								postMessage({
									cmd: 9,
									handler,
									args,
								});
							};
							// Rebind the out / err handlers if needed
							if (handler == "print") out = Module[handler];
							if (handler == "printErr") err = Module[handler];
						}
					}
					wasmMemory = msgData.wasmMemory;
					updateMemoryViews();
					wasmModule = msgData.wasmModule;
					createWasm();
					run();
				} else if (cmd == 2) {
					assert(msgData.pthread_ptr);
					assert(wasmMemory, "CMD_RUN received before CMD_LOAD");
					// Call inside JS module to set up the stack frame for this pthread in JS module scope.
					// This needs to be the first thing that we do, as we cannot call to any C/C++ functions
					// until the thread stack is initialized.
					establishStackSpace(msgData.pthread_ptr);
					// Pass the thread address to wasm to store it for fast access.
					__emscripten_thread_init(
						msgData.pthread_ptr,
						/*is_main=*/ 0,
						/*is_runtime=*/ 0,
						/*can_block=*/ 1,
						0,
						0,
					);
					PThread.threadInitTLS();
					// Await mailbox notifications with `Atomics.waitAsync` so we can start
					// using the fast `Atomics.notify` notification path.
					__emscripten_thread_mailbox_await(msgData.pthread_ptr);
					if (!initializedJS) {
						initializedJS = true;
					}
					try {
						invokeEntryPoint(msgData.start_routine, msgData.arg);
					} catch (ex) {
						if (ex != "unwind") {
							// The pthread "crashed".  Do not call `_emscripten_thread_exit` (which
							// would make this thread joinable).  Instead, re-throw the exception
							// and let the top level handler propagate it back to the main thread.
							throw ex;
						}
					}
				} else if (cmd == 4) {
					if (initializedJS) {
						checkMailbox();
					}
				} else if (cmd) {
					// The received message looks like something that should be handled by this message
					// handler, (since there is a cmd field present), but is not one of the
					// recognized commands:
					err(`worker: received unknown command ${cmd}`);
					err(msgData);
				}
			} catch (ex) {
				err(`worker: onmessage() captured an uncaught exception: ${ex}`);
				if (ex?.stack) err(ex.stack);
				if (runtimeInitialized) __emscripten_thread_crashed();
				throw ex;
			}
		}
		self.onmessage = handleMessage;
	}

	// ENVIRONMENT_IS_PTHREAD
	// end include: runtime_pthread.js
	// Memory management
	var runtimeInitialized = false;

	function updateMemoryViews() {
		var b = wasmMemory.buffer;
		HEAP8 = new Int8Array(b);
		HEAP16 = new Int16Array(b);
		Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
		HEAPU16 = new Uint16Array(b);
		Module["HEAP32"] = HEAP32 = new Int32Array(b);
		Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
		HEAPF32 = new Float32Array(b);
		HEAPF64 = new Float64Array(b);
		HEAP64 = new BigInt64Array(b);
		HEAPU64 = new BigUint64Array(b);
	}

	// In non-standalone/normal mode, we create the memory here.
	// include: runtime_init_memory.js
	// Create the wasm memory. (Note: this only applies if IMPORTED_MEMORY is defined)
	// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
	function initMemory() {
		if (ENVIRONMENT_IS_PTHREAD) {
			return;
		}
		if (Module["wasmMemory"]) {
			wasmMemory = Module["wasmMemory"];
		} else {
			var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 134217728;
			assert(
				INITIAL_MEMORY >= 4194304,
				`INITIAL_MEMORY should be larger than STACK_SIZE, was ${INITIAL_MEMORY}! (STACK_SIZE=4194304)`,
			);
			/** @suppress {checkTypes} */ wasmMemory = new WebAssembly.Memory({
				initial: INITIAL_MEMORY / 65536,
				// In theory we should not need to emit the maximum if we want "unlimited"
				// or 4GB of memory, but VMs error on that atm, see
				// https://github.com/emscripten-core/emscripten/issues/14130
				// And in the pthreads case we definitely need to emit a maximum. So
				// always emit one.
				maximum: 24576,
				shared: true,
			});
		}
		updateMemoryViews();
	}

	// end include: runtime_init_memory.js
	// include: memoryprofiler.js
	// end include: memoryprofiler.js
	// end include: runtime_common.js
	assert(
		globalThis.Int32Array &&
			globalThis.Float64Array &&
			Int32Array.prototype.subarray &&
			Int32Array.prototype.set,
		"JS engine does not provide full typed array support",
	);

	function preRun() {
		assert(!ENVIRONMENT_IS_PTHREAD);
		// PThreads reuse the runtime from the main thread.
		if (Module["preRun"]) {
			if (typeof Module["preRun"] == "function")
				Module["preRun"] = [Module["preRun"]];
			while (Module["preRun"].length) {
				addOnPreRun(Module["preRun"].shift());
			}
		}
		consumedModuleProp("preRun");
		// Begin ATPRERUNS hooks
		callRuntimeCallbacks(onPreRuns);
	}

	function initRuntime() {
		assert(!runtimeInitialized);
		runtimeInitialized = true;
		if (ENVIRONMENT_IS_PTHREAD) return startWorker();
		checkStackCookie();
		// Begin ATINITS hooks
		if (!Module["noFSInit"] && !FS.initialized) FS.init();
		TTY.init();
		SOCKFS.root = FS.mount(SOCKFS, {}, null);
		PIPEFS.root = FS.mount(PIPEFS, {}, null);
		// End ATINITS hooks
		wasmExports["__wasm_call_ctors"]();
		// Begin ATPOSTCTORS hooks
		FS.ignorePermissions = false;
	}

	function preMain() {
		checkStackCookie();
	}

	function postRun() {
		checkStackCookie();
		if (ENVIRONMENT_IS_PTHREAD) {
			return;
		}
		// PThreads reuse the runtime from the main thread.
		if (Module["postRun"]) {
			if (typeof Module["postRun"] == "function")
				Module["postRun"] = [Module["postRun"]];
			while (Module["postRun"].length) {
				addOnPostRun(Module["postRun"].shift());
			}
		}
		consumedModuleProp("postRun");
		// Begin ATPOSTRUNS hooks
		callRuntimeCallbacks(onPostRuns);
	}

	/**
	 * @param {string|number=} what
	 */ function abort(what) {
		Module["onAbort"]?.(what);
		what = `Aborted(${what})`;
		// TODO(sbc): Should we remove printing and leave it up to whoever
		// catches the exception?
		err(what);
		ABORT = true;
		// Use a wasm runtime error, because a JS error might be seen as a foreign
		// exception, which means we'd run destructors on it. We need the error to
		// simply make the program stop.
		// FIXME This approach does not work in Wasm EH because it currently does not assume
		// all RuntimeErrors are from traps; it decides whether a RuntimeError is from
		// a trap or not based on a hidden field within the object. So at the moment
		// we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
		// allows this in the wasm spec.
		// Suppress closure compiler warning here. Closure compiler's builtin extern
		// definition for WebAssembly.RuntimeError claims it takes no arguments even
		// though it can.
		// TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
		/** @suppress {checkTypes} */ var e = new WebAssembly.RuntimeError(what);
		// Throw the error whether or not MODULARIZE is set because abort is used
		// in code paths apart from instantiation where an exception is expected
		// to be thrown when abort is called.
		throw e;
	}

	function createExportWrapper(name, nargs) {
		return (...args) => {
			assert(
				runtimeInitialized,
				`native function \`${name}\` called before runtime initialization`,
			);
			var f = wasmExports[name];
			assert(f, `exported native function \`${name}\` not found`);
			// Only assert for too many arguments. Too few can be valid since the missing arguments will be zero filled.
			assert(
				args.length <= nargs,
				`native function \`${name}\` called with ${args.length} args but expects ${nargs}`,
			);
			return f(...args);
		};
	}

	var wasmBinaryFile;

	function findWasmBinary() {
		if (Module["locateFile"]) {
			return locateFile("Xwayland.wasm");
		}
		// Use bundler-friendly `new URL(/* @vite-ignore */ /* webpackIgnore: true */ ..., import.meta.url)` pattern; works in browsers too.
		return new URL("Xwayland.wasm", import.meta.url).href;
	}

	function getBinarySync(file) {
		if (file == wasmBinaryFile && wasmBinary) {
			return new Uint8Array(wasmBinary);
		}
		if (readBinary) {
			return readBinary(file);
		}
		// Throwing a plain string here, even though it not normally advisable since
		// this gets turning into an `abort` in instantiateArrayBuffer.
		throw "both async and sync fetching of the wasm failed";
	}

	async function getWasmBinary(binaryFile) {
		// If we don't have the binary yet, load it asynchronously using readAsync.
		if (!wasmBinary) {
			// Fetch the binary using readAsync
			try {
				var response = await readAsync(binaryFile);
				return new Uint8Array(response);
			} catch {}
		}
		// Otherwise, getBinarySync should be able to get it synchronously
		return getBinarySync(binaryFile);
	}

	async function instantiateArrayBuffer(binaryFile, imports) {
		try {
			var binary = await getWasmBinary(binaryFile);
			var instance = await WebAssembly.instantiate(binary, imports);
			return instance;
		} catch (reason) {
			err(`failed to asynchronously prepare wasm: ${reason}`);
			// Warn on some common problems.
			if (isFileURI(binaryFile)) {
				err(
					`warning: Loading from a file URI (${binaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`,
				);
			}
			abort(reason);
		}
	}

	async function instantiateAsync(binary, binaryFile, imports) {
		if (!binary && !ENVIRONMENT_IS_NODE) {
			try {
				var response = fetch(binaryFile, {
					credentials: "same-origin",
				});
				var instantiationResult = await WebAssembly.instantiateStreaming(
					response,
					imports,
				);
				return instantiationResult;
			} catch (reason) {
				// We expect the most common failure cause to be a bad MIME type for the binary,
				// in which case falling back to ArrayBuffer instantiation should work.
				err(`wasm streaming compile failed: ${reason}`);
				err("falling back to ArrayBuffer instantiation");
			}
		}
		return instantiateArrayBuffer(binaryFile, imports);
	}

	function getWasmImports() {
		assignWasmImports();
		// prepare imports
		var imports = {
			env: wasmImports,
			wasi_snapshot_preview1: wasmImports,
		};
		return imports;
	}

	// Create the wasm instance.
	// Receives the wasm imports, returns the exports.
	async function createWasm() {
		// Load the wasm module and create an instance of using native support in the JS engine.
		// handle a generated wasm instance, receiving its exports and
		// performing other necessary setup
		/** @param {WebAssembly.Module=} module*/ function receiveInstance(
			instance,
			module,
		) {
			wasmExports = instance.exports;
			registerTLSInit(wasmExports["_emscripten_tls_init"]);
			assignWasmExports(wasmExports);
			// We now have the Wasm module loaded up, keep a reference to the compiled module so we can post it to the workers.
			wasmModule = module;
			return wasmExports;
		}
		// Prefer streaming instantiation if available.
		// Async compilation can be confusing when an error on the page overwrites Module
		// (for example, if the order of elements is wrong, and the one defining Module is
		// later), so we save Module and check it later.
		var trueModule = Module;
		function receiveInstantiationResult(result) {
			// 'result' is a ResultObject object which has both the module and instance.
			// receiveInstance() will swap in the exports (to Module.asm) so they can be called
			assert(
				Module === trueModule,
				"the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?",
			);
			trueModule = null;
			return receiveInstance(result["instance"], result["module"]);
		}
		var info = getWasmImports();
		// User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
		// to manually instantiate the Wasm module themselves. This allows pages to
		// run the instantiation parallel to any other async startup actions they are
		// performing.
		// Also pthreads and wasm workers initialize the wasm instance through this
		// path.
		if (Module["instantiateWasm"]) {
			return new Promise((resolve, reject) => {
				try {
					Module["instantiateWasm"](info, (inst, mod) => {
						resolve(receiveInstance(inst, mod));
					});
				} catch (e) {
					err(`Module.instantiateWasm callback failed with error: ${e}`);
					reject(e);
				}
			});
		}
		if (ENVIRONMENT_IS_PTHREAD) {
			// Instantiate from the module that was received via postMessage from
			// the main thread. We can just use sync instantiation in the worker.
			assert(
				wasmModule,
				"wasmModule should have been received via postMessage",
			);
			var instance = new WebAssembly.Instance(wasmModule, getWasmImports());
			return receiveInstance(instance, wasmModule);
		}
		wasmBinaryFile ??= findWasmBinary();
		var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
		var exports = receiveInstantiationResult(result);
		return exports;
	}

	// end include: preamble.js
	// Begin JS library code
	class ExitStatus {
		name = "ExitStatus";
		constructor(status) {
			this.message = `Program terminated with exit(${status})`;
			this.status = status;
		}
	}

	/** @type {!Int16Array} */ var HEAP16;

	/** @type {!Int32Array} */ var HEAP32;

	/** not-@type {!BigInt64Array} */ var HEAP64;

	/** @type {!Int8Array} */ var HEAP8;

	/** @type {!Float32Array} */ var HEAPF32;

	/** @type {!Float64Array} */ var HEAPF64;

	/** @type {!Uint16Array} */ var HEAPU16;

	/** @type {!Uint32Array} */ var HEAPU32;

	/** not-@type {!BigUint64Array} */ var HEAPU64;

	/** @type {!Uint8Array} */ var HEAPU8;

	var terminateWorker = (worker) => {
		worker.terminate();
		// terminate() can be asynchronous, so in theory the worker can continue
		// to run for some amount of time after termination.  However from our POV
		// the worker is now dead and we don't want to hear from it again, so we stub
		// out its message handler here.  This avoids having to check in each of
		// the onmessage handlers if the message was coming from a valid worker.
		worker.onmessage = (e) => {
			var cmd = e.data.cmd;
			err(
				`received "${cmd}" command from terminated worker: ${worker.workerID}`,
			);
		};
	};

	var cleanupThread = (pthread_ptr) => {
		assert(
			!ENVIRONMENT_IS_PTHREAD,
			"cleanupThread() should only be called from the main thread",
		);
		assert(pthread_ptr, "null pthread_ptr passed to cleanupThread");
		var worker = PThread.pthreads[pthread_ptr];
		assert(worker);
		PThread.returnWorkerToPool(worker);
	};

	var callRuntimeCallbacks = (callbacks) => {
		while (callbacks.length > 0) {
			// Pass the module as the first argument.
			callbacks.shift()(Module);
		}
	};

	var onPreRuns = [];

	var addOnPreRun = (cb) => onPreRuns.push(cb);

	var spawnThread = (threadParams) => {
		assert(
			!ENVIRONMENT_IS_PTHREAD,
			"spawnThread() should only be called from the main thread",
		);
		assert(
			threadParams.pthread_ptr,
			"spawnThread called with null pthread ptr",
		);
		var worker = PThread.getNewWorker();
		if (!worker) {
			// No available workers in the PThread pool.
			return 6;
		}
		assert(!worker.pthread_ptr);
		// Add to pthreads map
		PThread.pthreads[threadParams.pthread_ptr] = worker;
		worker.pthread_ptr = threadParams.pthread_ptr;
		var msg = {
			cmd: 2,
			start_routine: threadParams.startRoutine,
			arg: threadParams.arg,
			pthread_ptr: threadParams.pthread_ptr,
		};
		// Ask the worker to start executing its pthread entry point function.
		worker.postMessage(msg, threadParams.transferList);
		return 0;
	};

	var runtimeKeepaliveCounter = 0;

	var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;

	var stackSave = () => _emscripten_stack_get_current();

	var stackRestore = (val) => __emscripten_stack_restore(val);

	var stackAlloc = (sz) => __emscripten_stack_alloc(sz);

	/** @type{function(number, (number|boolean), ...number)} */ var proxyToMainThread =
		(funcIndex, emAsmAddr, proxyMode, ...callArgs) => {
			// EM_ASM proxying is done by passing a pointer to the address of the EM_ASM
			// content as `emAsmAddr`.  JS library proxying is done by passing an index
			// into `proxiedJSCallArgs` as `funcIndex`. If `emAsmAddr` is non-zero then
			// `funcIndex` will be ignored.
			// Additional arguments are passed after the first three are the actual
			// function arguments.
			// The serialization buffer contains the number of call params, and then
			// all the args here.
			// We also pass 'proxyMode' to C separately, since C needs to look at it.
			// Allocate a buffer (on the stack), which will be copied if necessary by
			// the C code.
			// First passed parameter specifies the number of arguments to the function.
			// When BigInt support is enabled, we must handle types in a more complex
			// way, detecting at runtime if a value is a BigInt or not (as we have no
			// type info here). To do that, add a "prefix" before each value that
			// indicates if it is a BigInt, which effectively doubles the number of
			// values we serialize for proxying. TODO: pack this?
			var bufSize = 8 * callArgs.length * 2;
			var sp = stackSave();
			var args = stackAlloc(bufSize);
			var b = args >> 3;
			for (var arg of callArgs) {
				if (typeof arg == "bigint") {
					// The prefix is non-zero to indicate a bigint.
					(growMemViews(), HEAP64)[b++] = 1n;
					(growMemViews(), HEAP64)[b++] = arg;
				} else {
					// The prefix is zero to indicate a JS Number.
					(growMemViews(), HEAP64)[b++] = 0n;
					(growMemViews(), HEAPF64)[b++] = arg;
				}
			}
			var rtn = __emscripten_run_js_on_main_thread(
				funcIndex,
				emAsmAddr,
				bufSize,
				args,
				proxyMode,
			);
			stackRestore(sp);
			return rtn;
		};

	function _proc_exit(code) {
		if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(0, 0, 1, code);
		EXITSTATUS = code;
		if (!keepRuntimeAlive()) {
			PThread.terminateAllThreads();
			Module["onExit"]?.(code);
			ABORT = true;
		}
		quit_(code, new ExitStatus(code));
	}

	function exitOnMainThread(returnCode) {
		if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(1, 0, 0, returnCode);
		_exit(returnCode);
	}

	/** @param {boolean|number=} implicit */ var exitJS = (status, implicit) => {
		EXITSTATUS = status;
		checkUnflushedContent();
		if (ENVIRONMENT_IS_PTHREAD) {
			// implicit exit can never happen on a pthread
			assert(!implicit);
			// When running in a pthread we propagate the exit back to the main thread
			// where it can decide if the whole process should be shut down or not.
			// The pthread may have decided not to exit its own runtime, for example
			// because it runs a main loop, but that doesn't affect the main thread.
			exitOnMainThread(status);
			throw "unwind";
		}
		// if exit() was called explicitly, warn the user if the runtime isn't actually being shut down
		if (keepRuntimeAlive() && !implicit) {
			var msg = `program exited (with status: ${status}), but keepRuntimeAlive() is set (counter=${runtimeKeepaliveCounter}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;
			err(msg);
		}
		_proc_exit(status);
	};

	var _exit = exitJS;

	var waitAsyncPolyfilled =
		!Atomics.waitAsync ||
		(globalThis.navigator?.userAgent &&
			Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./) || [])[2]) <
				91);

	function ptrToString(ptr) {
		assert(
			typeof ptr === "number",
			`ptrToString expects a number, got ${typeof ptr}`,
		);
		// Convert to 32-bit unsigned value
		ptr >>>= 0;
		return "0x" + ptr.toString(16).padStart(8, "0");
	}

	var PThread = {
		unusedWorkers: [],
		tlsInitFunctions: [],
		pthreads: {},
		nextWorkerID: 1,
		init() {
			if (!ENVIRONMENT_IS_PTHREAD) {
				PThread.initMainThread();
			}
		},
		initMainThread() {},
		terminateAllThreads: () => {
			assert(
				!ENVIRONMENT_IS_PTHREAD,
				"terminateAllThreads() should only be called from the main thread",
			);
			// Attempt to kill all workers.  Sadly (at least on the web) there is no
			// way to terminate a worker synchronously, or to be notified when a
			// worker is actually terminated.  This means there is some risk that
			// pthreads will continue to be executing after `worker.terminate` has
			// returned.  For this reason, we don't call `returnWorkerToPool` here or
			// free the underlying pthread data structures.
			for (var worker of Object.values(PThread.pthreads)) {
				terminateWorker(worker);
			}
			for (var worker of PThread.unusedWorkers) {
				terminateWorker(worker);
			}
			PThread.unusedWorkers = [];
			PThread.pthreads = {};
		},
		terminateRuntime: () => {
			assert(
				!ENVIRONMENT_IS_PTHREAD,
				"terminateRuntime() should only be called from the main thread",
			);
			PThread.terminateAllThreads();
			var pthread_ptr = _pthread_self();
			___set_thread_state(0, 0, 0, 1);
			if (!waitAsyncPolyfilled) {
				// Break the waitAsync loop.  Note that checkMailbox will not
				// re-register since the `___set_thread_state` above causes _pthread_self
				// to return 0.
				Atomics.notify((growMemViews(), HEAP32), pthread_ptr >> 2);
			}
		},
		returnWorkerToPool: (worker) => {
			// We don't want to run main thread queued calls here, since we are doing
			// some operations that leave the worker queue in an invalid state until
			// we are completely done (it would be bad if free() ends up calling a
			// queued pthread_create which looks at the global data structures we are
			// modifying). To achieve that, defer the free() until the very end, when
			// we are all done.
			var pthread_ptr = worker.pthread_ptr;
			delete PThread.pthreads[pthread_ptr];
			// Note: worker is intentionally not terminated so the pool can
			// dynamically grow.
			PThread.unusedWorkers.push(worker);
			// Not a running Worker anymore
			// Detach the worker from the pthread object, and return it to the
			// worker pool as an unused worker.
			worker.pthread_ptr = 0;
			// Finally, free the underlying (and now-unused) pthread structure in
			// linear memory.
			__emscripten_thread_free_data(pthread_ptr);
		},
		threadInitTLS() {
			// Call thread init functions (these are the _emscripten_tls_init for each
			// module loaded.
			PThread.tlsInitFunctions.forEach((f) => f());
		},
		loadWasmModuleToWorker: (worker) =>
			new Promise((onFinishedLoading) => {
				worker.onmessage = (e) => {
					var d = e.data;
					var cmd = d.cmd;
					// If this message is intended to a recipient that is not the main
					// thread, forward it to the target thread. This is currently only
					// used by `CMD_CHECK_MAILBOX`.
					if (d.targetThread) {
						// pthreads should not be relaying messages to themselves.
						assert(d.targetThread != _pthread_self());
						var targetWorker = PThread.pthreads[d.targetThread];
						if (!targetWorker)
							err(
								`worker sent message (${cmd}) to pthread (${d.targetThread}) that no longer exists`,
							);
						targetWorker?.postMessage(d);
						return;
					}
					if (d === "setimmediate" || d === "_si") {
						// Worker wants to postMessage() to itself to implement setImmediate()
						// emulation.
						worker.postMessage(d);
						return;
					}
					switch (cmd) {
						case 4:
							checkMailbox();
							break;

						case 5:
							spawnThread(d);
							break;

						case 6:
							// cleanupThread needs to be run via callUserCallback since it calls
							// back into user code to free thread data. Without this it's possible
							// the unwind or ExitStatus exception could escape here.
							callUserCallback(() => cleanupThread(d.thread));
							break;

						case 3:
							if (ENVIRONMENT_IS_NODE && !worker.strongref) {
								// Once worker is loaded & idle, mark it as weakly referenced,
								// so that mere existence of a Worker in the pool does not prevent
								// Node.js from exiting the app.
								worker.unref();
							}
							onFinishedLoading(worker);
							break;

						case 8:
							// Message handler for Node.js specific out-of-order behavior:
							// https://github.com/nodejs/node/issues/59617
							// A pthread sent an uncaught exception event. Re-raise it on the main thread.
							worker.onerror(d.error);
							break;

						case 9:
							Module[d.handler](...d.args);
							break;

						default:
							// The received message looks like something that should be handled by this message
							// handler, (since there is a e.data.cmd field present), but is not one of the
							// recognized commands:
							if (cmd) err(`worker sent an unknown command ${cmd}`);
					}
				};
				worker.onerror = (e) => {
					var message = "worker sent an error!";
					if (worker.pthread_ptr) {
						message = `Pthread ${ptrToString(worker.pthread_ptr)} sent an error!`;
					}
					err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);
					throw e;
				};
				if (ENVIRONMENT_IS_NODE) {
					worker.on("message", (data) =>
						worker.onmessage({
							data,
						}),
					);
					worker.on("error", (e) => worker.onerror(e));
				}
				assert(
					wasmMemory instanceof WebAssembly.Memory,
					"wasmMemory should have been loaded by now",
				);
				assert(
					wasmModule instanceof WebAssembly.Module,
					"wasmModule should have been loaded by now",
				);
				// When running on a pthread, none of the incoming parameters on the module
				// object are present. Proxy known handlers back to the main thread if specified.
				var handlers = [];
				var knownHandlers = ["onExit", "onAbort", "print", "printErr"];
				for (var handler of knownHandlers) {
					if (Module.propertyIsEnumerable(handler)) {
						handlers.push(handler);
					}
				}
				// Ask the new worker to load up the Emscripten-compiled page. This is a heavy operation.
				worker.postMessage({
					cmd: 1,
					handlers,
					wasmMemory,
					wasmModule,
					workerID: worker.workerID,
				});
			}),
		allocateUnusedWorker() {
			var worker;
			// If we're using module output, use bundler-friendly pattern.
			if (Module["mainScriptUrlOrBlob"]) {
				var pthreadMainJs = Module["mainScriptUrlOrBlob"];
				if (typeof pthreadMainJs != "string") {
					pthreadMainJs = URL.createObjectURL(pthreadMainJs);
				}
				worker = new Worker(pthreadMainJs, {
					type: "module",
					// This is the way that we signal to the node worker that it is hosting
					// a pthread.
					workerData: "em-pthread",
					// This is the way that we signal to the Web Worker that it is hosting
					// a pthread.
					name: "em-pthread-" + PThread.nextWorkerID,
				});
			} // We need to generate the URL with import.meta.url as the base URL of the JS file
			else
				// instead of just using new URL(/* @vite-ignore */ /* webpackIgnore: true */ import.meta.url) because bundlers only recognize
				// the first case in their bundling step. The latter ends up producing an invalid
				// URL to import from the server (e.g., for webpack the file:// path).
				// See https://github.com/webpack/webpack/issues/12638
				worker = new Worker(new URL("Xwayland.js", import.meta.url), {
					type: "module",
					// This is the way that we signal to the node worker that it is hosting
					// a pthread.
					workerData: "em-pthread",
					// This is the way that we signal to the Web Worker that it is hosting
					// a pthread.
					name: "em-pthread-" + PThread.nextWorkerID,
				});
			worker.workerID = PThread.nextWorkerID++;
			PThread.unusedWorkers.push(worker);
			return worker;
		},
		getNewWorker() {
			if (PThread.unusedWorkers.length == 0) {
				// PTHREAD_POOL_SIZE_STRICT should show a warning and, if set to level `2`, return from the function.
				// However, if we're in Node.js, then we can create new workers on the fly and PTHREAD_POOL_SIZE_STRICT
				// should be ignored altogether.
				if (!ENVIRONMENT_IS_NODE) {
					err(
						"Tried to spawn a new thread, but the thread pool is exhausted.\n" +
							"This might result in a deadlock unless some threads eventually exit or the code explicitly breaks out to the event loop.\n" +
							"If you want to increase the pool size, use setting `-sPTHREAD_POOL_SIZE=...`." +
							"\nIf you want to throw an explicit error instead of the risk of deadlocking in those cases, use setting `-sPTHREAD_POOL_SIZE_STRICT=2`.",
					);
				}
				var newWorker = PThread.allocateUnusedWorker();
				PThread.loadWasmModuleToWorker(newWorker);
			}
			return PThread.unusedWorkers.pop();
		},
	};

	var onPostRuns = [];

	var addOnPostRun = (cb) => onPostRuns.push(cb);

	function establishStackSpace(pthread_ptr) {
		var stackHigh = (growMemViews(), HEAPU32)[(pthread_ptr + 48) >> 2];
		var stackSize = (growMemViews(), HEAPU32)[(pthread_ptr + 52) >> 2];
		var stackLow = stackHigh - stackSize;
		assert(stackHigh != 0);
		assert(stackLow != 0);
		assert(stackHigh > stackLow, "stackHigh must be higher then stackLow");
		// Set stack limits used by `emscripten/stack.h` function.  These limits are
		// cached in wasm-side globals to make checks as fast as possible.
		_emscripten_stack_set_limits(stackHigh, stackLow);
		// Call inside wasm module to set up the stack frame for this pthread in wasm module scope
		stackRestore(stackHigh);
		// Write the stack cookie last, after we have set up the proper bounds and
		// current position of the stack.
		writeStackCookie();
	}

	/**
	 * @param {number} ptr
	 * @param {string} type
	 */ function getValue(ptr, type = "i8") {
		if (type.endsWith("*")) type = "*";
		switch (type) {
			case "i1":
				return (growMemViews(), HEAP8)[ptr];

			case "i8":
				return (growMemViews(), HEAP8)[ptr];

			case "i16":
				return (growMemViews(), HEAP16)[ptr >> 1];

			case "i32":
				return (growMemViews(), HEAP32)[ptr >> 2];

			case "i64":
				return (growMemViews(), HEAP64)[ptr >> 3];

			case "float":
				return (growMemViews(), HEAPF32)[ptr >> 2];

			case "double":
				return (growMemViews(), HEAPF64)[ptr >> 3];

			case "*":
				return (growMemViews(), HEAPU32)[ptr >> 2];

			default:
				abort(`invalid type for getValue: ${type}`);
		}
	}

	var wasmTableMirror = [];

	var getWasmTableEntry = (funcPtr) => {
		var func = wasmTableMirror[funcPtr];
		if (!func) {
			/** @suppress {checkTypes} */ wasmTableMirror[funcPtr] = func =
				wasmTable.get(funcPtr);
		}
		/** @suppress {checkTypes} */ assert(
			wasmTable.get(funcPtr) == func,
			"table mirror is out of date",
		);
		return func;
	};

	var invokeEntryPoint = (ptr, arg) => {
		// An old thread on this worker may have been canceled without returning the
		// `runtimeKeepaliveCounter` to zero. Reset it now so the new thread won't
		// be affected.
		runtimeKeepaliveCounter = 0;
		// Same for noExitRuntime.  The default for pthreads should always be false
		// otherwise pthreads would never complete and attempts to pthread_join to
		// them would block forever.
		// pthreads can still choose to set `noExitRuntime` explicitly, or
		// call emscripten_unwind_to_js_event_loop to extend their lifetime beyond
		// their main function.  See comment in src/runtime_pthread.js for more.
		noExitRuntime = 0;
		// pthread entry points are always of signature 'void *ThreadMain(void *arg)'
		// Native codebases sometimes spawn threads with other thread entry point
		// signatures, such as void ThreadMain(void *arg), void *ThreadMain(), or
		// void ThreadMain().  That is not acceptable per C/C++ specification, but
		// x86 compiler ABI extensions enable that to work. If you find the
		// following line to crash, either change the signature to "proper" void
		// *ThreadMain(void *arg) form, or try linking with the Emscripten linker
		// flag -sEMULATE_FUNCTION_POINTER_CASTS to add in emulation for this x86
		// ABI extension.
		var result = getWasmTableEntry(ptr)(arg);
		checkStackCookie();
		function finish(result) {
			// In MINIMAL_RUNTIME the noExitRuntime concept does not apply to
			// pthreads. To exit a pthread with live runtime, use the function
			// emscripten_unwind_to_js_event_loop() in the pthread body.
			if (keepRuntimeAlive()) {
				EXITSTATUS = result;
				return;
			}
			__emscripten_thread_exit(result);
		}
		finish(result);
	};

	var noExitRuntime = true;

	var registerTLSInit = (tlsInitFunc) =>
		PThread.tlsInitFunctions.push(tlsInitFunc);

	/**
	 * @param {number} ptr
	 * @param {number} value
	 * @param {string} type
	 */ function setValue(ptr, value, type = "i8") {
		if (type.endsWith("*")) type = "*";
		switch (type) {
			case "i1":
				(growMemViews(), HEAP8)[ptr] = value;
				break;

			case "i8":
				(growMemViews(), HEAP8)[ptr] = value;
				break;

			case "i16":
				(growMemViews(), HEAP16)[ptr >> 1] = value;
				break;

			case "i32":
				(growMemViews(), HEAP32)[ptr >> 2] = value;
				break;

			case "i64":
				(growMemViews(), HEAP64)[ptr >> 3] = BigInt(value);
				break;

			case "float":
				(growMemViews(), HEAPF32)[ptr >> 2] = value;
				break;

			case "double":
				(growMemViews(), HEAPF64)[ptr >> 3] = value;
				break;

			case "*":
				(growMemViews(), HEAPU32)[ptr >> 2] = value;
				break;

			default:
				abort(`invalid type for setValue: ${type}`);
		}
	}

	var warnOnce = (text) => {
		warnOnce.shown ||= {};
		if (!warnOnce.shown[text]) {
			warnOnce.shown[text] = 1;
			if (ENVIRONMENT_IS_NODE) text = "warning: " + text;
			err(text);
		}
	};

	var wasmMemory;

	var UTF8Decoder = globalThis.TextDecoder && new TextDecoder();

	var findStringEnd = (heapOrArray, idx, maxBytesToRead, ignoreNul) => {
		var maxIdx = idx + maxBytesToRead;
		if (ignoreNul) return maxIdx;
		// TextDecoder needs to know the byte length in advance, it doesn't stop on
		// null terminator by itself.
		// As a tiny code save trick, compare idx against maxIdx using a negation,
		// so that maxBytesToRead=undefined/NaN means Infinity.
		while (heapOrArray[idx] && !(idx >= maxIdx)) ++idx;
		return idx;
	};

	/**
	 * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
	 * array that contains uint8 values, returns a copy of that string as a
	 * Javascript String object.
	 * heapOrArray is either a regular array, or a JavaScript typed array view.
	 * @param {number=} idx
	 * @param {number=} maxBytesToRead
	 * @param {boolean=} ignoreNul - If true, the function will not stop on a NUL character.
	 * @return {string}
	 */ var UTF8ArrayToString = (
		heapOrArray,
		idx = 0,
		maxBytesToRead,
		ignoreNul,
	) => {
		var endPtr = findStringEnd(heapOrArray, idx, maxBytesToRead, ignoreNul);
		// When using conditional TextDecoder, skip it for short strings as the overhead of the native call is not worth it.
		if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
			return UTF8Decoder.decode(
				heapOrArray.buffer instanceof ArrayBuffer
					? heapOrArray.subarray(idx, endPtr)
					: heapOrArray.slice(idx, endPtr),
			);
		}
		var str = "";
		while (idx < endPtr) {
			// For UTF8 byte structure, see:
			// http://en.wikipedia.org/wiki/UTF-8#Description
			// https://www.ietf.org/rfc/rfc2279.txt
			// https://tools.ietf.org/html/rfc3629
			var u0 = heapOrArray[idx++];
			if (!(u0 & 128)) {
				str += String.fromCharCode(u0);
				continue;
			}
			var u1 = heapOrArray[idx++] & 63;
			if ((u0 & 224) == 192) {
				str += String.fromCharCode(((u0 & 31) << 6) | u1);
				continue;
			}
			var u2 = heapOrArray[idx++] & 63;
			if ((u0 & 240) == 224) {
				u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
			} else {
				if ((u0 & 248) != 240)
					warnOnce(
						`Invalid UTF-8 leading byte ${ptrToString(u0)} encountered when deserializing a UTF-8 string in wasm memory to a JS string!`,
					);
				u0 =
					((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
			}
			if (u0 < 65536) {
				str += String.fromCharCode(u0);
			} else {
				var ch = u0 - 65536;
				str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
			}
		}
		return str;
	};

	/**
	 * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
	 * emscripten HEAP, returns a copy of that string as a Javascript String object.
	 *
	 * @param {number} ptr
	 * @param {number=} maxBytesToRead - An optional length that specifies the
	 *   maximum number of bytes to read. You can omit this parameter to scan the
	 *   string until the first 0 byte. If maxBytesToRead is passed, and the string
	 *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
	 *   string will cut short at that byte index.
	 * @param {boolean=} ignoreNul - If true, the function will not stop on a NUL character.
	 * @return {string}
	 */ var UTF8ToString = (ptr, maxBytesToRead, ignoreNul) => {
		assert(
			typeof ptr == "number",
			`UTF8ToString expects a number (got ${typeof ptr})`,
		);
		return ptr
			? UTF8ArrayToString(
					(growMemViews(), HEAPU8),
					ptr,
					maxBytesToRead,
					ignoreNul,
				)
			: "";
	};

	var ___assert_fail = (condition, filename, line, func) =>
		abort(
			`Assertion failed: ${UTF8ToString(condition)}, at: ` +
				[
					filename ? UTF8ToString(filename) : "unknown filename",
					line,
					func ? UTF8ToString(func) : "unknown function",
				],
		);

	var ___call_sighandler = (fp, sig) => getWasmTableEntry(fp)(sig);

	var PATH = {
		isAbs: (path) => path.charAt(0) === "/",
		splitPath: (filename) => {
			var splitPathRe =
				/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
			return splitPathRe.exec(filename).slice(1);
		},
		normalizeArray: (parts, allowAboveRoot) => {
			// if the path tries to go above the root, `up` ends up > 0
			var up = 0;
			for (var i = parts.length - 1; i >= 0; i--) {
				var last = parts[i];
				if (last === ".") {
					parts.splice(i, 1);
				} else if (last === "..") {
					parts.splice(i, 1);
					up++;
				} else if (up) {
					parts.splice(i, 1);
					up--;
				}
			}
			// if the path is allowed to go above the root, restore leading ..s
			if (allowAboveRoot) {
				for (; up; up--) {
					parts.unshift("..");
				}
			}
			return parts;
		},
		normalize: (path) => {
			var isAbsolute = PATH.isAbs(path),
				trailingSlash = path.slice(-1) === "/";
			// Normalize the path
			path = PATH.normalizeArray(
				path.split("/").filter((p) => !!p),
				!isAbsolute,
			).join("/");
			if (!path && !isAbsolute) {
				path = ".";
			}
			if (path && trailingSlash) {
				path += "/";
			}
			return (isAbsolute ? "/" : "") + path;
		},
		dirname: (path) => {
			var result = PATH.splitPath(path),
				root = result[0],
				dir = result[1];
			if (!root && !dir) {
				// No dirname whatsoever
				return ".";
			}
			if (dir) {
				// It has a dirname, strip trailing slash
				dir = dir.slice(0, -1);
			}
			return root + dir;
		},
		basename: (path) => path && path.match(/([^\/]+|\/)\/*$/)[1],
		join: (...paths) => PATH.normalize(paths.join("/")),
		join2: (l, r) => PATH.normalize(l + "/" + r),
	};

	var initRandomFill = () => {
		// This block is not needed on v19+ since crypto.getRandomValues is builtin
		if (ENVIRONMENT_IS_NODE) {
			var nodeCrypto = require("node:crypto");
			return (view) => (nodeCrypto.randomFillSync(view), 0);
		}
		// like with most Web APIs, we can't use Web Crypto API directly on shared memory,
		// so we need to create an intermediate buffer and copy it to the destination
		return (view) => (
			view.set(crypto.getRandomValues(new Uint8Array(view.byteLength))),
			0
		);
	};

	var randomFill = (view) => (randomFill = initRandomFill())(view);

	var PATH_FS = {
		resolve: (...args) => {
			var resolvedPath = "",
				resolvedAbsolute = false;
			for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
				var path = i >= 0 ? args[i] : FS.cwd();
				// Skip empty and invalid entries
				if (typeof path != "string") {
					throw new TypeError("Arguments to path.resolve must be strings");
				} else if (!path) {
					return "";
				}
				resolvedPath = path + "/" + resolvedPath;
				resolvedAbsolute = PATH.isAbs(path);
			}
			// At this point the path should be resolved to a full absolute path, but
			// handle relative paths to be safe (might happen when process.cwd() fails)
			resolvedPath = PATH.normalizeArray(
				resolvedPath.split("/").filter((p) => !!p),
				!resolvedAbsolute,
			).join("/");
			return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
		},
		relative: (from, to) => {
			from = PATH_FS.resolve(from).slice(1);
			to = PATH_FS.resolve(to).slice(1);
			function trim(arr) {
				var start = 0;
				for (; start < arr.length; start++) {
					if (arr[start] !== "") break;
				}
				var end = arr.length - 1;
				for (; end >= 0; end--) {
					if (arr[end] !== "") break;
				}
				if (start > end) return [];
				return arr.slice(start, end - start + 1);
			}
			var fromParts = trim(from.split("/"));
			var toParts = trim(to.split("/"));
			var length = Math.min(fromParts.length, toParts.length);
			var samePartsLength = length;
			for (var i = 0; i < length; i++) {
				if (fromParts[i] !== toParts[i]) {
					samePartsLength = i;
					break;
				}
			}
			var outputParts = [];
			for (var i = samePartsLength; i < fromParts.length; i++) {
				outputParts.push("..");
			}
			outputParts = outputParts.concat(toParts.slice(samePartsLength));
			return outputParts.join("/");
		},
	};

	var FS_stdin_getChar_buffer = [];

	var lengthBytesUTF8 = (str) => {
		var len = 0;
		for (var i = 0; i < str.length; ++i) {
			// Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
			// unit, not a Unicode code point of the character! So decode
			// UTF16->UTF32->UTF8.
			// See http://unicode.org/faq/utf_bom.html#utf16-3
			var c = str.charCodeAt(i);
			// possibly a lead surrogate
			if (c <= 127) {
				len++;
			} else if (c <= 2047) {
				len += 2;
			} else if (c >= 55296 && c <= 57343) {
				len += 4;
				++i;
			} else {
				len += 3;
			}
		}
		return len;
	};

	var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
		assert(
			typeof str === "string",
			`stringToUTF8Array expects a string (got ${typeof str})`,
		);
		// Parameter maxBytesToWrite is not optional. Negative values, 0, null,
		// undefined and false each don't write out any bytes.
		if (!(maxBytesToWrite > 0)) return 0;
		var startIdx = outIdx;
		var endIdx = outIdx + maxBytesToWrite - 1;
		// -1 for string null terminator.
		for (var i = 0; i < str.length; ++i) {
			// For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
			// and https://www.ietf.org/rfc/rfc2279.txt
			// and https://tools.ietf.org/html/rfc3629
			var u = str.codePointAt(i);
			if (u <= 127) {
				if (outIdx >= endIdx) break;
				heap[outIdx++] = u;
			} else if (u <= 2047) {
				if (outIdx + 1 >= endIdx) break;
				heap[outIdx++] = 192 | (u >> 6);
				heap[outIdx++] = 128 | (u & 63);
			} else if (u <= 65535) {
				if (outIdx + 2 >= endIdx) break;
				heap[outIdx++] = 224 | (u >> 12);
				heap[outIdx++] = 128 | ((u >> 6) & 63);
				heap[outIdx++] = 128 | (u & 63);
			} else {
				if (outIdx + 3 >= endIdx) break;
				if (u > 1114111)
					warnOnce(
						`Invalid Unicode code point ${ptrToString(u)} encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).`,
					);
				heap[outIdx++] = 240 | (u >> 18);
				heap[outIdx++] = 128 | ((u >> 12) & 63);
				heap[outIdx++] = 128 | ((u >> 6) & 63);
				heap[outIdx++] = 128 | (u & 63);
				// Gotcha: if codePoint is over 0xFFFF, it is represented as a surrogate pair in UTF-16.
				// We need to manually skip over the second code unit for correct iteration.
				i++;
			}
		}
		// Null-terminate the pointer to the buffer.
		heap[outIdx] = 0;
		return outIdx - startIdx;
	};

	/** @type {function(string, boolean=, number=)} */ var intArrayFromString = (
		stringy,
		dontAddNull,
		length,
	) => {
		var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
		var u8array = new Array(len);
		var numBytesWritten = stringToUTF8Array(
			stringy,
			u8array,
			0,
			u8array.length,
		);
		if (dontAddNull) u8array.length = numBytesWritten;
		return u8array;
	};

	var FS_stdin_getChar = () => {
		if (!FS_stdin_getChar_buffer.length) {
			var result = null;
			if (ENVIRONMENT_IS_NODE) {
				// we will read data by chunks of BUFSIZE
				var BUFSIZE = 256;
				var buf = Buffer.alloc(BUFSIZE);
				var bytesRead = 0;
				// For some reason we must suppress a closure warning here, even though
				// fd definitely exists on process.stdin, and is even the proper way to
				// get the fd of stdin,
				// https://github.com/nodejs/help/issues/2136#issuecomment-523649904
				// This started to happen after moving this logic out of library_tty.js,
				// so it is related to the surrounding code in some unclear manner.
				/** @suppress {missingProperties} */ var fd = process.stdin.fd;
				try {
					bytesRead = fs.readSync(fd, buf, 0, BUFSIZE);
				} catch (e) {
					// Cross-platform differences: on Windows, reading EOF throws an
					// exception, but on other OSes, reading EOF returns 0. Uniformize
					// behavior by treating the EOF exception to return 0.
					if (e.toString().includes("EOF")) bytesRead = 0;
					else throw e;
				}
				if (bytesRead > 0) {
					result = buf.slice(0, bytesRead).toString("utf-8");
				}
			} else if (globalThis.window?.prompt) {
				// Browser.
				result = window.prompt("Input: ");
				// returns null on cancel
				if (result !== null) {
					result += "\n";
				}
			} else {
			}
			if (!result) {
				return null;
			}
			FS_stdin_getChar_buffer = intArrayFromString(result, true);
		}
		return FS_stdin_getChar_buffer.shift();
	};

	var TTY = {
		ttys: [],
		init() {},
		shutdown() {},
		register(dev, ops) {
			TTY.ttys[dev] = {
				input: [],
				output: [],
				ops,
			};
			FS.registerDevice(dev, TTY.stream_ops);
		},
		stream_ops: {
			open(stream) {
				var tty = TTY.ttys[stream.node.rdev];
				if (!tty) {
					throw new FS.ErrnoError(43);
				}
				stream.tty = tty;
				stream.seekable = false;
			},
			close(stream) {
				// flush any pending line data
				stream.tty.ops.fsync(stream.tty);
			},
			fsync(stream) {
				stream.tty.ops.fsync(stream.tty);
			},
			read(stream, buffer, offset, length, pos) {
				if (!stream.tty || !stream.tty.ops.get_char) {
					throw new FS.ErrnoError(60);
				}
				var bytesRead = 0;
				for (var i = 0; i < length; i++) {
					var result;
					try {
						result = stream.tty.ops.get_char(stream.tty);
					} catch (e) {
						throw new FS.ErrnoError(29);
					}
					if (result === undefined && bytesRead === 0) {
						throw new FS.ErrnoError(6);
					}
					if (result === null || result === undefined) break;
					bytesRead++;
					buffer[offset + i] = result;
				}
				if (bytesRead) {
					stream.node.atime = Date.now();
				}
				return bytesRead;
			},
			write(stream, buffer, offset, length, pos) {
				if (!stream.tty || !stream.tty.ops.put_char) {
					throw new FS.ErrnoError(60);
				}
				try {
					for (var i = 0; i < length; i++) {
						stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
					}
				} catch (e) {
					throw new FS.ErrnoError(29);
				}
				if (length) {
					stream.node.mtime = stream.node.ctime = Date.now();
				}
				return i;
			},
		},
		default_tty_ops: {
			get_char(tty) {
				return FS_stdin_getChar();
			},
			put_char(tty, val) {
				if (val === null || val === 10) {
					out(UTF8ArrayToString(tty.output));
					tty.output = [];
				} else {
					if (val != 0) tty.output.push(val);
				}
			},
			fsync(tty) {
				if (tty.output?.length > 0) {
					out(UTF8ArrayToString(tty.output));
					tty.output = [];
				}
			},
			ioctl_tcgets(tty) {
				// typical setting
				return {
					c_iflag: 25856,
					c_oflag: 5,
					c_cflag: 191,
					c_lflag: 35387,
					c_cc: [
						3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0,
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					],
				};
			},
			ioctl_tcsets(tty, optional_actions, data) {
				// currently just ignore
				return 0;
			},
			ioctl_tiocgwinsz(tty) {
				return [24, 80];
			},
		},
		default_tty1_ops: {
			put_char(tty, val) {
				if (val === null || val === 10) {
					err(UTF8ArrayToString(tty.output));
					tty.output = [];
				} else {
					if (val != 0) tty.output.push(val);
				}
			},
			fsync(tty) {
				if (tty.output?.length > 0) {
					err(UTF8ArrayToString(tty.output));
					tty.output = [];
				}
			},
		},
	};

	var zeroMemory = (ptr, size) =>
		(growMemViews(), HEAPU8).fill(0, ptr, ptr + size);

	var alignMemory = (size, alignment) => {
		assert(alignment, "alignment argument is required");
		return Math.ceil(size / alignment) * alignment;
	};

	var mmapAlloc = (size) => {
		size = alignMemory(size, 65536);
		var ptr = _emscripten_builtin_memalign(65536, size);
		if (ptr) zeroMemory(ptr, size);
		return ptr;
	};

	var MEMFS = {
		ops_table: null,
		mount(mount) {
			return MEMFS.createNode(null, "/", 16895, 0);
		},
		createNode(parent, name, mode, dev) {
			if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
				// not supported
				throw new FS.ErrnoError(63);
			}
			MEMFS.ops_table ||= {
				dir: {
					node: {
						getattr: MEMFS.node_ops.getattr,
						setattr: MEMFS.node_ops.setattr,
						lookup: MEMFS.node_ops.lookup,
						mknod: MEMFS.node_ops.mknod,
						rename: MEMFS.node_ops.rename,
						unlink: MEMFS.node_ops.unlink,
						rmdir: MEMFS.node_ops.rmdir,
						readdir: MEMFS.node_ops.readdir,
						symlink: MEMFS.node_ops.symlink,
					},
					stream: {
						llseek: MEMFS.stream_ops.llseek,
					},
				},
				file: {
					node: {
						getattr: MEMFS.node_ops.getattr,
						setattr: MEMFS.node_ops.setattr,
					},
					stream: {
						llseek: MEMFS.stream_ops.llseek,
						read: MEMFS.stream_ops.read,
						write: MEMFS.stream_ops.write,
						mmap: MEMFS.stream_ops.mmap,
						msync: MEMFS.stream_ops.msync,
					},
				},
				link: {
					node: {
						getattr: MEMFS.node_ops.getattr,
						setattr: MEMFS.node_ops.setattr,
						readlink: MEMFS.node_ops.readlink,
					},
					stream: {},
				},
				chrdev: {
					node: {
						getattr: MEMFS.node_ops.getattr,
						setattr: MEMFS.node_ops.setattr,
					},
					stream: FS.chrdev_stream_ops,
				},
			};
			var node = FS.createNode(parent, name, mode, dev);
			if (FS.isDir(node.mode)) {
				node.node_ops = MEMFS.ops_table.dir.node;
				node.stream_ops = MEMFS.ops_table.dir.stream;
				node.contents = {};
			} else if (FS.isFile(node.mode)) {
				node.node_ops = MEMFS.ops_table.file.node;
				node.stream_ops = MEMFS.ops_table.file.stream;
				// The actual number of bytes used in the typed array, as opposed to
				// contents.length which gives the whole capacity.
				node.usedBytes = 0;
				// The byte data of the file is stored in a typed array.
				// Note: typed arrays are not resizable like normal JS arrays are, so
				// there is a small penalty involved for appending file writes that
				// continuously grow a file similar to std::vector capacity vs used.
				node.contents = MEMFS.emptyFileContents ??= new Uint8Array(0);
			} else if (FS.isLink(node.mode)) {
				node.node_ops = MEMFS.ops_table.link.node;
				node.stream_ops = MEMFS.ops_table.link.stream;
			} else if (FS.isChrdev(node.mode)) {
				node.node_ops = MEMFS.ops_table.chrdev.node;
				node.stream_ops = MEMFS.ops_table.chrdev.stream;
			}
			node.atime = node.mtime = node.ctime = Date.now();
			// add the new node to the parent
			if (parent) {
				parent.contents[name] = node;
				parent.atime = parent.mtime = parent.ctime = node.atime;
			}
			return node;
		},
		getFileDataAsTypedArray(node) {
			assert(
				FS.isFile(node.mode),
				"getFileDataAsTypedArray called on non-file",
			);
			return node.contents.subarray(0, node.usedBytes);
		},
		expandFileStorage(node, newCapacity) {
			var prevCapacity = node.contents.length;
			if (prevCapacity >= newCapacity) return;
			// No need to expand, the storage was already large enough.
			// Don't expand strictly to the given requested limit if it's only a very
			// small increase, but instead geometrically grow capacity.
			// For small filesizes (<1MB), perform size*2 geometric increase, but for
			// large sizes, do a much more conservative size*1.125 increase to avoid
			// overshooting the allocation cap by a very large margin.
			var CAPACITY_DOUBLING_MAX = 1024 * 1024;
			newCapacity = Math.max(
				newCapacity,
				(prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>>
					0,
			);
			if (prevCapacity) newCapacity = Math.max(newCapacity, 256);
			// At minimum allocate 256b for each file when expanding.
			var oldContents = MEMFS.getFileDataAsTypedArray(node);
			node.contents = new Uint8Array(newCapacity);
			// Allocate new storage.
			node.contents.set(oldContents);
		},
		resizeFileStorage(node, newSize) {
			if (node.usedBytes == newSize) return;
			var oldContents = node.contents;
			node.contents = new Uint8Array(newSize);
			// Allocate new storage.
			node.contents.set(
				oldContents.subarray(0, Math.min(newSize, node.usedBytes)),
			);
			// Copy old data over to the new storage.
			node.usedBytes = newSize;
		},
		node_ops: {
			getattr(node) {
				var attr = {};
				// device numbers reuse inode numbers.
				attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
				attr.ino = node.id;
				attr.mode = node.mode;
				attr.nlink = 1;
				attr.uid = 0;
				attr.gid = 0;
				attr.rdev = node.rdev;
				if (FS.isDir(node.mode)) {
					attr.size = 4096;
				} else if (FS.isFile(node.mode)) {
					attr.size = node.usedBytes;
				} else if (FS.isLink(node.mode)) {
					attr.size = node.link.length;
				} else {
					attr.size = 0;
				}
				attr.atime = new Date(node.atime);
				attr.mtime = new Date(node.mtime);
				attr.ctime = new Date(node.ctime);
				// NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
				//       but this is not required by the standard.
				attr.blksize = 4096;
				attr.blocks = Math.ceil(attr.size / attr.blksize);
				return attr;
			},
			setattr(node, attr) {
				for (const key of ["mode", "atime", "mtime", "ctime"]) {
					if (attr[key] != null) {
						node[key] = attr[key];
					}
				}
				if (attr.size !== undefined) {
					MEMFS.resizeFileStorage(node, attr.size);
				}
			},
			lookup(parent, name) {
				throw new FS.ErrnoError(44);
			},
			mknod(parent, name, mode, dev) {
				return MEMFS.createNode(parent, name, mode, dev);
			},
			rename(old_node, new_dir, new_name) {
				var new_node;
				try {
					new_node = FS.lookupNode(new_dir, new_name);
				} catch (e) {}
				if (new_node) {
					if (FS.isDir(old_node.mode)) {
						// if we're overwriting a directory at new_name, make sure it's empty.
						for (var i in new_node.contents) {
							throw new FS.ErrnoError(55);
						}
					}
					FS.hashRemoveNode(new_node);
				}
				// do the internal rewiring
				delete old_node.parent.contents[old_node.name];
				new_dir.contents[new_name] = old_node;
				old_node.name = new_name;
				new_dir.ctime =
					new_dir.mtime =
					old_node.parent.ctime =
					old_node.parent.mtime =
						Date.now();
			},
			unlink(parent, name) {
				delete parent.contents[name];
				parent.ctime = parent.mtime = Date.now();
			},
			rmdir(parent, name) {
				var node = FS.lookupNode(parent, name);
				for (var i in node.contents) {
					throw new FS.ErrnoError(55);
				}
				delete parent.contents[name];
				parent.ctime = parent.mtime = Date.now();
			},
			readdir(node) {
				return [".", "..", ...Object.keys(node.contents)];
			},
			symlink(parent, newname, oldpath) {
				var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
				node.link = oldpath;
				return node;
			},
			readlink(node) {
				if (!FS.isLink(node.mode)) {
					throw new FS.ErrnoError(28);
				}
				return node.link;
			},
		},
		stream_ops: {
			read(stream, buffer, offset, length, position) {
				var contents = stream.node.contents;
				if (position >= stream.node.usedBytes) return 0;
				var size = Math.min(stream.node.usedBytes - position, length);
				assert(size >= 0);
				buffer.set(contents.subarray(position, position + size), offset);
				return size;
			},
			write(stream, buffer, offset, length, position, canOwn) {
				assert(buffer.subarray, "FS.write expects a TypedArray");
				// If the buffer is located in main memory (HEAP), and if
				// memory can grow, we can't hold on to references of the
				// memory buffer, as they may get invalidated. That means we
				// need to copy its contents.
				if (buffer.buffer === (growMemViews(), HEAP8).buffer) {
					canOwn = false;
				}
				if (!length) return 0;
				var node = stream.node;
				node.mtime = node.ctime = Date.now();
				if (canOwn) {
					assert(
						position === 0,
						"canOwn must imply no weird position inside the file",
					);
					node.contents = buffer.subarray(offset, offset + length);
					node.usedBytes = length;
				} else if (node.usedBytes === 0 && position === 0) {
					// If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
					node.contents = buffer.slice(offset, offset + length);
					node.usedBytes = length;
				} else {
					MEMFS.expandFileStorage(node, position + length);
					// Use typed array write which is available.
					node.contents.set(buffer.subarray(offset, offset + length), position);
					node.usedBytes = Math.max(node.usedBytes, position + length);
				}
				return length;
			},
			llseek(stream, offset, whence) {
				var position = offset;
				if (whence === 1) {
					position += stream.position;
				} else if (whence === 2) {
					if (FS.isFile(stream.node.mode)) {
						position += stream.node.usedBytes;
					}
				}
				if (position < 0) {
					throw new FS.ErrnoError(28);
				}
				return position;
			},
			mmap(stream, length, position, prot, flags) {
				if (!FS.isFile(stream.node.mode)) {
					throw new FS.ErrnoError(43);
				}
				var ptr;
				var allocated;
				var contents = stream.node.contents;
				// Only make a new copy when MAP_PRIVATE is specified.
				if (
					!(flags & 2) &&
					contents.buffer === (growMemViews(), HEAP8).buffer
				) {
					// We can't emulate MAP_SHARED when the file is not backed by the
					// buffer we're mapping to (e.g. the HEAP buffer).
					allocated = false;
					ptr = contents.byteOffset;
				} else {
					allocated = true;
					ptr = mmapAlloc(length);
					if (!ptr) {
						throw new FS.ErrnoError(48);
					}
					if (contents) {
						// Try to avoid unnecessary slices.
						if (position > 0 || position + length < contents.length) {
							if (contents.subarray) {
								contents = contents.subarray(position, position + length);
							} else {
								contents = Array.prototype.slice.call(
									contents,
									position,
									position + length,
								);
							}
						}
						(growMemViews(), HEAP8).set(contents, ptr);
					}
				}
				return {
					ptr,
					allocated,
				};
			},
			msync(stream, buffer, offset, length, mmapFlags) {
				MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
				// should we check if bytesWritten and length are the same?
				return 0;
			},
		},
	};

	var FS_modeStringToFlags = (str) => {
		if (typeof str != "string") return str;
		var flagModes = {
			r: 0,
			"r+": 2,
			w: 512 | 64 | 1,
			"w+": 512 | 64 | 2,
			a: 1024 | 64 | 1,
			"a+": 1024 | 64 | 2,
		};
		var flags = flagModes[str];
		if (typeof flags == "undefined") {
			throw new Error(`Unknown file open mode: ${str}`);
		}
		return flags;
	};

	var FS_fileDataToTypedArray = (data) => {
		if (typeof data == "string") {
			data = intArrayFromString(data, true);
		}
		if (!data.subarray) {
			data = new Uint8Array(data);
		}
		return data;
	};

	var FS_getMode = (canRead, canWrite) => {
		var mode = 0;
		if (canRead) mode |= 292 | 73;
		if (canWrite) mode |= 146;
		return mode;
	};

	var strError = (errno) => UTF8ToString(_strerror(errno));

	var ERRNO_CODES = {
		EPERM: 63,
		ENOENT: 44,
		ESRCH: 71,
		EINTR: 27,
		EIO: 29,
		ENXIO: 60,
		E2BIG: 1,
		ENOEXEC: 45,
		EBADF: 8,
		ECHILD: 12,
		EAGAIN: 6,
		EWOULDBLOCK: 6,
		ENOMEM: 48,
		EACCES: 2,
		EFAULT: 21,
		ENOTBLK: 105,
		EBUSY: 10,
		EEXIST: 20,
		EXDEV: 75,
		ENODEV: 43,
		ENOTDIR: 54,
		EISDIR: 31,
		EINVAL: 28,
		ENFILE: 41,
		EMFILE: 33,
		ENOTTY: 59,
		ETXTBSY: 74,
		EFBIG: 22,
		ENOSPC: 51,
		ESPIPE: 70,
		EROFS: 69,
		EMLINK: 34,
		EPIPE: 64,
		EDOM: 18,
		ERANGE: 68,
		ENOMSG: 49,
		EIDRM: 24,
		ECHRNG: 106,
		EL2NSYNC: 156,
		EL3HLT: 107,
		EL3RST: 108,
		ELNRNG: 109,
		EUNATCH: 110,
		ENOCSI: 111,
		EL2HLT: 112,
		EDEADLK: 16,
		ENOLCK: 46,
		EBADE: 113,
		EBADR: 114,
		EXFULL: 115,
		ENOANO: 104,
		EBADRQC: 103,
		EBADSLT: 102,
		EDEADLOCK: 16,
		EBFONT: 101,
		ENOSTR: 100,
		ENODATA: 116,
		ETIME: 117,
		ENOSR: 118,
		ENONET: 119,
		ENOPKG: 120,
		EREMOTE: 121,
		ENOLINK: 47,
		EADV: 122,
		ESRMNT: 123,
		ECOMM: 124,
		EPROTO: 65,
		EMULTIHOP: 36,
		EDOTDOT: 125,
		EBADMSG: 9,
		ENOTUNIQ: 126,
		EBADFD: 127,
		EREMCHG: 128,
		ELIBACC: 129,
		ELIBBAD: 130,
		ELIBSCN: 131,
		ELIBMAX: 132,
		ELIBEXEC: 133,
		ENOSYS: 52,
		ENOTEMPTY: 55,
		ENAMETOOLONG: 37,
		ELOOP: 32,
		EOPNOTSUPP: 138,
		EPFNOSUPPORT: 139,
		ECONNRESET: 15,
		ENOBUFS: 42,
		EAFNOSUPPORT: 5,
		EPROTOTYPE: 67,
		ENOTSOCK: 57,
		ENOPROTOOPT: 50,
		ESHUTDOWN: 140,
		ECONNREFUSED: 14,
		EADDRINUSE: 3,
		ECONNABORTED: 13,
		ENETUNREACH: 40,
		ENETDOWN: 38,
		ETIMEDOUT: 73,
		EHOSTDOWN: 142,
		EHOSTUNREACH: 23,
		EINPROGRESS: 26,
		EALREADY: 7,
		EDESTADDRREQ: 17,
		EMSGSIZE: 35,
		EPROTONOSUPPORT: 66,
		ESOCKTNOSUPPORT: 137,
		EADDRNOTAVAIL: 4,
		ENETRESET: 39,
		EISCONN: 30,
		ENOTCONN: 53,
		ETOOMANYREFS: 141,
		EUSERS: 136,
		EDQUOT: 19,
		ESTALE: 72,
		ENOTSUP: 138,
		ENOMEDIUM: 148,
		EILSEQ: 25,
		EOVERFLOW: 61,
		ECANCELED: 11,
		ENOTRECOVERABLE: 56,
		EOWNERDEAD: 62,
		ESTRPIPE: 135,
	};

	var asyncLoad = async (url) => {
		var arrayBuffer = await readAsync(url);
		assert(arrayBuffer, `Loading data file "${url}" failed (no arrayBuffer).`);
		return new Uint8Array(arrayBuffer);
	};

	var FS_createDataFile = (...args) => FS.createDataFile(...args);

	var getUniqueRunDependency = (id) => {
		var orig = id;
		while (1) {
			if (!runDependencyTracking[id]) return id;
			id = orig + Math.random();
		}
	};

	var runDependencies = 0;

	var dependenciesFulfilled = null;

	var runDependencyTracking = {};

	var runDependencyWatcher = null;

	var removeRunDependency = (id) => {
		runDependencies--;
		Module["monitorRunDependencies"]?.(runDependencies);
		assert(id, "removeRunDependency requires an ID");
		assert(runDependencyTracking[id]);
		delete runDependencyTracking[id];
		if (runDependencies == 0) {
			if (runDependencyWatcher !== null) {
				clearInterval(runDependencyWatcher);
				runDependencyWatcher = null;
			}
			if (dependenciesFulfilled) {
				var callback = dependenciesFulfilled;
				dependenciesFulfilled = null;
				callback();
			}
		}
	};

	var addRunDependency = (id) => {
		runDependencies++;
		Module["monitorRunDependencies"]?.(runDependencies);
		assert(id, "addRunDependency requires an ID");
		assert(!runDependencyTracking[id]);
		runDependencyTracking[id] = 1;
		if (runDependencyWatcher === null && globalThis.setInterval) {
			// Check for missing dependencies every few seconds
			runDependencyWatcher = setInterval(() => {
				if (ABORT) {
					clearInterval(runDependencyWatcher);
					runDependencyWatcher = null;
					return;
				}
				var shown = false;
				for (var dep in runDependencyTracking) {
					if (!shown) {
						shown = true;
						err("still waiting on run dependencies:");
					}
					err(`dependency: ${dep}`);
				}
				if (shown) {
					err("(end of list)");
				}
			}, 1e4);
			// Prevent this timer from keeping the runtime alive if nothing
			// else is.
			runDependencyWatcher.unref?.();
		}
	};

	var preloadPlugins = [];

	var FS_handledByPreloadPlugin = async (byteArray, fullname) => {
		// Ensure plugins are ready.
		if (typeof Browser != "undefined") Browser.init();
		for (var plugin of preloadPlugins) {
			if (plugin["canHandle"](fullname)) {
				assert(
					plugin["handle"].constructor.name === "AsyncFunction",
					"Filesystem plugin handlers must be async functions (See #24914)",
				);
				return plugin["handle"](byteArray, fullname);
			}
		}
		// If no plugin handled this file then return the original/unmodified
		// byteArray.
		return byteArray;
	};

	var FS_preloadFile = async (
		parent,
		name,
		url,
		canRead,
		canWrite,
		dontCreateFile,
		canOwn,
		preFinish,
	) => {
		// TODO we should allow people to just pass in a complete filename instead
		// of parent and name being that we just join them anyways
		var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
		var dep = getUniqueRunDependency(`cp ${fullname}`);
		// might have several active requests for the same fullname
		addRunDependency(dep);
		try {
			var byteArray = url;
			if (typeof url == "string") {
				byteArray = await asyncLoad(url);
			}
			byteArray = await FS_handledByPreloadPlugin(byteArray, fullname);
			preFinish?.();
			if (!dontCreateFile) {
				FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
			}
		} finally {
			removeRunDependency(dep);
		}
	};

	var FS_createPreloadedFile = (
		parent,
		name,
		url,
		canRead,
		canWrite,
		onload,
		onerror,
		dontCreateFile,
		canOwn,
		preFinish,
	) => {
		FS_preloadFile(
			parent,
			name,
			url,
			canRead,
			canWrite,
			dontCreateFile,
			canOwn,
			preFinish,
		)
			.then(onload)
			.catch(onerror);
	};

	var FS = {
		root: null,
		mounts: [],
		devices: {},
		streams: [],
		nextInode: 1,
		nameTable: null,
		currentPath: "/",
		initialized: false,
		ignorePermissions: true,
		filesystems: null,
		syncFSRequests: 0,
		ErrnoError: class extends Error {
			name = "ErrnoError";
			// We set the `name` property to be able to identify `FS.ErrnoError`
			// - the `name` is a standard ECMA-262 property of error objects. Kind of good to have it anyway.
			// - when using PROXYFS, an error can come from an underlying FS
			// as different FS objects have their own FS.ErrnoError each,
			// the test `err instanceof FS.ErrnoError` won't detect an error coming from another filesystem, causing bugs.
			// we'll use the reliable test `err.name == "ErrnoError"` instead
			constructor(errno) {
				super(runtimeInitialized ? strError(errno) : "");
				this.errno = errno;
				for (var key in ERRNO_CODES) {
					if (ERRNO_CODES[key] === errno) {
						this.code = key;
						break;
					}
				}
			}
		},
		FSStream: class {
			shared = {};
			get object() {
				return this.node;
			}
			set object(val) {
				this.node = val;
			}
			get isRead() {
				return (this.flags & 2097155) !== 1;
			}
			get isWrite() {
				return (this.flags & 2097155) !== 0;
			}
			get isAppend() {
				return this.flags & 1024;
			}
			get flags() {
				return this.shared.flags;
			}
			set flags(val) {
				this.shared.flags = val;
			}
			get position() {
				return this.shared.position;
			}
			set position(val) {
				this.shared.position = val;
			}
		},
		FSNode: class {
			node_ops = {};
			stream_ops = {};
			readMode = 292 | 73;
			writeMode = 146;
			mounted = null;
			constructor(parent, name, mode, rdev) {
				if (!parent) {
					parent = this;
				}
				this.parent = parent;
				this.mount = parent.mount;
				this.id = FS.nextInode++;
				this.name = name;
				this.mode = mode;
				this.rdev = rdev;
				this.atime = this.mtime = this.ctime = Date.now();
			}
			get read() {
				return (this.mode & this.readMode) === this.readMode;
			}
			set read(val) {
				val ? (this.mode |= this.readMode) : (this.mode &= ~this.readMode);
			}
			get write() {
				return (this.mode & this.writeMode) === this.writeMode;
			}
			set write(val) {
				val ? (this.mode |= this.writeMode) : (this.mode &= ~this.writeMode);
			}
			get isFolder() {
				return FS.isDir(this.mode);
			}
			get isDevice() {
				return FS.isChrdev(this.mode);
			}
		},
		lookupPath(path, opts = {}) {
			if (!path) {
				throw new FS.ErrnoError(44);
			}
			opts.follow_mount ??= true;
			if (!PATH.isAbs(path)) {
				path = FS.cwd() + "/" + path;
			}
			// limit max consecutive symlinks to SYMLOOP_MAX.
			linkloop: for (var nlinks = 0; nlinks < 40; nlinks++) {
				// split the absolute path
				var parts = path.split("/").filter((p) => !!p);
				// start at the root
				var current = FS.root;
				var current_path = "/";
				for (var i = 0; i < parts.length; i++) {
					var islast = i === parts.length - 1;
					if (islast && opts.parent) {
						// stop resolving
						break;
					}
					if (parts[i] === ".") {
						continue;
					}
					if (parts[i] === "..") {
						current_path = PATH.dirname(current_path);
						if (FS.isRoot(current)) {
							path = current_path + "/" + parts.slice(i + 1).join("/");
							// We're making progress here, don't let many consecutive ..'s
							// lead to ELOOP
							nlinks--;
							continue linkloop;
						} else {
							current = current.parent;
						}
						continue;
					}
					current_path = PATH.join2(current_path, parts[i]);
					try {
						current = FS.lookupNode(current, parts[i]);
					} catch (e) {
						// if noent_okay is true, suppress a ENOENT in the last component
						// and return an object with an undefined node. This is needed for
						// resolving symlinks in the path when creating a file.
						if (e?.errno === 44 && islast && opts.noent_okay) {
							return {
								path: current_path,
							};
						}
						throw e;
					}
					// jump to the mount's root node if this is a mountpoint
					if (FS.isMountpoint(current) && (!islast || opts.follow_mount)) {
						current = current.mounted.root;
					}
					// by default, lookupPath will not follow a symlink if it is the final path component.
					// setting opts.follow = true will override this behavior.
					if (FS.isLink(current.mode) && (!islast || opts.follow)) {
						if (!current.node_ops.readlink) {
							throw new FS.ErrnoError(52);
						}
						var link = current.node_ops.readlink(current);
						if (!PATH.isAbs(link)) {
							link = PATH.dirname(current_path) + "/" + link;
						}
						path = link + "/" + parts.slice(i + 1).join("/");
						continue linkloop;
					}
				}
				return {
					path: current_path,
					node: current,
				};
			}
			throw new FS.ErrnoError(32);
		},
		getPath(node) {
			var path;
			while (true) {
				if (FS.isRoot(node)) {
					var mount = node.mount.mountpoint;
					if (!path) return mount;
					return mount[mount.length - 1] !== "/"
						? `${mount}/${path}`
						: mount + path;
				}
				path = path ? `${node.name}/${path}` : node.name;
				node = node.parent;
			}
		},
		hashName(parentid, name) {
			var hash = 0;
			for (var i = 0; i < name.length; i++) {
				hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
			}
			return ((parentid + hash) >>> 0) % FS.nameTable.length;
		},
		hashAddNode(node) {
			var hash = FS.hashName(node.parent.id, node.name);
			node.name_next = FS.nameTable[hash];
			FS.nameTable[hash] = node;
		},
		hashRemoveNode(node) {
			var hash = FS.hashName(node.parent.id, node.name);
			if (FS.nameTable[hash] === node) {
				FS.nameTable[hash] = node.name_next;
			} else {
				var current = FS.nameTable[hash];
				while (current) {
					if (current.name_next === node) {
						current.name_next = node.name_next;
						break;
					}
					current = current.name_next;
				}
			}
		},
		lookupNode(parent, name) {
			var errCode = FS.mayLookup(parent);
			if (errCode) {
				throw new FS.ErrnoError(errCode);
			}
			var hash = FS.hashName(parent.id, name);
			for (var node = FS.nameTable[hash]; node; node = node.name_next) {
				var nodeName = node.name;
				if (node.parent.id === parent.id && nodeName === name) {
					return node;
				}
			}
			// if we failed to find it in the cache, call into the VFS
			return FS.lookup(parent, name);
		},
		createNode(parent, name, mode, rdev) {
			assert(typeof parent == "object");
			var node = new FS.FSNode(parent, name, mode, rdev);
			FS.hashAddNode(node);
			return node;
		},
		destroyNode(node) {
			FS.hashRemoveNode(node);
		},
		isRoot(node) {
			return node === node.parent;
		},
		isMountpoint(node) {
			return !!node.mounted;
		},
		isFile(mode) {
			return (mode & 61440) === 32768;
		},
		isDir(mode) {
			return (mode & 61440) === 16384;
		},
		isLink(mode) {
			return (mode & 61440) === 40960;
		},
		isChrdev(mode) {
			return (mode & 61440) === 8192;
		},
		isBlkdev(mode) {
			return (mode & 61440) === 24576;
		},
		isFIFO(mode) {
			return (mode & 61440) === 4096;
		},
		isSocket(mode) {
			return (mode & 49152) === 49152;
		},
		flagsToPermissionString(flag) {
			var perms = ["r", "w", "rw"][flag & 3];
			if (flag & 512) {
				perms += "w";
			}
			return perms;
		},
		nodePermissions(node, perms) {
			if (FS.ignorePermissions) {
				return 0;
			}
			// return 0 if any user, group or owner bits are set.
			if (perms.includes("r") && !(node.mode & 292)) {
				return 2;
			}
			if (perms.includes("w") && !(node.mode & 146)) {
				return 2;
			}
			if (perms.includes("x") && !(node.mode & 73)) {
				return 2;
			}
			return 0;
		},
		mayLookup(dir) {
			if (!FS.isDir(dir.mode)) return 54;
			var errCode = FS.nodePermissions(dir, "x");
			if (errCode) return errCode;
			if (!dir.node_ops.lookup) return 2;
			return 0;
		},
		mayCreate(dir, name) {
			if (!FS.isDir(dir.mode)) {
				return 54;
			}
			try {
				var node = FS.lookupNode(dir, name);
				return 20;
			} catch (e) {}
			return FS.nodePermissions(dir, "wx");
		},
		mayDelete(dir, name, isdir) {
			var node;
			try {
				node = FS.lookupNode(dir, name);
			} catch (e) {
				return e.errno;
			}
			var errCode = FS.nodePermissions(dir, "wx");
			if (errCode) {
				return errCode;
			}
			if (isdir) {
				if (!FS.isDir(node.mode)) {
					return 54;
				}
				if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
					return 10;
				}
			} else if (FS.isDir(node.mode)) {
				return 31;
			}
			return 0;
		},
		mayOpen(node, flags) {
			if (!node) {
				return 44;
			}
			if (FS.isLink(node.mode)) {
				return 32;
			}
			var mode = FS.flagsToPermissionString(flags);
			if (FS.isDir(node.mode)) {
				// opening for write
				// TODO: check for O_SEARCH? (== search for dir only)
				if (mode !== "r" || flags & (512 | 64)) {
					return 31;
				}
			}
			return FS.nodePermissions(node, mode);
		},
		checkOpExists(op, err) {
			if (!op) {
				throw new FS.ErrnoError(err);
			}
			return op;
		},
		MAX_OPEN_FDS: 4096,
		nextfd() {
			for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
				if (!FS.streams[fd]) {
					return fd;
				}
			}
			throw new FS.ErrnoError(33);
		},
		getStreamChecked(fd) {
			var stream = FS.getStream(fd);
			if (!stream) {
				throw new FS.ErrnoError(8);
			}
			return stream;
		},
		getStream: (fd) => FS.streams[fd],
		createStream(stream, fd = -1) {
			assert(fd >= -1);
			// clone it, so we can return an instance of FSStream
			stream = Object.assign(new FS.FSStream(), stream);
			if (fd == -1) {
				fd = FS.nextfd();
			}
			stream.fd = fd;
			FS.streams[fd] = stream;
			return stream;
		},
		closeStream(fd) {
			FS.streams[fd] = null;
		},
		dupStream(origStream, fd = -1) {
			var stream = FS.createStream(origStream, fd);
			stream.stream_ops?.dup?.(stream);
			return stream;
		},
		doSetAttr(stream, node, attr) {
			var setattr = stream?.stream_ops.setattr;
			var arg = setattr ? stream : node;
			setattr ??= node.node_ops.setattr;
			FS.checkOpExists(setattr, 63);
			try {
				setattr(arg, attr);
			} catch (e) {
				if (e instanceof RangeError) {
					throw new FS.ErrnoError(22);
				}
				throw e;
			}
		},
		chrdev_stream_ops: {
			open(stream) {
				var device = FS.getDevice(stream.node.rdev);
				// override node's stream ops with the device's
				stream.stream_ops = device.stream_ops;
				// forward the open call
				stream.stream_ops.open?.(stream);
			},
			llseek() {
				throw new FS.ErrnoError(70);
			},
		},
		major: (dev) => dev >> 8,
		minor: (dev) => dev & 255,
		makedev: (ma, mi) => (ma << 8) | mi,
		registerDevice(dev, ops) {
			FS.devices[dev] = {
				stream_ops: ops,
			};
		},
		getDevice: (dev) => FS.devices[dev],
		getMounts(mount) {
			var mounts = [];
			var check = [mount];
			while (check.length) {
				var m = check.pop();
				mounts.push(m);
				check.push(...m.mounts);
			}
			return mounts;
		},
		syncfs(populate, callback) {
			if (typeof populate == "function") {
				callback = populate;
				populate = false;
			}
			FS.syncFSRequests++;
			if (FS.syncFSRequests > 1) {
				err(
					`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`,
				);
			}
			var mounts = FS.getMounts(FS.root.mount);
			var completed = 0;
			function doCallback(errCode) {
				assert(FS.syncFSRequests > 0);
				FS.syncFSRequests--;
				return callback(errCode);
			}
			function done(errCode) {
				if (errCode) {
					if (!done.errored) {
						done.errored = true;
						return doCallback(errCode);
					}
					return;
				}
				if (++completed >= mounts.length) {
					doCallback(null);
				}
			}
			// sync all mounts
			for (var mount of mounts) {
				if (mount.type.syncfs) {
					mount.type.syncfs(mount, populate, done);
				} else {
					done(null);
				}
			}
		},
		mount(type, opts, mountpoint) {
			if (typeof type == "string") {
				// The filesystem was not included, and instead we have an error
				// message stored in the variable.
				throw type;
			}
			var root = mountpoint === "/";
			var pseudo = !mountpoint;
			var node;
			if (root && FS.root) {
				throw new FS.ErrnoError(10);
			} else if (!root && !pseudo) {
				var lookup = FS.lookupPath(mountpoint, {
					follow_mount: false,
				});
				mountpoint = lookup.path;
				// use the absolute path
				node = lookup.node;
				if (FS.isMountpoint(node)) {
					throw new FS.ErrnoError(10);
				}
				if (!FS.isDir(node.mode)) {
					throw new FS.ErrnoError(54);
				}
			}
			var mount = {
				type,
				opts,
				mountpoint,
				mounts: [],
			};
			// create a root node for the fs
			var mountRoot = type.mount(mount);
			mountRoot.mount = mount;
			mount.root = mountRoot;
			if (root) {
				FS.root = mountRoot;
			} else if (node) {
				// set as a mountpoint
				node.mounted = mount;
				// add the new mount to the current mount's children
				if (node.mount) {
					node.mount.mounts.push(mount);
				}
			}
			return mountRoot;
		},
		unmount(mountpoint) {
			var lookup = FS.lookupPath(mountpoint, {
				follow_mount: false,
			});
			if (!FS.isMountpoint(lookup.node)) {
				throw new FS.ErrnoError(28);
			}
			// destroy the nodes for this mount, and all its child mounts
			var node = lookup.node;
			var mount = node.mounted;
			var mounts = FS.getMounts(mount);
			for (var [hash, current] of Object.entries(FS.nameTable)) {
				while (current) {
					var next = current.name_next;
					if (mounts.includes(current.mount)) {
						FS.destroyNode(current);
					}
					current = next;
				}
			}
			// no longer a mountpoint
			node.mounted = null;
			// remove this mount from the child mounts
			var idx = node.mount.mounts.indexOf(mount);
			assert(idx !== -1);
			node.mount.mounts.splice(idx, 1);
		},
		lookup(parent, name) {
			return parent.node_ops.lookup(parent, name);
		},
		mknod(path, mode, dev) {
			var lookup = FS.lookupPath(path, {
				parent: true,
			});
			var parent = lookup.node;
			var name = PATH.basename(path);
			if (!name) {
				throw new FS.ErrnoError(28);
			}
			if (name === "." || name === "..") {
				throw new FS.ErrnoError(20);
			}
			var errCode = FS.mayCreate(parent, name);
			if (errCode) {
				throw new FS.ErrnoError(errCode);
			}
			if (!parent.node_ops.mknod) {
				throw new FS.ErrnoError(63);
			}
			return parent.node_ops.mknod(parent, name, mode, dev);
		},
		statfs(path) {
			return FS.statfsNode(
				FS.lookupPath(path, {
					follow: true,
				}).node,
			);
		},
		statfsStream(stream) {
			// We keep a separate statfsStream function because noderawfs overrides
			// it. In noderawfs, stream.node is sometimes null. Instead, we need to
			// look at stream.path.
			return FS.statfsNode(stream.node);
		},
		statfsNode(node) {
			// NOTE: None of the defaults here are true. We're just returning safe and
			//       sane values. Currently nodefs and rawfs replace these defaults,
			//       other file systems leave them alone.
			var rtn = {
				bsize: 4096,
				frsize: 4096,
				blocks: 1e6,
				bfree: 5e5,
				bavail: 5e5,
				files: FS.nextInode,
				ffree: FS.nextInode - 1,
				fsid: 42,
				flags: 2,
				namelen: 255,
			};
			if (node.node_ops.statfs) {
				Object.assign(rtn, node.node_ops.statfs(node.mount.opts.root));
			}
			return rtn;
		},
		create(path, mode = 438) {
			mode &= 4095;
			mode |= 32768;
			return FS.mknod(path, mode, 0);
		},
		mkdir(path, mode = 511) {
			mode &= 511 | 512;
			mode |= 16384;
			return FS.mknod(path, mode, 0);
		},
		mkdirTree(path, mode) {
			var dirs = path.split("/");
			var d = "";
			for (var dir of dirs) {
				if (!dir) continue;
				if (d || PATH.isAbs(path)) d += "/";
				d += dir;
				try {
					FS.mkdir(d, mode);
				} catch (e) {
					if (e.errno != 20) throw e;
				}
			}
		},
		mkdev(path, mode, dev) {
			if (typeof dev == "undefined") {
				dev = mode;
				mode = 438;
			}
			mode |= 8192;
			return FS.mknod(path, mode, dev);
		},
		symlink(oldpath, newpath) {
			if (!PATH_FS.resolve(oldpath)) {
				throw new FS.ErrnoError(44);
			}
			var lookup = FS.lookupPath(newpath, {
				parent: true,
			});
			var parent = lookup.node;
			if (!parent) {
				throw new FS.ErrnoError(44);
			}
			var newname = PATH.basename(newpath);
			var errCode = FS.mayCreate(parent, newname);
			if (errCode) {
				throw new FS.ErrnoError(errCode);
			}
			if (!parent.node_ops.symlink) {
				throw new FS.ErrnoError(63);
			}
			return parent.node_ops.symlink(parent, newname, oldpath);
		},
		rename(old_path, new_path) {
			var old_dirname = PATH.dirname(old_path);
			var new_dirname = PATH.dirname(new_path);
			var old_name = PATH.basename(old_path);
			var new_name = PATH.basename(new_path);
			// parents must exist
			var lookup, old_dir, new_dir;
			// let the errors from non existent directories percolate up
			lookup = FS.lookupPath(old_path, {
				parent: true,
			});
			old_dir = lookup.node;
			lookup = FS.lookupPath(new_path, {
				parent: true,
			});
			new_dir = lookup.node;
			if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
			// need to be part of the same mount
			if (old_dir.mount !== new_dir.mount) {
				throw new FS.ErrnoError(75);
			}
			// source must exist
			var old_node = FS.lookupNode(old_dir, old_name);
			// old path should not be an ancestor of the new path
			var relative = PATH_FS.relative(old_path, new_dirname);
			if (relative.charAt(0) !== ".") {
				throw new FS.ErrnoError(28);
			}
			// new path should not be an ancestor of the old path
			relative = PATH_FS.relative(new_path, old_dirname);
			if (relative.charAt(0) !== ".") {
				throw new FS.ErrnoError(55);
			}
			// see if the new path already exists
			var new_node;
			try {
				new_node = FS.lookupNode(new_dir, new_name);
			} catch (e) {}
			// early out if nothing needs to change
			if (old_node === new_node) {
				return;
			}
			// we'll need to delete the old entry
			var isdir = FS.isDir(old_node.mode);
			var errCode = FS.mayDelete(old_dir, old_name, isdir);
			if (errCode) {
				throw new FS.ErrnoError(errCode);
			}
			// need delete permissions if we'll be overwriting.
			// need create permissions if new doesn't already exist.
			errCode = new_node
				? FS.mayDelete(new_dir, new_name, isdir)
				: FS.mayCreate(new_dir, new_name);
			if (errCode) {
				throw new FS.ErrnoError(errCode);
			}
			if (!old_dir.node_ops.rename) {
				throw new FS.ErrnoError(63);
			}
			if (
				FS.isMountpoint(old_node) ||
				(new_node && FS.isMountpoint(new_node))
			) {
				throw new FS.ErrnoError(10);
			}
			// if we are going to change the parent, check write permissions
			if (new_dir !== old_dir) {
				errCode = FS.nodePermissions(old_dir, "w");
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
			}
			// remove the node from the lookup hash
			FS.hashRemoveNode(old_node);
			// do the underlying fs rename
			try {
				old_dir.node_ops.rename(old_node, new_dir, new_name);
				// update old node (we do this here to avoid each backend
				// needing to)
				old_node.parent = new_dir;
			} catch (e) {
				throw e;
			} finally {
				// add the node back to the hash (in case node_ops.rename
				// changed its name)
				FS.hashAddNode(old_node);
			}
		},
		rmdir(path) {
			var lookup = FS.lookupPath(path, {
				parent: true,
			});
			var parent = lookup.node;
			var name = PATH.basename(path);
			var node = FS.lookupNode(parent, name);
			var errCode = FS.mayDelete(parent, name, true);
			if (errCode) {
				throw new FS.ErrnoError(errCode);
			}
			if (!parent.node_ops.rmdir) {
				throw new FS.ErrnoError(63);
			}
			if (FS.isMountpoint(node)) {
				throw new FS.ErrnoError(10);
			}
			parent.node_ops.rmdir(parent, name);
			FS.destroyNode(node);
		},
		readdir(path) {
			var lookup = FS.lookupPath(path, {
				follow: true,
			});
			var node = lookup.node;
			var readdir = FS.checkOpExists(node.node_ops.readdir, 54);
			return readdir(node);
		},
		unlink(path) {
			var lookup = FS.lookupPath(path, {
				parent: true,
			});
			var parent = lookup.node;
			if (!parent) {
				throw new FS.ErrnoError(44);
			}
			var name = PATH.basename(path);
			var node = FS.lookupNode(parent, name);
			var errCode = FS.mayDelete(parent, name, false);
			if (errCode) {
				// According to POSIX, we should map EISDIR to EPERM, but
				// we instead do what Linux does (and we must, as we use
				// the musl linux libc).
				throw new FS.ErrnoError(errCode);
			}
			if (!parent.node_ops.unlink) {
				throw new FS.ErrnoError(63);
			}
			if (FS.isMountpoint(node)) {
				throw new FS.ErrnoError(10);
			}
			parent.node_ops.unlink(parent, name);
			FS.destroyNode(node);
		},
		readlink(path) {
			var lookup = FS.lookupPath(path);
			var link = lookup.node;
			if (!link) {
				throw new FS.ErrnoError(44);
			}
			if (!link.node_ops.readlink) {
				throw new FS.ErrnoError(28);
			}
			return link.node_ops.readlink(link);
		},
		stat(path, dontFollow) {
			var lookup = FS.lookupPath(path, {
				follow: !dontFollow,
			});
			var node = lookup.node;
			var getattr = FS.checkOpExists(node.node_ops.getattr, 63);
			return getattr(node);
		},
		fstat(fd) {
			var stream = FS.getStreamChecked(fd);
			var node = stream.node;
			var getattr = stream.stream_ops.getattr;
			var arg = getattr ? stream : node;
			getattr ??= node.node_ops.getattr;
			FS.checkOpExists(getattr, 63);
			return getattr(arg);
		},
		lstat(path) {
			return FS.stat(path, true);
		},
		doChmod(stream, node, mode, dontFollow) {
			FS.doSetAttr(stream, node, {
				mode: (mode & 4095) | (node.mode & ~4095),
				ctime: Date.now(),
				dontFollow,
			});
		},
		chmod(path, mode, dontFollow) {
			var node;
			if (typeof path == "string") {
				var lookup = FS.lookupPath(path, {
					follow: !dontFollow,
				});
				node = lookup.node;
			} else {
				node = path;
			}
			FS.doChmod(null, node, mode, dontFollow);
		},
		lchmod(path, mode) {
			FS.chmod(path, mode, true);
		},
		fchmod(fd, mode) {
			var stream = FS.getStreamChecked(fd);
			FS.doChmod(stream, stream.node, mode, false);
		},
		doChown(stream, node, dontFollow) {
			FS.doSetAttr(stream, node, {
				timestamp: Date.now(),
				dontFollow,
			});
		},
		chown(path, uid, gid, dontFollow) {
			var node;
			if (typeof path == "string") {
				var lookup = FS.lookupPath(path, {
					follow: !dontFollow,
				});
				node = lookup.node;
			} else {
				node = path;
			}
			FS.doChown(null, node, dontFollow);
		},
		lchown(path, uid, gid) {
			FS.chown(path, uid, gid, true);
		},
		fchown(fd, uid, gid) {
			var stream = FS.getStreamChecked(fd);
			FS.doChown(stream, stream.node, false);
		},
		doTruncate(stream, node, len) {
			if (FS.isDir(node.mode)) {
				throw new FS.ErrnoError(31);
			}
			if (!FS.isFile(node.mode)) {
				throw new FS.ErrnoError(28);
			}
			var errCode = FS.nodePermissions(node, "w");
			if (errCode) {
				throw new FS.ErrnoError(errCode);
			}
			FS.doSetAttr(stream, node, {
				size: len,
				timestamp: Date.now(),
			});
		},
		truncate(path, len) {
			if (len < 0) {
				throw new FS.ErrnoError(28);
			}
			var node;
			if (typeof path == "string") {
				var lookup = FS.lookupPath(path, {
					follow: true,
				});
				node = lookup.node;
			} else {
				node = path;
			}
			FS.doTruncate(null, node, len);
		},
		ftruncate(fd, len) {
			var stream = FS.getStreamChecked(fd);
			if (len < 0 || (stream.flags & 2097155) === 0) {
				throw new FS.ErrnoError(28);
			}
			FS.doTruncate(stream, stream.node, len);
		},
		utime(path, atime, mtime) {
			var lookup = FS.lookupPath(path, {
				follow: true,
			});
			var node = lookup.node;
			var setattr = FS.checkOpExists(node.node_ops.setattr, 63);
			setattr(node, {
				atime,
				mtime,
			});
		},
		open(path, flags, mode = 438) {
			if (path === "") {
				throw new FS.ErrnoError(44);
			}
			flags = FS_modeStringToFlags(flags);
			if (flags & 64) {
				mode = (mode & 4095) | 32768;
			} else {
				mode = 0;
			}
			var node;
			var isDirPath;
			if (typeof path == "object") {
				node = path;
			} else {
				isDirPath = path.endsWith("/");
				// noent_okay makes it so that if the final component of the path
				// doesn't exist, lookupPath returns `node: undefined`. `path` will be
				// updated to point to the target of all symlinks.
				var lookup = FS.lookupPath(path, {
					follow: !(flags & 131072),
					noent_okay: true,
				});
				node = lookup.node;
				path = lookup.path;
			}
			// perhaps we need to create the node
			var created = false;
			if (flags & 64) {
				if (node) {
					// if O_CREAT and O_EXCL are set, error out if the node already exists
					if (flags & 128) {
						throw new FS.ErrnoError(20);
					}
				} else if (isDirPath) {
					throw new FS.ErrnoError(31);
				} else {
					// node doesn't exist, try to create it
					// Ignore the permission bits here to ensure we can `open` this new
					// file below. We use chmod below to apply the permissions once the
					// file is open.
					node = FS.mknod(path, mode | 511, 0);
					created = true;
				}
			}
			if (!node) {
				throw new FS.ErrnoError(44);
			}
			// can't truncate a device
			if (FS.isChrdev(node.mode)) {
				flags &= ~512;
			}
			// if asked only for a directory, then this must be one
			if (flags & 65536 && !FS.isDir(node.mode)) {
				throw new FS.ErrnoError(54);
			}
			// check permissions, if this is not a file we just created now (it is ok to
			// create and write to a file with read-only permissions; it is read-only
			// for later use)
			if (!created) {
				var errCode = FS.mayOpen(node, flags);
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
			}
			// do truncation if necessary
			if (flags & 512 && !created) {
				FS.truncate(node, 0);
			}
			// we've already handled these, don't pass down to the underlying vfs
			flags &= ~(128 | 512 | 131072);
			// register the stream with the filesystem
			var stream = FS.createStream({
				node,
				path: FS.getPath(node),
				// we want the absolute path to the node
				flags,
				seekable: true,
				position: 0,
				stream_ops: node.stream_ops,
				// used by the file family libc calls (fopen, fwrite, ferror, etc.)
				ungotten: [],
				error: false,
			});
			// call the new stream's open function
			if (stream.stream_ops.open) {
				stream.stream_ops.open(stream);
			}
			if (created) {
				FS.chmod(node, mode & 511);
			}
			return stream;
		},
		close(stream) {
			if (FS.isClosed(stream)) {
				throw new FS.ErrnoError(8);
			}
			if (stream.getdents) stream.getdents = null;
			// free readdir state
			try {
				if (stream.stream_ops.close) {
					stream.stream_ops.close(stream);
				}
			} catch (e) {
				throw e;
			} finally {
				FS.closeStream(stream.fd);
			}
			stream.fd = null;
		},
		isClosed(stream) {
			return stream.fd === null;
		},
		llseek(stream, offset, whence) {
			if (FS.isClosed(stream)) {
				throw new FS.ErrnoError(8);
			}
			if (!stream.seekable || !stream.stream_ops.llseek) {
				throw new FS.ErrnoError(70);
			}
			if (whence != 0 && whence != 1 && whence != 2) {
				throw new FS.ErrnoError(28);
			}
			stream.position = stream.stream_ops.llseek(stream, offset, whence);
			stream.ungotten = [];
			return stream.position;
		},
		read(stream, buffer, offset, length, position) {
			assert(offset >= 0);
			if (length < 0 || position < 0) {
				throw new FS.ErrnoError(28);
			}
			if (FS.isClosed(stream)) {
				throw new FS.ErrnoError(8);
			}
			if ((stream.flags & 2097155) === 1) {
				throw new FS.ErrnoError(8);
			}
			if (FS.isDir(stream.node.mode)) {
				throw new FS.ErrnoError(31);
			}
			if (!stream.stream_ops.read) {
				throw new FS.ErrnoError(28);
			}
			var seeking = typeof position != "undefined";
			if (!seeking) {
				position = stream.position;
			} else if (!stream.seekable) {
				throw new FS.ErrnoError(70);
			}
			var bytesRead = stream.stream_ops.read(
				stream,
				buffer,
				offset,
				length,
				position,
			);
			if (!seeking) stream.position += bytesRead;
			return bytesRead;
		},
		write(stream, buffer, offset, length, position, canOwn) {
			assert(offset >= 0);
			assert(buffer.subarray, "FS.write expects a TypedArray");
			if (length < 0 || position < 0) {
				throw new FS.ErrnoError(28);
			}
			if (FS.isClosed(stream)) {
				throw new FS.ErrnoError(8);
			}
			if ((stream.flags & 2097155) === 0) {
				throw new FS.ErrnoError(8);
			}
			if (FS.isDir(stream.node.mode)) {
				throw new FS.ErrnoError(31);
			}
			if (!stream.stream_ops.write) {
				throw new FS.ErrnoError(28);
			}
			if (stream.seekable && stream.flags & 1024) {
				// seek to the end before writing in append mode
				FS.llseek(stream, 0, 2);
			}
			var seeking = typeof position != "undefined";
			if (!seeking) {
				position = stream.position;
			} else if (!stream.seekable) {
				throw new FS.ErrnoError(70);
			}
			var bytesWritten = stream.stream_ops.write(
				stream,
				buffer,
				offset,
				length,
				position,
				canOwn,
			);
			if (!seeking) stream.position += bytesWritten;
			return bytesWritten;
		},
		mmap(stream, length, position, prot, flags) {
			// User requests writing to file (prot & PROT_WRITE != 0).
			// Checking if we have permissions to write to the file unless
			// MAP_PRIVATE flag is set. According to POSIX spec it is possible
			// to write to file opened in read-only mode with MAP_PRIVATE flag,
			// as all modifications will be visible only in the memory of
			// the current process.
			if (
				(prot & 2) !== 0 &&
				(flags & 2) === 0 &&
				(stream.flags & 2097155) !== 2
			) {
				throw new FS.ErrnoError(2);
			}
			if ((stream.flags & 2097155) === 1) {
				throw new FS.ErrnoError(2);
			}
			if (!stream.stream_ops.mmap) {
				throw new FS.ErrnoError(43);
			}
			if (!length) {
				throw new FS.ErrnoError(28);
			}
			return stream.stream_ops.mmap(stream, length, position, prot, flags);
		},
		msync(stream, buffer, offset, length, mmapFlags) {
			assert(offset >= 0);
			if (!stream.stream_ops.msync) {
				return 0;
			}
			return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
		},
		ioctl(stream, cmd, arg) {
			if (!stream.stream_ops.ioctl) {
				throw new FS.ErrnoError(59);
			}
			return stream.stream_ops.ioctl(stream, cmd, arg);
		},
		readFile(path, opts = {}) {
			opts.flags = opts.flags ?? 0;
			opts.encoding = opts.encoding ?? "binary";
			if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
				abort(`Invalid encoding type "${opts.encoding}"`);
			}
			var stream = FS.open(path, opts.flags);
			var stat = FS.stat(path);
			var length = stat.size;
			var buf = new Uint8Array(length);
			FS.read(stream, buf, 0, length, 0);
			if (opts.encoding === "utf8") {
				buf = UTF8ArrayToString(buf);
			}
			FS.close(stream);
			return buf;
		},
		writeFile(path, data, opts = {}) {
			opts.flags = opts.flags ?? 577;
			var stream = FS.open(path, opts.flags, opts.mode);
			data = FS_fileDataToTypedArray(data);
			FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
			FS.close(stream);
		},
		cwd: () => FS.currentPath,
		chdir(path) {
			var lookup = FS.lookupPath(path, {
				follow: true,
			});
			if (lookup.node === null) {
				throw new FS.ErrnoError(44);
			}
			if (!FS.isDir(lookup.node.mode)) {
				throw new FS.ErrnoError(54);
			}
			var errCode = FS.nodePermissions(lookup.node, "x");
			if (errCode) {
				throw new FS.ErrnoError(errCode);
			}
			FS.currentPath = lookup.path;
		},
		createDefaultDirectories() {
			FS.mkdir("/tmp");
			FS.mkdir("/home");
			FS.mkdir("/home/web_user");
		},
		createDefaultDevices() {
			// create /dev
			FS.mkdir("/dev");
			// setup /dev/null
			FS.registerDevice(FS.makedev(1, 3), {
				read: () => 0,
				write: (stream, buffer, offset, length, pos) => length,
				llseek: () => 0,
			});
			FS.mkdev("/dev/null", FS.makedev(1, 3));
			// setup /dev/tty and /dev/tty1
			// stderr needs to print output using err() rather than out()
			// so we register a second tty just for it.
			TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
			TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
			FS.mkdev("/dev/tty", FS.makedev(5, 0));
			FS.mkdev("/dev/tty1", FS.makedev(6, 0));
			// setup /dev/[u]random
			// use a buffer to avoid overhead of individual crypto calls per byte
			var randomBuffer = new Uint8Array(1024),
				randomLeft = 0;
			var randomByte = () => {
				if (randomLeft === 0) {
					randomFill(randomBuffer);
					randomLeft = randomBuffer.byteLength;
				}
				return randomBuffer[--randomLeft];
			};
			FS.createDevice("/dev", "random", randomByte);
			FS.createDevice("/dev", "urandom", randomByte);
			// we're not going to emulate the actual shm device,
			// just create the tmp dirs that reside in it commonly
			FS.mkdir("/dev/shm");
			FS.mkdir("/dev/shm/tmp");
		},
		createSpecialDirectories() {
			// create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
			// name of the stream for fd 6 (see test_unistd_ttyname)
			FS.mkdir("/proc");
			var proc_self = FS.mkdir("/proc/self");
			FS.mkdir("/proc/self/fd");
			FS.mount(
				{
					mount() {
						var node = FS.createNode(proc_self, "fd", 16895, 73);
						node.stream_ops = {
							llseek: MEMFS.stream_ops.llseek,
						};
						node.node_ops = {
							lookup(parent, name) {
								var fd = +name;
								var stream = FS.getStreamChecked(fd);
								var ret = {
									parent: null,
									mount: {
										mountpoint: "fake",
									},
									node_ops: {
										readlink: () => stream.path,
									},
									id: fd + 1,
								};
								ret.parent = ret;
								// make it look like a simple root node
								return ret;
							},
							readdir() {
								return Array.from(FS.streams.entries())
									.filter(([k, v]) => v)
									.map(([k, v]) => k.toString());
							},
						};
						return node;
					},
				},
				{},
				"/proc/self/fd",
			);
		},
		createStandardStreams(input, output, error) {
			// TODO deprecate the old functionality of a single
			// input / output callback and that utilizes FS.createDevice
			// and instead require a unique set of stream ops
			// by default, we symlink the standard streams to the
			// default tty devices. however, if the standard streams
			// have been overwritten we create a unique device for
			// them instead.
			if (input) {
				FS.createDevice("/dev", "stdin", input);
			} else {
				FS.symlink("/dev/tty", "/dev/stdin");
			}
			if (output) {
				FS.createDevice("/dev", "stdout", null, output);
			} else {
				FS.symlink("/dev/tty", "/dev/stdout");
			}
			if (error) {
				FS.createDevice("/dev", "stderr", null, error);
			} else {
				FS.symlink("/dev/tty1", "/dev/stderr");
			}
			// open default streams for the stdin, stdout and stderr devices
			var stdin = FS.open("/dev/stdin", 0);
			var stdout = FS.open("/dev/stdout", 1);
			var stderr = FS.open("/dev/stderr", 1);
			assert(stdin.fd === 0, `invalid handle for stdin (${stdin.fd})`);
			assert(stdout.fd === 1, `invalid handle for stdout (${stdout.fd})`);
			assert(stderr.fd === 2, `invalid handle for stderr (${stderr.fd})`);
		},
		staticInit() {
			FS.nameTable = new Array(4096);
			FS.mount(MEMFS, {}, "/");
			FS.createDefaultDirectories();
			FS.createDefaultDevices();
			FS.createSpecialDirectories();
			FS.filesystems = {
				MEMFS: MEMFS,
			};
		},
		init(input, output, error) {
			assert(
				!FS.initialized,
				"FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)",
			);
			FS.initialized = true;
			// Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
			input ??= Module["stdin"];
			output ??= Module["stdout"];
			error ??= Module["stderr"];
			FS.createStandardStreams(input, output, error);
		},
		quit() {
			FS.initialized = false;
			// force-flush all streams, so we get musl std streams printed out
			_fflush(0);
			// close all of our streams
			for (var stream of FS.streams) {
				if (stream) {
					FS.close(stream);
				}
			}
		},
		findObject(path, dontResolveLastLink) {
			var ret = FS.analyzePath(path, dontResolveLastLink);
			if (!ret.exists) {
				return null;
			}
			return ret.object;
		},
		analyzePath(path, dontResolveLastLink) {
			// operate from within the context of the symlink's target
			try {
				var lookup = FS.lookupPath(path, {
					follow: !dontResolveLastLink,
				});
				path = lookup.path;
			} catch (e) {}
			var ret = {
				isRoot: false,
				exists: false,
				error: 0,
				name: null,
				path: null,
				object: null,
				parentExists: false,
				parentPath: null,
				parentObject: null,
			};
			try {
				var lookup = FS.lookupPath(path, {
					parent: true,
				});
				ret.parentExists = true;
				ret.parentPath = lookup.path;
				ret.parentObject = lookup.node;
				ret.name = PATH.basename(path);
				lookup = FS.lookupPath(path, {
					follow: !dontResolveLastLink,
				});
				ret.exists = true;
				ret.path = lookup.path;
				ret.object = lookup.node;
				ret.name = lookup.node.name;
				ret.isRoot = lookup.path === "/";
			} catch (e) {
				ret.error = e.errno;
			}
			return ret;
		},
		createPath(parent, path, canRead, canWrite) {
			parent = typeof parent == "string" ? parent : FS.getPath(parent);
			var parts = path.split("/").reverse();
			while (parts.length) {
				var part = parts.pop();
				if (!part) continue;
				var current = PATH.join2(parent, part);
				try {
					FS.mkdir(current);
				} catch (e) {
					if (e.errno != 20) throw e;
				}
				parent = current;
			}
			return current;
		},
		createFile(parent, name, properties, canRead, canWrite) {
			var path = PATH.join2(
				typeof parent == "string" ? parent : FS.getPath(parent),
				name,
			);
			var mode = FS_getMode(canRead, canWrite);
			return FS.create(path, mode);
		},
		createDataFile(parent, name, data, canRead, canWrite, canOwn) {
			var path = name;
			if (parent) {
				parent = typeof parent == "string" ? parent : FS.getPath(parent);
				path = name ? PATH.join2(parent, name) : parent;
			}
			var mode = FS_getMode(canRead, canWrite);
			var node = FS.create(path, mode);
			if (data) {
				data = FS_fileDataToTypedArray(data);
				// make sure we can write to the file
				FS.chmod(node, mode | 146);
				var stream = FS.open(node, 577);
				FS.write(stream, data, 0, data.length, 0, canOwn);
				FS.close(stream);
				FS.chmod(node, mode);
			}
		},
		createDevice(parent, name, input, output) {
			var path = PATH.join2(
				typeof parent == "string" ? parent : FS.getPath(parent),
				name,
			);
			var mode = FS_getMode(!!input, !!output);
			FS.createDevice.major ??= 64;
			var dev = FS.makedev(FS.createDevice.major++, 0);
			// Create a fake device that a set of stream ops to emulate
			// the old behavior.
			FS.registerDevice(dev, {
				open(stream) {
					stream.seekable = false;
				},
				close(stream) {
					// flush any pending line data
					if (output?.buffer?.length) {
						output(10);
					}
				},
				read(stream, buffer, offset, length, pos) {
					var bytesRead = 0;
					for (var i = 0; i < length; i++) {
						var result;
						try {
							result = input();
						} catch (e) {
							throw new FS.ErrnoError(29);
						}
						if (result === undefined && bytesRead === 0) {
							throw new FS.ErrnoError(6);
						}
						if (result === null || result === undefined) break;
						bytesRead++;
						buffer[offset + i] = result;
					}
					if (bytesRead) {
						stream.node.atime = Date.now();
					}
					return bytesRead;
				},
				write(stream, buffer, offset, length, pos) {
					for (var i = 0; i < length; i++) {
						try {
							output(buffer[offset + i]);
						} catch (e) {
							throw new FS.ErrnoError(29);
						}
					}
					if (length) {
						stream.node.mtime = stream.node.ctime = Date.now();
					}
					return i;
				},
			});
			return FS.mkdev(path, mode, dev);
		},
		forceLoadFile(obj) {
			if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
			if (globalThis.XMLHttpRequest) {
				abort(
					"Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.",
				);
			} else {
				// Command-line.
				try {
					obj.contents = readBinary(obj.url);
				} catch (e) {
					throw new FS.ErrnoError(29);
				}
			}
		},
		createLazyFile(parent, name, url, canRead, canWrite) {
			// Lazy chunked Uint8Array (implements get and length from Uint8Array).
			// Actual getting is abstracted away for eventual reuse.
			class LazyUint8Array {
				lengthKnown = false;
				chunks = [];
				// Loaded chunks. Index is the chunk number
				get(idx) {
					if (idx > this.length - 1 || idx < 0) {
						return undefined;
					}
					var chunkOffset = idx % this.chunkSize;
					var chunkNum = (idx / this.chunkSize) | 0;
					return this.getter(chunkNum)[chunkOffset];
				}
				setDataGetter(getter) {
					this.getter = getter;
				}
				cacheLength() {
					// Find length
					var xhr = new XMLHttpRequest();
					xhr.open("HEAD", url, false);
					xhr.send(null);
					if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
						abort("Couldn't load " + url + ". Status: " + xhr.status);
					var datalength = Number(xhr.getResponseHeader("Content-length"));
					var header;
					var hasByteServing =
						(header = xhr.getResponseHeader("Accept-Ranges")) &&
						header === "bytes";
					var usesGzip =
						(header = xhr.getResponseHeader("Content-Encoding")) &&
						header === "gzip";
					var chunkSize = 1024 * 1024;
					// Chunk size in bytes
					if (!hasByteServing) chunkSize = datalength;
					// Function to get a range from the remote URL.
					var doXHR = (from, to) => {
						if (from > to)
							abort(`invalid range (${from}, ${to}) or no bytes requested!`);
						if (to > datalength - 1)
							abort(`only ${datalength} bytes available! programmer error!`);
						// TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
						var xhr = new XMLHttpRequest();
						xhr.open("GET", url, false);
						if (datalength !== chunkSize)
							xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
						// Some hints to the browser that we want binary data.
						xhr.responseType = "arraybuffer";
						if (xhr.overrideMimeType) {
							xhr.overrideMimeType("text/plain; charset=x-user-defined");
						}
						xhr.send(null);
						if (
							!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)
						)
							abort("Couldn't load " + url + ". Status: " + xhr.status);
						if (xhr.response !== undefined) {
							return new Uint8Array(
								/** @type{Array<number>} */ (xhr.response || []),
							);
						}
						return intArrayFromString(xhr.responseText ?? "", true);
					};
					var lazyArray = this;
					lazyArray.setDataGetter((chunkNum) => {
						var start = chunkNum * chunkSize;
						var end = (chunkNum + 1) * chunkSize - 1;
						// including this byte
						end = Math.min(end, datalength - 1);
						// if datalength-1 is selected, this is the last block
						if (typeof lazyArray.chunks[chunkNum] == "undefined") {
							lazyArray.chunks[chunkNum] = doXHR(start, end);
						}
						if (typeof lazyArray.chunks[chunkNum] == "undefined")
							abort("doXHR failed!");
						return lazyArray.chunks[chunkNum];
					});
					if (usesGzip || !datalength) {
						// if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
						chunkSize = datalength = 1;
						// this will force getter(0)/doXHR do download the whole file
						datalength = this.getter(0).length;
						chunkSize = datalength;
						out(
							"LazyFiles on gzip forces download of the whole file when length is accessed",
						);
					}
					this._length = datalength;
					this._chunkSize = chunkSize;
					this.lengthKnown = true;
				}
				get length() {
					if (!this.lengthKnown) {
						this.cacheLength();
					}
					return this._length;
				}
				get chunkSize() {
					if (!this.lengthKnown) {
						this.cacheLength();
					}
					return this._chunkSize;
				}
			}
			if (globalThis.XMLHttpRequest) {
				if (!ENVIRONMENT_IS_WORKER)
					abort(
						"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc",
					);
				var lazyArray = new LazyUint8Array();
				var properties = {
					isDevice: false,
					contents: lazyArray,
				};
			} else {
				var properties = {
					isDevice: false,
					url,
				};
			}
			var node = FS.createFile(parent, name, properties, canRead, canWrite);
			// This is a total hack, but I want to get this lazy file code out of the
			// core of MEMFS. If we want to keep this lazy file concept I feel it should
			// be its own thin LAZYFS proxying calls to MEMFS.
			if (properties.contents) {
				node.contents = properties.contents;
			} else if (properties.url) {
				node.contents = null;
				node.url = properties.url;
			}
			// Add a function that defers querying the file size until it is asked the first time.
			Object.defineProperties(node, {
				usedBytes: {
					get: function () {
						return this.contents.length;
					},
				},
			});
			// override each stream op with one that tries to force load the lazy file first
			var stream_ops = {};
			for (const [key, fn] of Object.entries(node.stream_ops)) {
				stream_ops[key] = (...args) => {
					FS.forceLoadFile(node);
					return fn(...args);
				};
			}
			function writeChunks(stream, buffer, offset, length, position) {
				var contents = stream.node.contents;
				if (position >= contents.length) return 0;
				var size = Math.min(contents.length - position, length);
				assert(size >= 0);
				if (contents.slice) {
					// normal array
					for (var i = 0; i < size; i++) {
						buffer[offset + i] = contents[position + i];
					}
				} else {
					for (var i = 0; i < size; i++) {
						// LazyUint8Array from sync binary XHR
						buffer[offset + i] = contents.get(position + i);
					}
				}
				return size;
			}
			// use a custom read function
			stream_ops.read = (stream, buffer, offset, length, position) => {
				FS.forceLoadFile(node);
				return writeChunks(stream, buffer, offset, length, position);
			};
			// use a custom mmap function
			stream_ops.mmap = (stream, length, position, prot, flags) => {
				FS.forceLoadFile(node);
				var ptr = mmapAlloc(length);
				if (!ptr) {
					throw new FS.ErrnoError(48);
				}
				writeChunks(stream, (growMemViews(), HEAP8), ptr, length, position);
				return {
					ptr,
					allocated: true,
				};
			};
			node.stream_ops = stream_ops;
			return node;
		},
	};

	var SYSCALLS = {
		currentUmask: 18,
		calculateAt(dirfd, path, allowEmpty) {
			if (PATH.isAbs(path)) {
				return path;
			}
			// relative path
			var dir;
			if (dirfd === -100) {
				dir = FS.cwd();
			} else {
				var dirstream = SYSCALLS.getStreamFromFD(dirfd);
				dir = dirstream.path;
			}
			if (path.length == 0) {
				if (!allowEmpty) {
					throw new FS.ErrnoError(44);
				}
				return dir;
			}
			return dir + "/" + path;
		},
		writeStat(buf, stat) {
			(growMemViews(), HEAPU32)[buf >> 2] = stat.dev;
			(growMemViews(), HEAPU32)[(buf + 4) >> 2] = stat.mode;
			(growMemViews(), HEAPU32)[(buf + 8) >> 2] = stat.nlink;
			(growMemViews(), HEAPU32)[(buf + 12) >> 2] = stat.uid;
			(growMemViews(), HEAPU32)[(buf + 16) >> 2] = stat.gid;
			(growMemViews(), HEAPU32)[(buf + 20) >> 2] = stat.rdev;
			(growMemViews(), HEAP64)[(buf + 24) >> 3] = BigInt(stat.size);
			(growMemViews(), HEAP32)[(buf + 32) >> 2] = 4096;
			(growMemViews(), HEAP32)[(buf + 36) >> 2] = stat.blocks;
			var atime = stat.atime.getTime();
			var mtime = stat.mtime.getTime();
			var ctime = stat.ctime.getTime();
			(growMemViews(), HEAP64)[(buf + 40) >> 3] = BigInt(
				Math.floor(atime / 1e3),
			);
			(growMemViews(), HEAPU32)[(buf + 48) >> 2] = (atime % 1e3) * 1e3 * 1e3;
			(growMemViews(), HEAP64)[(buf + 56) >> 3] = BigInt(
				Math.floor(mtime / 1e3),
			);
			(growMemViews(), HEAPU32)[(buf + 64) >> 2] = (mtime % 1e3) * 1e3 * 1e3;
			(growMemViews(), HEAP64)[(buf + 72) >> 3] = BigInt(
				Math.floor(ctime / 1e3),
			);
			(growMemViews(), HEAPU32)[(buf + 80) >> 2] = (ctime % 1e3) * 1e3 * 1e3;
			(growMemViews(), HEAP64)[(buf + 88) >> 3] = BigInt(stat.ino);
			return 0;
		},
		writeStatFs(buf, stats) {
			(growMemViews(), HEAPU32)[(buf + 4) >> 2] = stats.bsize;
			(growMemViews(), HEAPU32)[(buf + 60) >> 2] = stats.bsize;
			(growMemViews(), HEAP64)[(buf + 8) >> 3] = BigInt(stats.blocks);
			(growMemViews(), HEAP64)[(buf + 16) >> 3] = BigInt(stats.bfree);
			(growMemViews(), HEAP64)[(buf + 24) >> 3] = BigInt(stats.bavail);
			(growMemViews(), HEAP64)[(buf + 32) >> 3] = BigInt(stats.files);
			(growMemViews(), HEAP64)[(buf + 40) >> 3] = BigInt(stats.ffree);
			(growMemViews(), HEAPU32)[(buf + 48) >> 2] = stats.fsid;
			(growMemViews(), HEAPU32)[(buf + 64) >> 2] = stats.flags;
			// ST_NOSUID
			(growMemViews(), HEAPU32)[(buf + 56) >> 2] = stats.namelen;
		},
		doMsync(addr, stream, len, flags, offset) {
			if (!FS.isFile(stream.node.mode)) {
				throw new FS.ErrnoError(43);
			}
			if (flags & 2) {
				// MAP_PRIVATE calls need not to be synced back to underlying fs
				return 0;
			}
			var buffer = (growMemViews(), HEAPU8).subarray(addr, addr + len);
			FS.msync(stream, buffer, offset, len, flags);
		},
		getStreamFromFD(fd) {
			var stream = FS.getStreamChecked(fd);
			return stream;
		},
		varargs: undefined,
		getStr(ptr) {
			var ret = UTF8ToString(ptr);
			return ret;
		},
	};

	function ___syscall_chmod(path, mode) {
		if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(2, 0, 1, path, mode);
		try {
			path = SYSCALLS.getStr(path);
			FS.chmod(path, mode);
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_dup3(fd, newfd, flags) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(3, 0, 1, fd, newfd, flags);
		try {
			if (fd === newfd) return -28;
			if (flags & ~524288) return -28;
			var old = SYSCALLS.getStreamFromFD(fd);
			// Check newfd is within range of valid open file descriptors.
			if (newfd < 0 || newfd >= FS.MAX_OPEN_FDS) return -8;
			var existing = FS.getStream(newfd);
			if (existing) FS.close(existing);
			var stream = FS.dupStream(old, newfd);
			if (flags & 524288) {
				stream.flags |= 524288;
			}
			return stream.fd;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_faccessat(dirfd, path, amode, flags) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(4, 0, 1, dirfd, path, amode, flags);
		try {
			path = SYSCALLS.getStr(path);
			assert(!flags || flags == 512);
			path = SYSCALLS.calculateAt(dirfd, path);
			if (amode & ~7) {
				// need a valid mode
				return -28;
			}
			var lookup = FS.lookupPath(path, {
				follow: true,
			});
			var node = lookup.node;
			if (!node) {
				return -44;
			}
			var perms = "";
			if (amode & 4) perms += "r";
			if (amode & 2) perms += "w";
			if (amode & 1) perms += "x";
			if (perms && FS.nodePermissions(node, perms)) {
				return -2;
			}
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_fchmod(fd, mode) {
		if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(5, 0, 1, fd, mode);
		try {
			FS.fchmod(fd, mode);
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_fchown32(fd, owner, group) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(6, 0, 1, fd, owner, group);
		try {
			FS.fchown(fd, owner, group);
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	var syscallGetVarargI = () => {
		assert(SYSCALLS.varargs != undefined);
		// the `+` prepended here is necessary to convince the JSCompiler that varargs is indeed a number.
		var ret = (growMemViews(), HEAP32)[+SYSCALLS.varargs >> 2];
		SYSCALLS.varargs += 4;
		return ret;
	};

	var syscallGetVarargP = syscallGetVarargI;

	function ___syscall_fcntl64(fd, cmd, varargs) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(7, 0, 1, fd, cmd, varargs);
		SYSCALLS.varargs = varargs;
		try {
			var stream = SYSCALLS.getStreamFromFD(fd);
			switch (cmd) {
				case 0: {
					var arg = syscallGetVarargI();
					if (arg < 0) {
						return -28;
					}
					while (FS.streams[arg]) {
						arg++;
					}
					var newStream;
					newStream = FS.dupStream(stream, arg);
					return newStream.fd;
				}

				case 1:
				case 2:
					return 0;

				// FD_CLOEXEC makes no sense for a single process.
				case 3:
					return stream.flags;

				case 4: {
					var arg = syscallGetVarargI();
					var mask = 289792;
					stream.flags = (stream.flags & ~mask) | (arg & mask);
					return 0;
				}

				case 12: {
					var arg = syscallGetVarargP();
					var offset = 0;
					// We're always unlocked.
					(growMemViews(), HEAP16)[(arg + offset) >> 1] = 2;
					return 0;
				}

				case 13:
				case 14:
					// Pretend that the locking is successful. These are process-level locks,
					// and Emscripten programs are a single process. If we supported linking a
					// filesystem between programs, we'd need to do more here.
					// See https://github.com/emscripten-core/emscripten/issues/23697
					return 0;
			}
			return -28;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_fstat64(fd, buf) {
		if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(8, 0, 1, fd, buf);
		try {
			return SYSCALLS.writeStat(buf, FS.fstat(fd));
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
		assert(
			typeof maxBytesToWrite == "number",
			"stringToUTF8 requires a third parameter that specifies the length of the output buffer",
		);
		return stringToUTF8Array(
			str,
			(growMemViews(), HEAPU8),
			outPtr,
			maxBytesToWrite,
		);
	};

	function ___syscall_getdents64(fd, dirp, count) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(9, 0, 1, fd, dirp, count);
		try {
			var stream = SYSCALLS.getStreamFromFD(fd);
			stream.getdents ||= FS.readdir(stream.path);
			var struct_size = 280;
			var pos = 0;
			var off = FS.llseek(stream, 0, 1);
			var startIdx = Math.floor(off / struct_size);
			var endIdx = Math.min(
				stream.getdents.length,
				startIdx + Math.floor(count / struct_size),
			);
			for (var idx = startIdx; idx < endIdx; idx++) {
				var id;
				var type;
				var name = stream.getdents[idx];
				if (name === ".") {
					id = stream.node.id;
					type = 4;
				} else if (name === "..") {
					var lookup = FS.lookupPath(stream.path, {
						parent: true,
					});
					id = lookup.node.id;
					type = 4;
				} else {
					var child;
					try {
						child = FS.lookupNode(stream.node, name);
					} catch (e) {
						// If the entry is not a directory, file, or symlink, nodefs
						// lookupNode will raise EINVAL. Skip these and continue.
						if (e?.errno === 28) {
							continue;
						}
						throw e;
					}
					id = child.id;
					type = FS.isChrdev(child.mode)
						? 2 // character device.
						: FS.isDir(child.mode)
							? 4 // directory
							: FS.isLink(child.mode)
								? 10 // symbolic link.
								: 8;
				}
				assert(id);
				(growMemViews(), HEAP64)[(dirp + pos) >> 3] = BigInt(id);
				(growMemViews(), HEAP64)[(dirp + pos + 8) >> 3] = BigInt(
					(idx + 1) * struct_size,
				);
				(growMemViews(), HEAP16)[(dirp + pos + 16) >> 1] = 280;
				(growMemViews(), HEAP8)[dirp + pos + 18] = type;
				stringToUTF8(name, dirp + pos + 19, 256);
				pos += struct_size;
			}
			FS.llseek(stream, idx * struct_size, 0);
			return pos;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	var SOCKFS = {
		websocketArgs: {},
		callbacks: {},
		on(event, callback) {
			SOCKFS.callbacks[event] = callback;
		},
		emit(event, param) {
			SOCKFS.callbacks[event]?.(param);
		},
		mount(mount) {
			// The incoming Module['websocket'] can be used for configuring
			// subprotocol/url, etc
			SOCKFS.websocketArgs = Module["websocket"] || {};
			// Add the Event registration mechanism to the exported websocket configuration
			// object so we can register network callbacks from native JavaScript too.
			// For more documentation see system/include/emscripten/emscripten.h
			(Module["websocket"] ??= {})["on"] = SOCKFS.on;
			return FS.createNode(null, "/", 16895, 0);
		},
		createSocket(family, type, protocol) {
			// Emscripten only supports AF_INET
			if (family != 2) {
				throw new FS.ErrnoError(5);
			}
			type &= ~526336;
			// Some applications may pass it; it makes no sense for a single process.
			// Emscripten only supports SOCK_STREAM and SOCK_DGRAM
			if (type != 1 && type != 2) {
				throw new FS.ErrnoError(28);
			}
			var streaming = type == 1;
			if (streaming && protocol && protocol != 6) {
				throw new FS.ErrnoError(66);
			}
			// create our internal socket structure
			var sock = {
				family,
				type,
				protocol,
				server: null,
				error: null,
				// Used in getsockopt for SOL_SOCKET/SO_ERROR test
				peers: {},
				pending: [],
				recv_queue: [],
				sock_ops: SOCKFS.websocket_sock_ops,
			};
			// create the filesystem node to store the socket structure
			var name = SOCKFS.nextname();
			var node = FS.createNode(SOCKFS.root, name, 49152, 0);
			node.sock = sock;
			// and the wrapping stream that enables library functions such
			// as read and write to indirectly interact with the socket
			var stream = FS.createStream({
				path: name,
				node,
				flags: 2,
				seekable: false,
				stream_ops: SOCKFS.stream_ops,
			});
			// map the new stream to the socket structure (sockets have a 1:1
			// relationship with a stream)
			sock.stream = stream;
			return sock;
		},
		getSocket(fd) {
			var stream = FS.getStream(fd);
			if (!stream || !FS.isSocket(stream.node.mode)) {
				return null;
			}
			return stream.node.sock;
		},
		stream_ops: {
			poll(stream) {
				var sock = stream.node.sock;
				return sock.sock_ops.poll(sock);
			},
			ioctl(stream, request, varargs) {
				var sock = stream.node.sock;
				return sock.sock_ops.ioctl(sock, request, varargs);
			},
			read(stream, buffer, offset, length, position) {
				var sock = stream.node.sock;
				var msg = sock.sock_ops.recvmsg(sock, length);
				if (!msg) {
					// socket is closed
					return 0;
				}
				buffer.set(msg.buffer, offset);
				return msg.buffer.length;
			},
			write(stream, buffer, offset, length, position) {
				var sock = stream.node.sock;
				return sock.sock_ops.sendmsg(sock, buffer, offset, length);
			},
			close(stream) {
				var sock = stream.node.sock;
				sock.sock_ops.close(sock);
			},
		},
		nextname() {
			if (!SOCKFS.nextname.current) {
				SOCKFS.nextname.current = 0;
			}
			return `socket[${SOCKFS.nextname.current++}]`;
		},
		websocket_sock_ops: {
			createPeer(sock, addr, port) {
				var ws;
				if (typeof addr == "object") {
					ws = addr;
					addr = null;
					port = null;
				}
				if (ws) {
					// for sockets that've already connected (e.g. we're the server)
					// we can inspect the _socket property for the address
					if (ws._socket) {
						addr = ws._socket.remoteAddress;
						port = ws._socket.remotePort;
					} else {
						var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
						if (!result) {
							throw new Error(
								"WebSocket URL must be in the format ws(s)://address:port",
							);
						}
						addr = result[1];
						port = parseInt(result[2], 10);
					}
				} else {
					// create the actual websocket object and connect
					try {
						// The default value is 'ws://' the replace is needed because the compiler replaces '//' comments with '#'
						// comments without checking context, so we'd end up with ws:#, the replace swaps the '#' for '//' again.
						var url = "ws://".replace("#", "//");
						// Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
						var subProtocols = "binary";
						// The default value is 'binary'
						// The default WebSocket options
						var opts = undefined;
						// Fetch runtime WebSocket URL config.
						if (SOCKFS.websocketArgs["url"]) {
							url = SOCKFS.websocketArgs["url"];
						}
						// Fetch runtime WebSocket subprotocol config.
						if (SOCKFS.websocketArgs["subprotocol"]) {
							subProtocols = SOCKFS.websocketArgs["subprotocol"];
						} else if (SOCKFS.websocketArgs["subprotocol"] === null) {
							subProtocols = "null";
						}
						if (url === "ws://" || url === "wss://") {
							// Is the supplied URL config just a prefix, if so complete it.
							var parts = addr.split("/");
							url =
								url + parts[0] + ":" + port + "/" + parts.slice(1).join("/");
						}
						if (subProtocols !== "null") {
							// The regex trims the string (removes spaces at the beginning and end), then splits the string by
							// <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
							subProtocols = subProtocols
								.replace(/^ +| +$/g, "")
								.split(/ *, */);
							opts = subProtocols;
						}
						// If node we use the ws library.
						var WebSocketConstructor;
						if (ENVIRONMENT_IS_NODE) {
							WebSocketConstructor = /** @type{(typeof WebSocket)} */ (
								require("ws")
							);
						} else {
							WebSocketConstructor = WebSocket;
						}
						ws = new WebSocketConstructor(url, opts);
						ws.binaryType = "arraybuffer";
					} catch (e) {
						throw new FS.ErrnoError(23);
					}
				}
				var peer = {
					addr,
					port,
					socket: ws,
					msg_send_queue: [],
				};
				SOCKFS.websocket_sock_ops.addPeer(sock, peer);
				SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
				// if this is a bound dgram socket, send the port number first to allow
				// us to override the ephemeral port reported to us by remotePort on the
				// remote end.
				if (sock.type === 2 && typeof sock.sport != "undefined") {
					peer.msg_send_queue.push(
						new Uint8Array([
							255,
							255,
							255,
							255,
							"p".charCodeAt(0),
							"o".charCodeAt(0),
							"r".charCodeAt(0),
							"t".charCodeAt(0),
							(sock.sport & 65280) >> 8,
							sock.sport & 255,
						]),
					);
				}
				return peer;
			},
			getPeer(sock, addr, port) {
				return sock.peers[addr + ":" + port];
			},
			addPeer(sock, peer) {
				sock.peers[peer.addr + ":" + peer.port] = peer;
			},
			removePeer(sock, peer) {
				delete sock.peers[peer.addr + ":" + peer.port];
			},
			handlePeerEvents(sock, peer) {
				var first = true;
				function handleOpen() {
					sock.connecting = false;
					SOCKFS.emit("open", sock.stream.fd);
					try {
						var queued = peer.msg_send_queue.shift();
						while (queued) {
							peer.socket.send(queued);
							queued = peer.msg_send_queue.shift();
						}
					} catch (e) {
						// not much we can do here in the way of proper error handling as we've already
						// lied and said this data was sent. shut it down.
						peer.socket.close();
					}
				}
				function handleMessage(data) {
					if (typeof data == "string") {
						var encoder = new TextEncoder();
						// should be utf-8
						data = encoder.encode(data);
					} else {
						assert(data.byteLength !== undefined);
						// must receive an ArrayBuffer
						if (data.byteLength == 0) {
							// An empty ArrayBuffer will emit a pseudo disconnect event
							// as recv/recvmsg will return zero which indicates that a socket
							// has performed a shutdown although the connection has not been disconnected yet.
							return;
						}
						data = new Uint8Array(data);
					}
					// if this is the port message, override the peer's port with it
					var wasfirst = first;
					first = false;
					if (
						wasfirst &&
						data.length === 10 &&
						data[0] === 255 &&
						data[1] === 255 &&
						data[2] === 255 &&
						data[3] === 255 &&
						data[4] === "p".charCodeAt(0) &&
						data[5] === "o".charCodeAt(0) &&
						data[6] === "r".charCodeAt(0) &&
						data[7] === "t".charCodeAt(0)
					) {
						// update the peer's port and its key in the peer map
						var newport = (data[8] << 8) | data[9];
						SOCKFS.websocket_sock_ops.removePeer(sock, peer);
						peer.port = newport;
						SOCKFS.websocket_sock_ops.addPeer(sock, peer);
						return;
					}
					sock.recv_queue.push({
						addr: peer.addr,
						port: peer.port,
						data,
					});
					SOCKFS.emit("message", sock.stream.fd);
				}
				if (ENVIRONMENT_IS_NODE) {
					// EventEmitter-style events use by ws library objects in Node.js).
					peer.socket.on("open", handleOpen);
					peer.socket.on("message", (data, isBinary) => {
						if (!isBinary) {
							return;
						}
						handleMessage(new Uint8Array(data).buffer);
					});
					peer.socket.on("close", () => SOCKFS.emit("close", sock.stream.fd));
					peer.socket.on("error", (error) => {
						// Although the ws library may pass errors that may be more descriptive than
						// ECONNREFUSED they are not necessarily the expected error code e.g.
						// ENOTFOUND on getaddrinfo seems to be node.js specific, so using ECONNREFUSED
						// is still probably the most useful thing to do.
						sock.error = 14;
						// Used in getsockopt for SOL_SOCKET/SO_ERROR test.
						SOCKFS.emit("error", [
							sock.stream.fd,
							sock.error,
							"ECONNREFUSED: Connection refused",
						]);
					});
					return;
				}
				peer.socket.onopen = handleOpen;
				peer.socket.onclose = () => SOCKFS.emit("close", sock.stream.fd);
				peer.socket.onmessage = (event) => handleMessage(event.data);
				peer.socket.onerror = (error) => {
					// The WebSocket spec only allows a 'simple event' to be thrown on error,
					// so we only really know as much as ECONNREFUSED.
					sock.error = 14;
					// Used in getsockopt for SOL_SOCKET/SO_ERROR test.
					SOCKFS.emit("error", [
						sock.stream.fd,
						sock.error,
						"ECONNREFUSED: Connection refused",
					]);
				};
			},
			poll(sock) {
				if (sock.type === 1 && sock.server) {
					// listen sockets should only say they're available for reading
					// if there are pending clients.
					return sock.pending.length ? 64 | 1 : 0;
				}
				var mask = 0;
				var dest =
					sock.type === 1 // we only care about the socket state for connection-based sockets
						? SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport)
						: null;
				if (
					sock.recv_queue.length ||
					!dest || // connection-less sockets are always ready to read
					(dest && dest.socket.readyState === dest.socket.CLOSING) ||
					(dest && dest.socket.readyState === dest.socket.CLOSED)
				) {
					// let recv return 0 once closed
					mask |= 64 | 1;
				}
				if (
					!dest || // connection-less sockets are always ready to write
					(dest && dest.socket.readyState === dest.socket.OPEN)
				) {
					mask |= 4;
				}
				if (
					(dest && dest.socket.readyState === dest.socket.CLOSING) ||
					(dest && dest.socket.readyState === dest.socket.CLOSED)
				) {
					// When an non-blocking connect fails mark the socket as writable.
					// Its up to the calling code to then use getsockopt with SO_ERROR to
					// retrieve the error.
					// See https://man7.org/linux/man-pages/man2/connect.2.html
					if (sock.connecting) {
						mask |= 4;
					} else {
						mask |= 16;
					}
				}
				return mask;
			},
			ioctl(sock, request, arg) {
				switch (request) {
					case 21531:
						var bytes = 0;
						if (sock.recv_queue.length) {
							bytes = sock.recv_queue[0].data.length;
						}
						(growMemViews(), HEAP32)[arg >> 2] = bytes;
						return 0;

					case 21537:
						var on = (growMemViews(), HEAP32)[arg >> 2];
						if (on) {
							sock.stream.flags |= 2048;
						} else {
							sock.stream.flags &= ~2048;
						}
						return 0;

					default:
						return 28;
				}
			},
			close(sock) {
				// if we've spawned a listen server, close it
				if (sock.server) {
					try {
						sock.server.close();
					} catch (e) {}
					sock.server = null;
				}
				// close any peer connections
				for (var peer of Object.values(sock.peers)) {
					try {
						peer.socket.close();
					} catch (e) {}
					SOCKFS.websocket_sock_ops.removePeer(sock, peer);
				}
				return 0;
			},
			bind(sock, addr, port) {
				if (
					typeof sock.saddr != "undefined" ||
					typeof sock.sport != "undefined"
				) {
					throw new FS.ErrnoError(28);
				}
				sock.saddr = addr;
				sock.sport = port;
				// in order to emulate dgram sockets, we need to launch a listen server when
				// binding on a connection-less socket
				// note: this is only required on the server side
				if (sock.type === 2) {
					// close the existing server if it exists
					if (sock.server) {
						sock.server.close();
						sock.server = null;
					}
					// swallow error operation not supported error that occurs when binding in the
					// browser where this isn't supported
					try {
						sock.sock_ops.listen(sock, 0);
					} catch (e) {
						if (!(e.name === "ErrnoError")) throw e;
						if (e.errno !== 138) throw e;
					}
				}
			},
			connect(sock, addr, port) {
				if (sock.server) {
					throw new FS.ErrnoError(138);
				}
				// TODO autobind
				// if (!sock.addr && sock.type == 2) {
				// }
				// early out if we're already connected / in the middle of connecting
				if (
					typeof sock.daddr != "undefined" &&
					typeof sock.dport != "undefined"
				) {
					var dest = SOCKFS.websocket_sock_ops.getPeer(
						sock,
						sock.daddr,
						sock.dport,
					);
					if (dest) {
						if (dest.socket.readyState === dest.socket.CONNECTING) {
							throw new FS.ErrnoError(7);
						} else {
							throw new FS.ErrnoError(30);
						}
					}
				}
				// add the socket to our peer list and set our
				// destination address / port to match
				var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
				sock.daddr = peer.addr;
				sock.dport = peer.port;
				// because we cannot synchronously block to wait for the WebSocket
				// connection to complete, we return here pretending that the connection
				// was a success.
				sock.connecting = true;
			},
			listen(sock, backlog) {
				if (!ENVIRONMENT_IS_NODE) {
					throw new FS.ErrnoError(138);
				}
				if (sock.server) {
					throw new FS.ErrnoError(28);
				}
				var WebSocketServer = require("ws").Server;
				var host = sock.saddr;
				sock.server = new WebSocketServer({
					host,
					port: sock.sport,
				});
				SOCKFS.emit("listen", sock.stream.fd);
				// Send Event with listen fd.
				sock.server.on("connection", (ws) => {
					if (sock.type === 1) {
						var newsock = SOCKFS.createSocket(
							sock.family,
							sock.type,
							sock.protocol,
						);
						// create a peer on the new socket
						var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
						newsock.daddr = peer.addr;
						newsock.dport = peer.port;
						// push to queue for accept to pick up
						sock.pending.push(newsock);
						SOCKFS.emit("connection", newsock.stream.fd);
					} else {
						// create a peer on the listen socket so calling sendto
						// with the listen socket and an address will resolve
						// to the correct client
						SOCKFS.websocket_sock_ops.createPeer(sock, ws);
						SOCKFS.emit("connection", sock.stream.fd);
					}
				});
				sock.server.on("close", () => {
					SOCKFS.emit("close", sock.stream.fd);
					sock.server = null;
				});
				sock.server.on("error", (error) => {
					// Although the ws library may pass errors that may be more descriptive than
					// ECONNREFUSED they are not necessarily the expected error code e.g.
					// ENOTFOUND on getaddrinfo seems to be node.js specific, so using EHOSTUNREACH
					// is still probably the most useful thing to do. This error shouldn't
					// occur in a well written app as errors should get trapped in the compiled
					// app's own getaddrinfo call.
					sock.error = 23;
					// Used in getsockopt for SOL_SOCKET/SO_ERROR test.
					SOCKFS.emit("error", [
						sock.stream.fd,
						sock.error,
						"EHOSTUNREACH: Host is unreachable",
					]);
				});
			},
			accept(listensock) {
				if (!listensock.server || !listensock.pending.length) {
					throw new FS.ErrnoError(28);
				}
				var newsock = listensock.pending.shift();
				newsock.stream.flags = listensock.stream.flags;
				return newsock;
			},
			getname(sock, peer) {
				var addr, port;
				if (peer) {
					if (sock.daddr === undefined || sock.dport === undefined) {
						throw new FS.ErrnoError(53);
					}
					addr = sock.daddr;
					port = sock.dport;
				} else {
					// TODO saddr and sport will be set for bind()'d UDP sockets, but what
					// should we be returning for TCP sockets that've been connect()'d?
					addr = sock.saddr || 0;
					port = sock.sport || 0;
				}
				return {
					addr,
					port,
				};
			},
			sendmsg(sock, buffer, offset, length, addr, port) {
				if (sock.type === 2) {
					// connection-less sockets will honor the message address,
					// and otherwise fall back to the bound destination address
					if (addr === undefined || port === undefined) {
						addr = sock.daddr;
						port = sock.dport;
					}
					// if there was no address to fall back to, error out
					if (addr === undefined || port === undefined) {
						throw new FS.ErrnoError(17);
					}
				} else {
					// connection-based sockets will only use the bound
					addr = sock.daddr;
					port = sock.dport;
				}
				// find the peer for the destination address
				var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
				// early out if not connected with a connection-based socket
				if (sock.type === 1) {
					if (
						!dest ||
						dest.socket.readyState === dest.socket.CLOSING ||
						dest.socket.readyState === dest.socket.CLOSED
					) {
						throw new FS.ErrnoError(53);
					}
				}
				// create a copy of the incoming data to send, as the WebSocket API
				// doesn't work entirely with an ArrayBufferView, it'll just send
				// the entire underlying buffer
				if (ArrayBuffer.isView(buffer)) {
					offset += buffer.byteOffset;
					buffer = buffer.buffer;
				}
				var data = buffer.slice(offset, offset + length);
				// WebSockets .send() does not allow passing a SharedArrayBuffer, so
				// clone the SharedArrayBuffer as regular ArrayBuffer before
				// sending.
				if (data instanceof SharedArrayBuffer) {
					data = new Uint8Array(new Uint8Array(data)).buffer;
				}
				// if we don't have a cached connectionless UDP datagram connection, or
				// the TCP socket is still connecting, queue the message to be sent upon
				// connect, and lie, saying the data was sent now.
				if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
					// if we're not connected, open a new connection
					if (sock.type === 2) {
						if (
							!dest ||
							dest.socket.readyState === dest.socket.CLOSING ||
							dest.socket.readyState === dest.socket.CLOSED
						) {
							dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
						}
					}
					dest.msg_send_queue.push(data);
					return length;
				}
				try {
					// send the actual data
					dest.socket.send(data);
					return length;
				} catch (e) {
					throw new FS.ErrnoError(28);
				}
			},
			recvmsg(sock, length) {
				// http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
				if (sock.type === 1 && sock.server) {
					// tcp servers should not be recv()'ing on the listen socket
					throw new FS.ErrnoError(53);
				}
				var queued = sock.recv_queue.shift();
				if (!queued) {
					if (sock.type === 1) {
						var dest = SOCKFS.websocket_sock_ops.getPeer(
							sock,
							sock.daddr,
							sock.dport,
						);
						if (!dest) {
							// if we have a destination address but are not connected, error out
							throw new FS.ErrnoError(53);
						}
						if (
							dest.socket.readyState === dest.socket.CLOSING ||
							dest.socket.readyState === dest.socket.CLOSED
						) {
							// return null if the socket has closed
							return null;
						}
						// else, our socket is in a valid state but truly has nothing available
						throw new FS.ErrnoError(6);
					}
					throw new FS.ErrnoError(6);
				}
				// queued.data will be an ArrayBuffer if it's unadulterated, but if it's
				// requeued TCP data it'll be an ArrayBufferView
				var queuedLength = queued.data.byteLength || queued.data.length;
				var queuedOffset = queued.data.byteOffset || 0;
				var queuedBuffer = queued.data.buffer || queued.data;
				var bytesRead = Math.min(length, queuedLength);
				var res = {
					buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
					addr: queued.addr,
					port: queued.port,
				};
				// push back any unread data for TCP connections
				if (sock.type === 1 && bytesRead < queuedLength) {
					var bytesRemaining = queuedLength - bytesRead;
					queued.data = new Uint8Array(
						queuedBuffer,
						queuedOffset + bytesRead,
						bytesRemaining,
					);
					sock.recv_queue.unshift(queued);
				}
				return res;
			},
		},
	};

	var getSocketFromFD = (fd) => {
		var socket = SOCKFS.getSocket(fd);
		if (!socket) throw new FS.ErrnoError(8);
		return socket;
	};

	function ___syscall_getsockopt(fd, level, optname, optval, optlen, d1) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(
				10,
				0,
				1,
				fd,
				level,
				optname,
				optval,
				optlen,
				d1,
			);
		try {
			var sock = getSocketFromFD(fd);
			// Minimal getsockopt aimed at resolving https://github.com/emscripten-core/emscripten/issues/2211
			// so only supports SOL_SOCKET with SO_ERROR.
			if (level === 1) {
				if (optname === 4) {
					(growMemViews(), HEAP32)[optval >> 2] = sock.error;
					(growMemViews(), HEAP32)[optlen >> 2] = 4;
					sock.error = null;
					// Clear the error (The SO_ERROR option obtains and then clears this field).
					return 0;
				}
			}
			return -50;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_ioctl(fd, op, varargs) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(11, 0, 1, fd, op, varargs);
		SYSCALLS.varargs = varargs;
		try {
			var stream = SYSCALLS.getStreamFromFD(fd);
			switch (op) {
				case 21509: {
					if (!stream.tty) return -59;
					return 0;
				}

				case 21505: {
					if (!stream.tty) return -59;
					if (stream.tty.ops.ioctl_tcgets) {
						var termios = stream.tty.ops.ioctl_tcgets(stream);
						var argp = syscallGetVarargP();
						(growMemViews(), HEAP32)[argp >> 2] = termios.c_iflag || 0;
						(growMemViews(), HEAP32)[(argp + 4) >> 2] = termios.c_oflag || 0;
						(growMemViews(), HEAP32)[(argp + 8) >> 2] = termios.c_cflag || 0;
						(growMemViews(), HEAP32)[(argp + 12) >> 2] = termios.c_lflag || 0;
						for (var i = 0; i < 32; i++) {
							(growMemViews(), HEAP8)[argp + i + 17] = termios.c_cc[i] || 0;
						}
						return 0;
					}
					return 0;
				}

				case 21510:
				case 21511:
				case 21512: {
					if (!stream.tty) return -59;
					return 0;
				}

				case 21506:
				case 21507:
				case 21508: {
					if (!stream.tty) return -59;
					if (stream.tty.ops.ioctl_tcsets) {
						var argp = syscallGetVarargP();
						var c_iflag = (growMemViews(), HEAP32)[argp >> 2];
						var c_oflag = (growMemViews(), HEAP32)[(argp + 4) >> 2];
						var c_cflag = (growMemViews(), HEAP32)[(argp + 8) >> 2];
						var c_lflag = (growMemViews(), HEAP32)[(argp + 12) >> 2];
						var c_cc = [];
						for (var i = 0; i < 32; i++) {
							c_cc.push((growMemViews(), HEAP8)[argp + i + 17]);
						}
						return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
							c_iflag,
							c_oflag,
							c_cflag,
							c_lflag,
							c_cc,
						});
					}
					return 0;
				}

				case 21519: {
					if (!stream.tty) return -59;
					var argp = syscallGetVarargP();
					(growMemViews(), HEAP32)[argp >> 2] = 0;
					return 0;
				}

				case 21520: {
					if (!stream.tty) return -59;
					return -28;
				}

				case 21537:
				case 21531: {
					var argp = syscallGetVarargP();
					return FS.ioctl(stream, op, argp);
				}

				case 21523: {
					// TODO: in theory we should write to the winsize struct that gets
					// passed in, but for now musl doesn't read anything on it
					if (!stream.tty) return -59;
					if (stream.tty.ops.ioctl_tiocgwinsz) {
						var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
						var argp = syscallGetVarargP();
						(growMemViews(), HEAP16)[argp >> 1] = winsize[0];
						(growMemViews(), HEAP16)[(argp + 2) >> 1] = winsize[1];
					}
					return 0;
				}

				case 21524: {
					// TODO: technically, this ioctl call should change the window size.
					// but, since emscripten doesn't have any concept of a terminal window
					// yet, we'll just silently throw it away as we do TIOCGWINSZ
					if (!stream.tty) return -59;
					return 0;
				}

				case 21515: {
					if (!stream.tty) return -59;
					return 0;
				}

				default:
					return -28;
			}
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_lstat64(path, buf) {
		if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(12, 0, 1, path, buf);
		try {
			path = SYSCALLS.getStr(path);
			return SYSCALLS.writeStat(buf, FS.lstat(path));
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_mkdirat(dirfd, path, mode) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(13, 0, 1, dirfd, path, mode);
		try {
			path = SYSCALLS.getStr(path);
			path = SYSCALLS.calculateAt(dirfd, path);
			mode &= ~SYSCALLS.currentUmask;
			FS.mkdir(path, mode, 0);
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_newfstatat(dirfd, path, buf, flags) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(14, 0, 1, dirfd, path, buf, flags);
		try {
			path = SYSCALLS.getStr(path);
			var nofollow = flags & 256;
			var allowEmpty = flags & 4096;
			flags = flags & ~6400;
			assert(!flags, `unknown flags in __syscall_newfstatat: ${flags}`);
			path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
			return SYSCALLS.writeStat(buf, nofollow ? FS.lstat(path) : FS.stat(path));
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_openat(dirfd, path, flags, varargs) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(15, 0, 1, dirfd, path, flags, varargs);
		SYSCALLS.varargs = varargs;
		try {
			path = SYSCALLS.getStr(path);
			path = SYSCALLS.calculateAt(dirfd, path);
			var mode = varargs ? syscallGetVarargI() : 0;
			if (flags & 64) {
				mode &= ~SYSCALLS.currentUmask;
			}
			return FS.open(path, flags, mode).fd;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	var PIPEFS = {
		BUCKET_BUFFER_SIZE: 8192,
		mount(mount) {
			// Do not pollute the real root directory or its child nodes with pipes
			// Looks like it is OK to create another pseudo-root node not linked to the FS.root hierarchy this way
			return FS.createNode(null, "/", 16384 | 511, 0);
		},
		createPipe() {
			var pipe = {
				buckets: [],
				// refcnt 2 because pipe has a read end and a write end. We need to be
				// able to read from the read end after write end is closed.
				refcnt: 2,
				timestamp: new Date(),
				readableHandlers: [],
				registerReadableHandler: (callback) => {
					callback.registerCleanupFunc(() => {
						const i = pipe.readableHandlers.indexOf(callback);
						if (i !== -1) pipe.readableHandlers.splice(i, 1);
					});
					pipe.readableHandlers.push(callback);
				},
				notifyReadableHandlers: () => {
					while (pipe.readableHandlers.length > 0) {
						const cb = pipe.readableHandlers.shift();
						if (cb) cb(64 | 1);
					}
					pipe.readableHandlers = [];
				},
			};
			pipe.buckets.push({
				buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
				offset: 0,
				roffset: 0,
			});
			var rName = PIPEFS.nextname();
			var wName = PIPEFS.nextname();
			var rNode = FS.createNode(PIPEFS.root, rName, 4096, 0);
			var wNode = FS.createNode(PIPEFS.root, wName, 4096, 0);
			rNode.pipe = pipe;
			wNode.pipe = pipe;
			var readableStream = FS.createStream({
				path: rName,
				node: rNode,
				flags: 0,
				seekable: false,
				stream_ops: PIPEFS.stream_ops,
			});
			rNode.stream = readableStream;
			var writableStream = FS.createStream({
				path: wName,
				node: wNode,
				flags: 1,
				seekable: false,
				stream_ops: PIPEFS.stream_ops,
			});
			wNode.stream = writableStream;
			return {
				readable_fd: readableStream.fd,
				writable_fd: writableStream.fd,
			};
		},
		stream_ops: {
			getattr(stream) {
				var node = stream.node;
				var timestamp = node.pipe.timestamp;
				return {
					dev: 14,
					ino: node.id,
					mode: 4480,
					nlink: 1,
					uid: 0,
					gid: 0,
					rdev: 0,
					size: 0,
					atime: timestamp,
					mtime: timestamp,
					ctime: timestamp,
					blksize: 4096,
					blocks: 0,
				};
			},
			poll(stream, timeout, notifyCallback) {
				var pipe = stream.node.pipe;
				if ((stream.flags & 2097155) === 1) {
					return 256 | 4;
				}
				for (var bucket of pipe.buckets) {
					if (bucket.offset - bucket.roffset > 0) {
						return 64 | 1;
					}
				}
				if (notifyCallback) pipe.registerReadableHandler(notifyCallback);
				return 0;
			},
			dup(stream) {
				stream.node.pipe.refcnt++;
			},
			ioctl(stream, request, argp) {
				if (request == 21531) {
					var pipe = stream.node.pipe;
					var currentLength = 0;
					for (var bucket of pipe.buckets) {
						currentLength += bucket.offset - bucket.roffset;
					}
					(growMemViews(), HEAP32)[argp >> 2] = currentLength;
					return 0;
				}
				return 28;
			},
			fsync(stream) {
				return 28;
			},
			read(stream, buffer, offset, length, position) {
				var pipe = stream.node.pipe;
				var currentLength = 0;
				for (var bucket of pipe.buckets) {
					currentLength += bucket.offset - bucket.roffset;
				}
				assert(
					buffer instanceof ArrayBuffer ||
						buffer instanceof SharedArrayBuffer ||
						ArrayBuffer.isView(buffer),
				);
				var data = buffer.subarray(offset, offset + length);
				if (length <= 0) {
					return 0;
				}
				if (currentLength == 0) {
					// Behave as if the read end is always non-blocking
					throw new FS.ErrnoError(6);
				}
				var toRead = Math.min(currentLength, length);
				var totalRead = toRead;
				var toRemove = 0;
				for (var bucket of pipe.buckets) {
					var bucketSize = bucket.offset - bucket.roffset;
					if (toRead <= bucketSize) {
						var tmpSlice = bucket.buffer.subarray(
							bucket.roffset,
							bucket.offset,
						);
						if (toRead < bucketSize) {
							tmpSlice = tmpSlice.subarray(0, toRead);
							bucket.roffset += toRead;
						} else {
							toRemove++;
						}
						data.set(tmpSlice);
						break;
					} else {
						var tmpSlice = bucket.buffer.subarray(
							bucket.roffset,
							bucket.offset,
						);
						data.set(tmpSlice);
						data = data.subarray(tmpSlice.byteLength);
						toRead -= tmpSlice.byteLength;
						toRemove++;
					}
				}
				if (toRemove && toRemove == pipe.buckets.length) {
					// Do not generate excessive garbage in use cases such as
					// write several bytes, read everything, write several bytes, read everything...
					toRemove--;
					pipe.buckets[toRemove].offset = 0;
					pipe.buckets[toRemove].roffset = 0;
				}
				pipe.buckets.splice(0, toRemove);
				return totalRead;
			},
			write(stream, buffer, offset, length, position) {
				var pipe = stream.node.pipe;
				assert(
					buffer instanceof ArrayBuffer ||
						buffer instanceof SharedArrayBuffer ||
						ArrayBuffer.isView(buffer),
				);
				var data = buffer.subarray(offset, offset + length);
				var dataLen = data.byteLength;
				if (dataLen <= 0) {
					return 0;
				}
				var currBucket = null;
				if (pipe.buckets.length == 0) {
					currBucket = {
						buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
						offset: 0,
						roffset: 0,
					};
					pipe.buckets.push(currBucket);
				} else {
					currBucket = pipe.buckets[pipe.buckets.length - 1];
				}
				assert(currBucket.offset <= PIPEFS.BUCKET_BUFFER_SIZE);
				var freeBytesInCurrBuffer =
					PIPEFS.BUCKET_BUFFER_SIZE - currBucket.offset;
				if (freeBytesInCurrBuffer >= dataLen) {
					currBucket.buffer.set(data, currBucket.offset);
					currBucket.offset += dataLen;
					pipe.notifyReadableHandlers();
					return dataLen;
				} else if (freeBytesInCurrBuffer > 0) {
					currBucket.buffer.set(
						data.subarray(0, freeBytesInCurrBuffer),
						currBucket.offset,
					);
					currBucket.offset += freeBytesInCurrBuffer;
					data = data.subarray(freeBytesInCurrBuffer, data.byteLength);
				}
				var numBuckets = (data.byteLength / PIPEFS.BUCKET_BUFFER_SIZE) | 0;
				var remElements = data.byteLength % PIPEFS.BUCKET_BUFFER_SIZE;
				for (var i = 0; i < numBuckets; i++) {
					var newBucket = {
						buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
						offset: PIPEFS.BUCKET_BUFFER_SIZE,
						roffset: 0,
					};
					pipe.buckets.push(newBucket);
					newBucket.buffer.set(data.subarray(0, PIPEFS.BUCKET_BUFFER_SIZE));
					data = data.subarray(PIPEFS.BUCKET_BUFFER_SIZE, data.byteLength);
				}
				if (remElements > 0) {
					var newBucket = {
						buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
						offset: data.byteLength,
						roffset: 0,
					};
					pipe.buckets.push(newBucket);
					newBucket.buffer.set(data);
				}
				pipe.notifyReadableHandlers();
				return dataLen;
			},
			close(stream) {
				var pipe = stream.node.pipe;
				pipe.refcnt--;
				if (pipe.refcnt === 0) {
					pipe.buckets = null;
				}
			},
		},
		nextname() {
			if (!PIPEFS.nextname.current) {
				PIPEFS.nextname.current = 0;
			}
			return "pipe[" + PIPEFS.nextname.current++ + "]";
		},
	};

	function ___syscall_pipe2(fdPtr, flags) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(16, 0, 1, fdPtr, flags);
		try {
			if (fdPtr == 0) {
				throw new FS.ErrnoError(21);
			}
			var validFlags = 524288 | 2048;
			if (flags & ~validFlags) {
				throw new FS.ErrnoError(138);
			}
			var res = PIPEFS.createPipe();
			if (flags & 2048) {
				FS.getStream(res.readable_fd).flags |= 2048;
				FS.getStream(res.writable_fd).flags |= 2048;
			}
			(growMemViews(), HEAP32)[fdPtr >> 2] = res.readable_fd;
			(growMemViews(), HEAP32)[(fdPtr + 4) >> 2] = res.writable_fd;
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	var doPoll = (fds, nfds, timeout, makeNotifyCallback) => {
		var count = 0;
		for (var i = 0; i < nfds; i++) {
			var pollfd = fds + 8 * i;
			var fd = (growMemViews(), HEAP32)[pollfd >> 2];
			var events = (growMemViews(), HEAP16)[(pollfd + 4) >> 1];
			var flags = 32;
			var stream = FS.getStream(fd);
			if (stream) {
				if (stream.stream_ops.poll) {
					flags = timeout
						? stream.stream_ops.poll(
								stream,
								timeout,
								makeNotifyCallback(stream, pollfd),
							)
						: stream.stream_ops.poll(stream, -1);
				} else {
					flags = 5;
				}
			}
			flags &= events | 8 | 16;
			if (flags) count++;
			(growMemViews(), HEAP16)[(pollfd + 6) >> 1] = flags;
		}
		return count;
	};

	var ___syscall_poll = function (fds, nfds, timeout) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(17, 0, 2, fds, nfds, timeout);
		try {
			const isAsyncContext = PThread.currentProxiedOperationCallerThread;
			// Enable event handlers only when the poll call is proxied from a worker.
			// TODO: Could use `Promise.withResolvers` here if we know its available.
			var resolve;
			var promise = new Promise((resolve_) => {
				resolve = resolve_;
			});
			var cleanupFuncs = [];
			var notifyDone = false;
			function asyncPollComplete(count) {
				if (notifyDone) {
					return;
				}
				notifyDone = true;
				cleanupFuncs.forEach((cb) => cb());
				resolve(count);
			}
			function makeNotifyCallback(stream, pollfd) {
				var cb = (flags) => {
					if (notifyDone) {
						return;
					}
					var events = (growMemViews(), HEAP16)[(pollfd + 4) >> 1];
					flags &= events | 8 | 16;
					assert(flags);
					(growMemViews(), HEAP16)[(pollfd + 6) >> 1] = flags;
					asyncPollComplete(1);
				};
				cb.registerCleanupFunc = (f) => {
					if (f) cleanupFuncs.push(f);
				};
				return cb;
			}
			if (isAsyncContext) {
				if (timeout > 0) {
					var t = setTimeout(() => {
						asyncPollComplete(0);
					}, timeout);
					cleanupFuncs.push(() => clearTimeout(t));
				}
				// A zero timeout never registers notifications: the derivation alone
				// answers, matching the non-blocking probe.
				var count = doPoll(fds, nfds, timeout, makeNotifyCallback);
				if (count || !timeout) {
					asyncPollComplete(count);
				}
				return promise;
			}
			var count = doPoll(fds, nfds, 0, undefined);
			if (!count && timeout != 0)
				warnOnce("non-zero poll() timeout not supported: " + timeout);
			return count;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	};

	function ___syscall_poll_nonblocking(fds, nfds) {
		if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(18, 0, 1, fds, nfds);
		try {
			return doPoll(fds, nfds, 0, undefined);
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(19, 0, 1, dirfd, path, buf, bufsize);
		try {
			path = SYSCALLS.getStr(path);
			path = SYSCALLS.calculateAt(dirfd, path);
			if (bufsize <= 0) return -28;
			var ret = FS.readlink(path);
			var len = Math.min(bufsize, lengthBytesUTF8(ret));
			var endChar = (growMemViews(), HEAP8)[buf + len];
			stringToUTF8(ret, buf, bufsize + 1);
			// readlink is one of the rare functions that write out a C string, but does never append a null to the output buffer(!)
			// stringToUTF8() always appends a null byte, so restore the character under the null byte after the write.
			(growMemViews(), HEAP8)[buf + len] = endChar;
			return len;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	var inetPton4 = (str) => {
		var b = str.split(".");
		for (var i = 0; i < 4; i++) {
			var tmp = Number(b[i]);
			if (isNaN(tmp)) return null;
			b[i] = tmp;
		}
		return (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0;
	};

	var inetPton6 = (str) => {
		var words;
		var w, offset, z, i;
		/* http://home.deds.nl/~aeron/regex/ */ var valid6regx =
			/^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i;
		var parts = [];
		if (!valid6regx.test(str)) {
			return null;
		}
		if (str === "::") {
			return [0, 0, 0, 0, 0, 0, 0, 0];
		}
		// Z placeholder to keep track of zeros when splitting the string on ":"
		if (str.startsWith("::")) {
			str = str.replace("::", "Z:");
		} else {
			str = str.replace("::", ":Z:");
		}
		if (str.indexOf(".") > 0) {
			// parse IPv4 embedded address
			str = str.replace(new RegExp("[.]", "g"), ":");
			words = str.split(":");
			words[words.length - 4] =
				Number(words[words.length - 4]) + Number(words[words.length - 3]) * 256;
			words[words.length - 3] =
				Number(words[words.length - 2]) + Number(words[words.length - 1]) * 256;
			words = words.slice(0, words.length - 2);
		} else {
			words = str.split(":");
		}
		offset = 0;
		z = 0;
		for (w = 0; w < words.length; w++) {
			if (typeof words[w] == "string") {
				if (words[w] === "Z") {
					// compressed zeros - write appropriate number of zero words
					for (z = 0; z < 8 - words.length + 1; z++) {
						parts[w + z] = 0;
					}
					offset = z - 1;
				} else {
					// parse hex field to 16-bit value and write it in network byte-order
					parts[w + offset] = _htons(parseInt(words[w], 16));
				}
			} else {
				// parsed IPv4 words
				parts[w + offset] = words[w];
			}
		}
		return [
			(parts[1] << 16) | parts[0],
			(parts[3] << 16) | parts[2],
			(parts[5] << 16) | parts[4],
			(parts[7] << 16) | parts[6],
		];
	};

	/** @param {number=} addrlen */ var writeSockaddr = (
		sa,
		family,
		addr,
		port,
		addrlen,
	) => {
		switch (family) {
			case 2:
				addr = inetPton4(addr);
				zeroMemory(sa, 16);
				if (addrlen) {
					(growMemViews(), HEAP32)[addrlen >> 2] = 16;
				}
				(growMemViews(), HEAP16)[sa >> 1] = family;
				(growMemViews(), HEAP32)[(sa + 4) >> 2] = addr;
				(growMemViews(), HEAP16)[(sa + 2) >> 1] = _htons(port);
				break;

			case 10:
				addr = inetPton6(addr);
				zeroMemory(sa, 28);
				if (addrlen) {
					(growMemViews(), HEAP32)[addrlen >> 2] = 28;
				}
				(growMemViews(), HEAP32)[sa >> 2] = family;
				(growMemViews(), HEAP32)[(sa + 8) >> 2] = addr[0];
				(growMemViews(), HEAP32)[(sa + 12) >> 2] = addr[1];
				(growMemViews(), HEAP32)[(sa + 16) >> 2] = addr[2];
				(growMemViews(), HEAP32)[(sa + 20) >> 2] = addr[3];
				(growMemViews(), HEAP16)[(sa + 2) >> 1] = _htons(port);
				break;

			default:
				return 5;
		}
		return 0;
	};

	var DNS = {
		address_map: {
			id: 1,
			addrs: {},
			names: {},
		},
		lookup_name(name) {
			// If the name is already a valid ipv4 / ipv6 address, don't generate a fake one.
			var res = inetPton4(name);
			if (res !== null) {
				return name;
			}
			res = inetPton6(name);
			if (res !== null) {
				return name;
			}
			// See if this name is already mapped.
			var addr;
			if (DNS.address_map.addrs[name]) {
				addr = DNS.address_map.addrs[name];
			} else {
				var id = DNS.address_map.id++;
				assert(id < 65535, "exceeded max address mappings of 65535");
				addr = "172.29." + (id & 255) + "." + (id & 65280);
				DNS.address_map.names[addr] = name;
				DNS.address_map.addrs[name] = addr;
			}
			return addr;
		},
		lookup_addr(addr) {
			if (DNS.address_map.names[addr]) {
				return DNS.address_map.names[addr];
			}
			return null;
		},
	};

	function ___syscall_recvfrom(fd, buf, len, flags, addr, addrlen) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(20, 0, 1, fd, buf, len, flags, addr, addrlen);
		try {
			var sock = getSocketFromFD(fd);
			var msg = sock.sock_ops.recvmsg(sock, len);
			if (!msg) return 0;
			// socket is closed
			if (addr) {
				var errno = writeSockaddr(
					addr,
					sock.family,
					DNS.lookup_name(msg.addr),
					msg.port,
					addrlen,
				);
				assert(!errno);
			}
			(growMemViews(), HEAPU8).set(msg.buffer, buf);
			return msg.buffer.byteLength;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(21, 0, 1, olddirfd, oldpath, newdirfd, newpath);
		try {
			oldpath = SYSCALLS.getStr(oldpath);
			newpath = SYSCALLS.getStr(newpath);
			oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
			newpath = SYSCALLS.calculateAt(newdirfd, newpath);
			FS.rename(oldpath, newpath);
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_rmdir(path) {
		if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(22, 0, 1, path);
		try {
			path = SYSCALLS.getStr(path);
			FS.rmdir(path);
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	var inetNtop4 = (addr) =>
		(addr & 255) +
		"." +
		((addr >> 8) & 255) +
		"." +
		((addr >> 16) & 255) +
		"." +
		((addr >> 24) & 255);

	var inetNtop6 = (ints) => {
		//  ref:  http://www.ietf.org/rfc/rfc2373.txt - section 2.5.4
		//  Format for IPv4 compatible and mapped  128-bit IPv6 Addresses
		//  128-bits are split into eight 16-bit words
		//  stored in network byte order (big-endian)
		//  |                80 bits               | 16 |      32 bits        |
		//  +-----------------------------------------------------------------+
		//  |               10 bytes               |  2 |      4 bytes        |
		//  +--------------------------------------+--------------------------+
		//  +               5 words                |  1 |      2 words        |
		//  +--------------------------------------+--------------------------+
		//  |0000..............................0000|0000|    IPv4 ADDRESS     | (compatible)
		//  +--------------------------------------+----+---------------------+
		//  |0000..............................0000|FFFF|    IPv4 ADDRESS     | (mapped)
		//  +--------------------------------------+----+---------------------+
		var str = "";
		var word = 0;
		var longest = 0;
		var lastzero = 0;
		var zstart = 0;
		var len = 0;
		var i = 0;
		var parts = [
			ints[0] & 65535,
			ints[0] >> 16,
			ints[1] & 65535,
			ints[1] >> 16,
			ints[2] & 65535,
			ints[2] >> 16,
			ints[3] & 65535,
			ints[3] >> 16,
		];
		// Handle IPv4-compatible, IPv4-mapped, loopback and any/unspecified addresses
		var hasipv4 = true;
		var v4part = "";
		// check if the 10 high-order bytes are all zeros (first 5 words)
		for (i = 0; i < 5; i++) {
			if (parts[i] !== 0) {
				hasipv4 = false;
				break;
			}
		}
		if (hasipv4) {
			// low-order 32-bits store an IPv4 address (bytes 13 to 16) (last 2 words)
			v4part = inetNtop4(parts[6] | (parts[7] << 16));
			// IPv4-mapped IPv6 address if 16-bit value (bytes 11 and 12) == 0xFFFF (6th word)
			if (parts[5] === -1) {
				str = "::ffff:";
				str += v4part;
				return str;
			}
			// IPv4-compatible IPv6 address if 16-bit value (bytes 11 and 12) == 0x0000 (6th word)
			if (parts[5] === 0) {
				str = "::";
				// special case IPv6 addresses
				if (v4part === "0.0.0.0") v4part = "";
				// any/unspecified address
				if (v4part === "0.0.0.1") v4part = "1";
				// loopback address
				str += v4part;
				return str;
			}
		}
		// Handle all other IPv6 addresses
		// first run to find the longest contiguous zero words
		for (word = 0; word < 8; word++) {
			if (parts[word] === 0) {
				if (word - lastzero > 1) {
					len = 0;
				}
				lastzero = word;
				len++;
			}
			if (len > longest) {
				longest = len;
				zstart = word - longest + 1;
			}
		}
		for (word = 0; word < 8; word++) {
			if (longest > 1) {
				// compress contiguous zeros - to produce "::"
				if (parts[word] === 0 && word >= zstart && word < zstart + longest) {
					if (word === zstart) {
						str += ":";
						if (zstart === 0) str += ":";
					}
					continue;
				}
			}
			// converts 16-bit words from big-endian to little-endian before converting to hex string
			str += Number(_ntohs(parts[word] & 65535)).toString(16);
			str += word < 7 ? ":" : "";
		}
		return str;
	};

	var readSockaddr = (sa, salen) => {
		// family / port offsets are common to both sockaddr_in and sockaddr_in6
		var family = (growMemViews(), HEAP16)[sa >> 1];
		var port = _ntohs((growMemViews(), HEAPU16)[(sa + 2) >> 1]);
		var addr;
		switch (family) {
			case 2:
				if (salen !== 16) {
					return {
						errno: 28,
					};
				}
				addr = (growMemViews(), HEAP32)[(sa + 4) >> 2];
				addr = inetNtop4(addr);
				break;

			case 10:
				if (salen !== 28) {
					return {
						errno: 28,
					};
				}
				addr = [
					(growMemViews(), HEAP32)[(sa + 8) >> 2],
					(growMemViews(), HEAP32)[(sa + 12) >> 2],
					(growMemViews(), HEAP32)[(sa + 16) >> 2],
					(growMemViews(), HEAP32)[(sa + 20) >> 2],
				];
				addr = inetNtop6(addr);
				break;

			default:
				return {
					errno: 5,
				};
		}
		return {
			family,
			addr,
			port,
		};
	};

	var getSocketAddress = (addrp, addrlen) => {
		var info = readSockaddr(addrp, addrlen);
		if (info.errno) throw new FS.ErrnoError(info.errno);
		info.addr = DNS.lookup_addr(info.addr) || info.addr;
		return info;
	};

	function ___syscall_sendto(fd, message, length, flags, addr, addr_len) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(
				23,
				0,
				1,
				fd,
				message,
				length,
				flags,
				addr,
				addr_len,
			);
		try {
			var sock = getSocketFromFD(fd);
			if (!addr) {
				// send, no address provided
				return FS.write(sock.stream, (growMemViews(), HEAP8), message, length);
			}
			var dest = getSocketAddress(addr, addr_len);
			// sendto an address
			return sock.sock_ops.sendmsg(
				sock,
				(growMemViews(), HEAP8),
				message,
				length,
				dest.addr,
				dest.port,
			);
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_socket(domain, type, protocol) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(24, 0, 1, domain, type, protocol);
		try {
			var sock = SOCKFS.createSocket(domain, type, protocol);
			assert(sock.stream.fd < 64);
			// XXX ? select() assumes socket fd values are in 0..63
			return sock.stream.fd;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_stat64(path, buf) {
		if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(25, 0, 1, path, buf);
		try {
			path = SYSCALLS.getStr(path);
			return SYSCALLS.writeStat(buf, FS.stat(path));
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_umask(mask) {
		if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(26, 0, 1, mask);
		try {
			var old = SYSCALLS.currentUmask;
			SYSCALLS.currentUmask = mask;
			return old;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function ___syscall_unlinkat(dirfd, path, flags) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(27, 0, 1, dirfd, path, flags);
		try {
			path = SYSCALLS.getStr(path);
			path = SYSCALLS.calculateAt(dirfd, path);
			if (!flags) {
				FS.unlink(path);
			} else if (flags === 512) {
				FS.rmdir(path);
			} else {
				return -28;
			}
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	var __abort_js = () => abort("native code called abort()");

	var __emscripten_init_main_thread_js = (tb) => {
		var can_block = !ENVIRONMENT_IS_WEB;
		// Feature detect whether the main thread can block.
		try {
			Atomics.wait((growMemViews(), HEAP32), 0, 0, 0);
			can_block = true;
		} catch (e) {}
		// Pass the thread address to the native code where they are stored in wasm
		// globals which act as a form of TLS. Global constructors trying
		// to access this value will read the wrong value, but that is UB anyway.
		__emscripten_thread_init(
			tb,
			/*is_main=*/ !ENVIRONMENT_IS_WORKER,
			/*is_runtime=*/ 1,
			can_block,
			/*default_stacksize=*/ 4194304,
			/*start_profiling=*/ false,
		);
		PThread.threadInitTLS();
	};

	var __emscripten_lookup_name = (name) => {
		// uint32_t _emscripten_lookup_name(const char *name);
		var nameString = UTF8ToString(name);
		return inetPton4(DNS.lookup_name(nameString));
	};

	var handleException = (e) => {
		// Certain exception types we do not treat as errors since they are used for
		// internal control flow.
		// 1. ExitStatus, which is thrown by exit()
		// 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
		//    that wish to return to JS event loop.
		if (e instanceof ExitStatus || e == "unwind") {
			return EXITSTATUS;
		}
		checkStackCookie();
		if (e instanceof WebAssembly.RuntimeError) {
			if (_emscripten_stack_get_current() <= 0) {
				err(
					"Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 4194304)",
				);
			}
		}
		quit_(1, e);
	};

	var maybeExit = () => {
		if (!keepRuntimeAlive()) {
			try {
				if (ENVIRONMENT_IS_PTHREAD) {
					// exit the current thread, but only if there is one active.
					// TODO(https://github.com/emscripten-core/emscripten/issues/25076):
					// Unify this check with the runtimeExited check above
					if (_pthread_self()) __emscripten_thread_exit(EXITSTATUS);
					return;
				}
				_exit(EXITSTATUS);
			} catch (e) {
				handleException(e);
			}
		}
	};

	var callUserCallback = (func) => {
		if (ABORT) {
			err(
				"user callback triggered after runtime exited or application aborted.  Ignoring.",
			);
			return;
		}
		try {
			return func();
		} catch (e) {
			handleException(e);
		} finally {
			maybeExit();
		}
	};

	var __emscripten_thread_mailbox_await = (pthread_ptr) => {
		if (!waitAsyncPolyfilled) {
			// Wait on the pthread's initial self-pointer field because it is easy and
			// safe to access from sending threads that need to notify the waiting
			// thread.
			// Note: Under wasm64 only the low 32-bit of the pthread_ptr are
			// read/compared here, but we don't actually care about the exact values
			// here as long as they match.
			var wait = Atomics.waitAsync(
				(growMemViews(), HEAP32),
				pthread_ptr >> 2,
				pthread_ptr,
			);
			assert(wait.async);
			wait.value.then(checkMailbox);
			var waitingAsync = pthread_ptr + 112;
			Atomics.store((growMemViews(), HEAP32), waitingAsync >> 2, 1);
		}
	};

	var checkMailbox = () => {
		// checkMailbox can be called after the pthread has shut down. See
		// Pthread.terminateRuntime().
		// In this case we return silently without re-registering using waitAsync.
		// Perhaps there is a more universal way we can detect runtime has exited.
		// TODO(https://github.com/emscripten-core/emscripten/issues/25076)
		var pthread_ptr = _pthread_self();
		if (!pthread_ptr) return;
		callUserCallback(() => {
			// If we are using Atomics.waitAsync as our notification mechanism, wait
			// for a notification before processing the mailbox to avoid missing any
			// work that could otherwise arrive after we've finished processing the
			// mailbox and before we're ready for the next notification.
			__emscripten_thread_mailbox_await(pthread_ptr);
			__emscripten_check_mailbox();
		});
	};

	var __emscripten_notify_mailbox_postmessage = (
		targetThread,
		currThreadId,
	) => {
		if (targetThread == currThreadId) {
			setTimeout(checkMailbox);
		} else if (ENVIRONMENT_IS_PTHREAD) {
			postMessage({
				targetThread,
				cmd: 4,
			});
		} else {
			var worker = PThread.pthreads[targetThread];
			if (!worker) {
				err(
					`Cannot send message to thread with ID ${targetThread}, unknown thread ID!`,
				);
				return;
			}
			worker.postMessage({
				cmd: 4,
			});
		}
	};

	var proxiedJSCallArgs = [];

	var __emscripten_receive_on_main_thread_js = (
		funcIndex,
		emAsmAddr,
		callingThread,
		bufSize,
		args,
		ctx,
		ctxArgs,
	) => {
		// Sometimes we need to backproxy events to the calling thread (e.g.
		// HTML5 DOM events handlers such as
		// emscripten_set_mousemove_callback()), so keep track in a globally
		// accessible variable about the thread that initiated the proxying.
		proxiedJSCallArgs.length = 0;
		var b = args >> 3;
		var end = (args + bufSize) >> 3;
		while (b < end) {
			var arg;
			if ((growMemViews(), HEAP64)[b++]) {
				// It's a BigInt.
				arg = (growMemViews(), HEAP64)[b++];
			} else {
				// It's a Number.
				arg = (growMemViews(), HEAPF64)[b++];
			}
			proxiedJSCallArgs.push(arg);
		}
		// Proxied JS library funcs use funcIndex and EM_ASM functions use emAsmAddr
		assert(!emAsmAddr);
		var func = proxiedFunctionTable[funcIndex];
		assert(!(funcIndex && emAsmAddr));
		assert(
			func.length == proxiedJSCallArgs.length,
			"Call args mismatch in _emscripten_receive_on_main_thread_js",
		);
		PThread.currentProxiedOperationCallerThread = callingThread;
		var rtn = func(...proxiedJSCallArgs);
		PThread.currentProxiedOperationCallerThread = 0;
		if (ctx) {
			rtn.then((rtn) =>
				__emscripten_run_js_on_main_thread_done(ctx, ctxArgs, rtn),
			);
			return;
		}
		// Proxied functions can return any type except bigint.  All other types
		// coerce to f64/double (the return type of this function in C) but not
		// bigint.
		assert(typeof rtn != "bigint");
		return rtn;
	};

	var __emscripten_runtime_keepalive_clear = () => {
		noExitRuntime = false;
		runtimeKeepaliveCounter = 0;
	};

	var __emscripten_thread_cleanup = (thread) => {
		// Called when a thread needs to be cleaned up so it can be reused.
		// A thread is considered reusable when it either returns from its
		// entry point, calls pthread_exit, or acts upon a cancellation.
		// Detached threads are responsible for calling this themselves,
		// otherwise pthread_join is responsible for calling this.
		if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread);
		else
			postMessage({
				cmd: 6,
				thread,
			});
	};

	var __emscripten_thread_set_strongref = (thread) => {
		// Called when a thread needs to be strongly referenced.
		// Currently only used for:
		// - keeping the "main" thread alive in PROXY_TO_PTHREAD mode;
		// - crashed threads that need to propagate the uncaught exception
		//   back to the main thread.
		if (ENVIRONMENT_IS_NODE) {
			var worker = PThread.pthreads[thread];
			worker.ref();
			// Also, record that we called strongref, in case this function is called
			// bafore the 'loaded' callback from the thread (where we would normally
			// `unref` it.
			worker.strongref = 1;
		}
	};

	var isLeapYear = (year) =>
		year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

	var MONTH_DAYS_LEAP_CUMULATIVE = [
		0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335,
	];

	var MONTH_DAYS_REGULAR_CUMULATIVE = [
		0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334,
	];

	var ydayFromDate = (date) => {
		var leap = isLeapYear(date.getFullYear());
		var monthDaysCumulative = leap
			? MONTH_DAYS_LEAP_CUMULATIVE
			: MONTH_DAYS_REGULAR_CUMULATIVE;
		var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
		// -1 since it's days since Jan 1
		return yday;
	};

	var INT53_MAX = 9007199254740992;

	var INT53_MIN = -9007199254740992;

	var bigintToI53Checked = (num) =>
		num < INT53_MIN || num > INT53_MAX ? NaN : Number(num);

	function __localtime_js(time, tmPtr) {
		time = bigintToI53Checked(time);
		var date = new Date(time * 1e3);
		(growMemViews(), HEAP32)[tmPtr >> 2] = date.getSeconds();
		(growMemViews(), HEAP32)[(tmPtr + 4) >> 2] = date.getMinutes();
		(growMemViews(), HEAP32)[(tmPtr + 8) >> 2] = date.getHours();
		(growMemViews(), HEAP32)[(tmPtr + 12) >> 2] = date.getDate();
		(growMemViews(), HEAP32)[(tmPtr + 16) >> 2] = date.getMonth();
		(growMemViews(), HEAP32)[(tmPtr + 20) >> 2] = date.getFullYear() - 1900;
		(growMemViews(), HEAP32)[(tmPtr + 24) >> 2] = date.getDay();
		var yday = ydayFromDate(date) | 0;
		(growMemViews(), HEAP32)[(tmPtr + 28) >> 2] = yday;
		(growMemViews(), HEAP32)[(tmPtr + 36) >> 2] = -(
			date.getTimezoneOffset() * 60
		);
		// Attention: DST is in December in South, and some regions don't have DST at all.
		var start = new Date(date.getFullYear(), 0, 1);
		var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
		var winterOffset = start.getTimezoneOffset();
		var dst =
			(summerOffset != winterOffset &&
				date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
		(growMemViews(), HEAP32)[(tmPtr + 32) >> 2] = dst;
	}

	function __mmap_js(len, prot, flags, fd, offset, allocated, addr) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(
				28,
				0,
				1,
				len,
				prot,
				flags,
				fd,
				offset,
				allocated,
				addr,
			);
		offset = bigintToI53Checked(offset);
		try {
			// musl's mmap doesn't allow values over a certain limit
			// see OFF_MASK in mmap.c.
			assert(!isNaN(offset));
			var stream = SYSCALLS.getStreamFromFD(fd);
			var res = FS.mmap(stream, len, offset, prot, flags);
			var ptr = res.ptr;
			(growMemViews(), HEAP32)[allocated >> 2] = res.allocated;
			(growMemViews(), HEAPU32)[addr >> 2] = ptr;
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	function __munmap_js(addr, len, prot, flags, fd, offset) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(29, 0, 1, addr, len, prot, flags, fd, offset);
		offset = bigintToI53Checked(offset);
		try {
			var stream = SYSCALLS.getStreamFromFD(fd);
			if (prot & 2) {
				SYSCALLS.doMsync(addr, stream, len, flags, offset);
			}
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}

	var timers = {};

	var clearTimers = () => {
		for (var t of Object.values(timers)) {
			clearTimeout(t.id);
		}
	};

	var _emscripten_get_now = () => performance.timeOrigin + performance.now();

	function __setitimer_js(which, timeout_ms) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(30, 0, 1, which, timeout_ms);
		// First, clear any existing timer.
		if (timers[which]) {
			clearTimeout(timers[which].id);
			delete timers[which];
		}
		// A timeout of zero simply cancels the current timeout so we have nothing
		// more to do.
		if (!timeout_ms) return 0;
		var id = setTimeout(() => {
			assert(which in timers);
			delete timers[which];
			callUserCallback(() =>
				__emscripten_timeout(which, _emscripten_get_now()),
			);
		}, timeout_ms);
		timers[which] = {
			id,
			timeout_ms,
		};
		return 0;
	}

	var __tzset_js = (timezone, daylight, std_name, dst_name) => {
		// TODO: Use (malleable) environment variables instead of system settings.
		var currentYear = new Date().getFullYear();
		var winter = new Date(currentYear, 0, 1);
		var summer = new Date(currentYear, 6, 1);
		var winterOffset = winter.getTimezoneOffset();
		var summerOffset = summer.getTimezoneOffset();
		// Local standard timezone offset. Local standard time is not adjusted for
		// daylight savings.  This code uses the fact that getTimezoneOffset returns
		// a greater value during Standard Time versus Daylight Saving Time (DST).
		// Thus it determines the expected output during Standard Time, and it
		// compares whether the output of the given date the same (Standard) or less
		// (DST).
		var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
		// timezone is specified as seconds west of UTC ("The external variable
		// `timezone` shall be set to the difference, in seconds, between
		// Coordinated Universal Time (UTC) and local standard time."), the same
		// as returned by stdTimezoneOffset.
		// See http://pubs.opengroup.org/onlinepubs/009695399/functions/tzset.html
		(growMemViews(), HEAPU32)[timezone >> 2] = stdTimezoneOffset * 60;
		(growMemViews(), HEAP32)[daylight >> 2] = Number(
			winterOffset != summerOffset,
		);
		var extractZone = (timezoneOffset) => {
			// Why inverse sign?
			// Read here https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
			var sign = timezoneOffset >= 0 ? "-" : "+";
			var absOffset = Math.abs(timezoneOffset);
			var hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
			var minutes = String(absOffset % 60).padStart(2, "0");
			return `UTC${sign}${hours}${minutes}`;
		};
		var winterName = extractZone(winterOffset);
		var summerName = extractZone(summerOffset);
		assert(winterName);
		assert(summerName);
		assert(
			lengthBytesUTF8(winterName) <= 16,
			`timezone name truncated to fit in TZNAME_MAX (${winterName})`,
		);
		assert(
			lengthBytesUTF8(summerName) <= 16,
			`timezone name truncated to fit in TZNAME_MAX (${summerName})`,
		);
		if (summerOffset < winterOffset) {
			// Northern hemisphere
			stringToUTF8(winterName, std_name, 17);
			stringToUTF8(summerName, dst_name, 17);
		} else {
			stringToUTF8(winterName, dst_name, 17);
			stringToUTF8(summerName, std_name, 17);
		}
	};

	var _emscripten_get_now_res = () => {
		// return resolution of get_now, in nanoseconds
		if (ENVIRONMENT_IS_NODE) {
			return 1;
		}
		// Modern environment where performance.now() is supported:
		return 1e3;
	};

	var nowIsMonotonic = 1;

	var checkWasiClock = (clock_id) => clock_id >= 0 && clock_id <= 3;

	var _clock_res_get = (clk_id, pres) => {
		if (!checkWasiClock(clk_id)) {
			return 28;
		}
		var nsec;
		// all wasi clocks but realtime are monotonic
		if (clk_id === 0) {
			nsec = 1e3 * 1e3;
		} else if (nowIsMonotonic) {
			nsec = _emscripten_get_now_res();
		} else {
			return 52;
		}
		(growMemViews(), HEAP64)[pres >> 3] = BigInt(nsec);
		return 0;
	};

	var _emscripten_date_now = () => Date.now();

	function _clock_time_get(clk_id, ignored_precision, ptime) {
		ignored_precision = bigintToI53Checked(ignored_precision);
		if (!checkWasiClock(clk_id)) {
			return 28;
		}
		var now;
		// all wasi clocks but realtime are monotonic
		if (clk_id === 0) {
			now = _emscripten_date_now();
		} else if (nowIsMonotonic) {
			now = _emscripten_get_now();
		} else {
			return 52;
		}
		// "now" is in ms, and wasi times are in ns.
		var nsec = Math.round(now * 1e3 * 1e3);
		(growMemViews(), HEAP64)[ptime >> 3] = BigInt(nsec);
		return 0;
	}

	var _emscripten_check_blocking_allowed = () => {
		if (ENVIRONMENT_IS_NODE) return;
		if (ENVIRONMENT_IS_WORKER) return;
		// Blocking in a worker/pthread is fine.
		warnOnce(
			"Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread",
		);
	};

	var _emscripten_err = (str) => err(UTF8ToString(str));

	var runtimeKeepalivePush = () => {
		runtimeKeepaliveCounter += 1;
	};

	var _emscripten_exit_with_live_runtime = () => {
		runtimeKeepalivePush();
		throw "unwind";
	};

	var getHeapMax = () =>
		// Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
		// full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
		// for any code that deals with heap sizes, which would require special
		// casing all heap size related code to treat 0 specially.
		1610612736;

	var _emscripten_get_heap_max = () => getHeapMax();

	var _emscripten_num_logical_cores = () =>
		ENVIRONMENT_IS_NODE
			? require("node:os").cpus().length
			: navigator["hardwareConcurrency"];

	var growMemory = (size) => {
		var oldHeapSize = wasmMemory.buffer.byteLength;
		var pages = ((size - oldHeapSize + 65535) / 65536) | 0;
		try {
			// round size grow request up to wasm page size (fixed 64KB per spec)
			wasmMemory.grow(pages);
			// .grow() takes a delta compared to the previous size
			updateMemoryViews();
			return 1;
		} catch (e) {
			err(
				`growMemory: Attempted to grow heap from ${oldHeapSize} bytes to ${size} bytes, but got error: ${e}`,
			);
		}
	};

	var _emscripten_resize_heap = (requestedSize) => {
		var oldSize = (growMemViews(), HEAPU8).length;
		// With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
		requestedSize >>>= 0;
		// With multithreaded builds, races can happen (another thread might increase the size
		// in between), so return a failure, and let the caller retry.
		if (requestedSize <= oldSize) {
			return false;
		}
		// Memory resize rules:
		// 1.  Always increase heap size to at least the requested size, rounded up
		//     to next page multiple.
		// 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap
		//     geometrically: increase the heap size according to
		//     MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%), At most
		//     overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
		// 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap
		//     linearly: increase the heap size by at least
		//     MEMORY_GROWTH_LINEAR_STEP bytes.
		// 3.  Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by
		//     MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
		// 4.  If we were unable to allocate as much memory, it may be due to
		//     over-eager decision to excessively reserve due to (3) above.
		//     Hence if an allocation fails, cut down on the amount of excess
		//     growth, in an attempt to succeed to perform a smaller allocation.
		// A limit is set for how much we can grow. We should not exceed that
		// (the wasm binary specifies it, so if we tried, we'd fail anyhow).
		var maxHeapSize = getHeapMax();
		if (requestedSize > maxHeapSize) {
			err(
				`Cannot enlarge memory, requested ${requestedSize} bytes, but the limit is ${maxHeapSize} bytes!`,
			);
			return false;
		}
		// Loop through potential heap size increases. If we attempt a too eager
		// reservation that fails, cut down on the attempted size and reserve a
		// smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
		for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
			var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
			// ensure geometric growth
			// but limit overreserving (default to capping at +96MB overgrowth at most)
			overGrownHeapSize = Math.min(
				overGrownHeapSize,
				requestedSize + 100663296,
			);
			var newSize = Math.min(
				maxHeapSize,
				alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536),
			);
			var replacement = growMemory(newSize);
			if (replacement) {
				return true;
			}
		}
		err(
			`Failed to grow the heap from ${oldSize} bytes to ${newSize} bytes, not enough memory!`,
		);
		return false;
	};

	var ENV = {};

	var getExecutableName = () => thisProgram;

	var getEnvStrings = () => {
		if (!getEnvStrings.strings) {
			// Default values.
			var lang =
				(globalThis.navigator?.language ?? "C").replace("-", "_") + ".UTF-8";
			var env = {
				USER: "web_user",
				LOGNAME: "web_user",
				PATH: "/",
				PWD: "/",
				HOME: "/home/web_user",
				LANG: lang,
				_: getExecutableName(),
			};
			// Apply the user-provided values, if any.
			for (var x in ENV) {
				// x is a key in ENV; if ENV[x] is undefined, that means it was
				// explicitly set to be so. We allow user code to do that to
				// force variables with default values to remain unset.
				if (ENV[x] === undefined) delete env[x];
				else env[x] = ENV[x];
			}
			var strings = [];
			for (var x in env) {
				strings.push(`${x}=${env[x]}`);
			}
			getEnvStrings.strings = strings;
		}
		return getEnvStrings.strings;
	};

	function _environ_get(__environ, environ_buf) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(31, 0, 1, __environ, environ_buf);
		var bufSize = 0;
		var envp = 0;
		for (var string of getEnvStrings()) {
			var ptr = environ_buf + bufSize;
			(growMemViews(), HEAPU32)[(__environ + envp) >> 2] = ptr;
			bufSize += stringToUTF8(string, ptr, Infinity) + 1;
			envp += 4;
		}
		return 0;
	}

	function _environ_sizes_get(penviron_count, penviron_buf_size) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(32, 0, 1, penviron_count, penviron_buf_size);
		var strings = getEnvStrings();
		(growMemViews(), HEAPU32)[penviron_count >> 2] = strings.length;
		var bufSize = 0;
		for (var string of strings) {
			bufSize += lengthBytesUTF8(string) + 1;
		}
		(growMemViews(), HEAPU32)[penviron_buf_size >> 2] = bufSize;
		return 0;
	}

	function _fd_close(fd) {
		if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(33, 0, 1, fd);
		try {
			var stream = SYSCALLS.getStreamFromFD(fd);
			FS.close(stream);
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return e.errno;
		}
	}

	function _fd_fdstat_get(fd, pbuf) {
		if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(34, 0, 1, fd, pbuf);
		try {
			var rightsBase = 0;
			var rightsInheriting = 0;
			var flags = 0;
			{
				var stream = SYSCALLS.getStreamFromFD(fd);
				// All character devices are terminals (other things a Linux system would
				// assume is a character device, like the mouse, we have special APIs for).
				var type = stream.tty
					? 2
					: FS.isDir(stream.mode)
						? 3
						: FS.isLink(stream.mode)
							? 7
							: 4;
			}
			(growMemViews(), HEAP8)[pbuf] = type;
			(growMemViews(), HEAP16)[(pbuf + 2) >> 1] = flags;
			(growMemViews(), HEAP64)[(pbuf + 8) >> 3] = BigInt(rightsBase);
			(growMemViews(), HEAP64)[(pbuf + 16) >> 3] = BigInt(rightsInheriting);
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return e.errno;
		}
	}

	/** @param {number=} offset */ var doReadv = (
		stream,
		iov,
		iovcnt,
		offset,
	) => {
		var ret = 0;
		for (var i = 0; i < iovcnt; i++) {
			var ptr = (growMemViews(), HEAPU32)[iov >> 2];
			var len = (growMemViews(), HEAPU32)[(iov + 4) >> 2];
			iov += 8;
			var curr = FS.read(stream, (growMemViews(), HEAP8), ptr, len, offset);
			if (curr < 0) return -1;
			ret += curr;
			if (curr < len) break;
			// nothing more to read
			if (typeof offset != "undefined") {
				offset += curr;
			}
		}
		return ret;
	};

	function _fd_read(fd, iov, iovcnt, pnum) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(35, 0, 1, fd, iov, iovcnt, pnum);
		try {
			var stream = SYSCALLS.getStreamFromFD(fd);
			var num = doReadv(stream, iov, iovcnt);
			(growMemViews(), HEAPU32)[pnum >> 2] = num;
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return e.errno;
		}
	}

	function _fd_seek(fd, offset, whence, newOffset) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(36, 0, 1, fd, offset, whence, newOffset);
		offset = bigintToI53Checked(offset);
		try {
			if (isNaN(offset)) return 22;
			var stream = SYSCALLS.getStreamFromFD(fd);
			FS.llseek(stream, offset, whence);
			(growMemViews(), HEAP64)[newOffset >> 3] = BigInt(stream.position);
			if (stream.getdents && offset === 0 && whence === 0)
				stream.getdents = null;
			// reset readdir state
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return e.errno;
		}
	}

	var _fd_sync = function (fd) {
		if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(37, 0, 2, fd);
		try {
			var stream = SYSCALLS.getStreamFromFD(fd);
			var rtn = stream.stream_ops?.fsync?.(stream);
			return new Promise((resolve) => {
				var mount = stream.node.mount;
				if (mount?.type.syncfs) {
					mount.type.syncfs(mount, false, (err) => resolve(err ? 29 : 0));
				} else {
					resolve(rtn);
				}
			});
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return e.errno;
		}
	};

	/** @param {number=} offset */ var doWritev = (
		stream,
		iov,
		iovcnt,
		offset,
	) => {
		var ret = 0;
		for (var i = 0; i < iovcnt; i++) {
			var ptr = (growMemViews(), HEAPU32)[iov >> 2];
			var len = (growMemViews(), HEAPU32)[(iov + 4) >> 2];
			iov += 8;
			var curr = FS.write(stream, (growMemViews(), HEAP8), ptr, len, offset);
			if (curr < 0) return -1;
			ret += curr;
			if (curr < len) {
				// No more space to write.
				break;
			}
			if (typeof offset != "undefined") {
				offset += curr;
			}
		}
		return ret;
	};

	function _fd_write(fd, iov, iovcnt, pnum) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(38, 0, 1, fd, iov, iovcnt, pnum);
		try {
			var stream = SYSCALLS.getStreamFromFD(fd);
			var num = doWritev(stream, iov, iovcnt);
			(growMemViews(), HEAPU32)[pnum >> 2] = num;
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return e.errno;
		}
	}

	var stringToUTF8OnStack = (str) => {
		var size = lengthBytesUTF8(str) + 1;
		var ret = stackAlloc(size);
		stringToUTF8(str, ret, size);
		return ret;
	};

	var stringToNewUTF8 = (str) => {
		var size = lengthBytesUTF8(str) + 1;
		var ret = _malloc(size);
		if (ret) stringToUTF8(str, ret, size);
		return ret;
	};

	var getCFunc = (ident) => {
		var func = Module["_" + ident];
		// closure exported function
		assert(
			func,
			`Cannot call unknown function ${ident}, make sure it is exported`,
		);
		return func;
	};

	var writeArrayToMemory = (array, buffer) => {
		assert(
			array.length >= 0,
			"writeArrayToMemory array must have a length (should be an array or typed array)",
		);
		(growMemViews(), HEAP8).set(array, buffer);
	};

	/**
	 * @param {string|null=} returnType
	 * @param {Array=} argTypes
	 * @param {Array=} args
	 * @param {Object=} opts
	 */ var ccall = (ident, returnType, argTypes, args, opts) => {
		// For fast lookup of conversion functions
		var toC = {
			string: (str) => {
				var ret = 0;
				if (str !== null && str !== undefined && str !== 0) {
					// null string
					ret = stringToUTF8OnStack(str);
				}
				return ret;
			},
			array: (arr) => {
				var ret = stackAlloc(arr.length);
				writeArrayToMemory(arr, ret);
				return ret;
			},
		};
		function convertReturnValue(ret) {
			if (returnType === "string") {
				return UTF8ToString(ret);
			}
			if (returnType === "boolean") return Boolean(ret);
			return ret;
		}
		var func = getCFunc(ident);
		var cArgs = [];
		var stack = 0;
		assert(returnType !== "array", 'return type should not be "array"');
		if (args) {
			for (var i = 0; i < args.length; i++) {
				var converter = toC[argTypes[i]];
				if (converter) {
					if (stack === 0) stack = stackSave();
					cArgs[i] = converter(args[i]);
				} else {
					cArgs[i] = args[i];
				}
			}
		}
		var ret = func(...cArgs);
		function onDone(ret) {
			if (stack !== 0) stackRestore(stack);
			return convertReturnValue(ret);
		}
		ret = onDone(ret);
		return ret;
	};

	var FS_createPath = (...args) => FS.createPath(...args);

	var FS_unlink = (...args) => FS.unlink(...args);

	var FS_createLazyFile = (...args) => FS.createLazyFile(...args);

	var FS_createDevice = (...args) => FS.createDevice(...args);

	PThread.init();

	FS.createPreloadedFile = FS_createPreloadedFile;

	FS.preloadFile = FS_preloadFile;

	FS.staticInit();

	// End JS library code
	// include: postlibrary.js
	// This file is included after the automatically-generated JS library code
	// but before the wasm module is created.
	{
		// With WASM_ESM_INTEGRATION this has to happen at the top level and not
		// delayed until processModuleArgs.
		initMemory();
		// Begin ATMODULES hooks
		if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
		if (Module["preloadPlugins"]) preloadPlugins = Module["preloadPlugins"];
		if (Module["print"]) out = Module["print"];
		if (Module["printErr"]) err = Module["printErr"];
		if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
		// End ATMODULES hooks
		checkIncomingModuleAPI();
		if (Module["arguments"]) programArgs = Module["arguments"];
		if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
		// Assertions on removed incoming Module JS APIs.
		assert(
			typeof Module["memoryInitializerPrefixURL"] == "undefined",
			"Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead",
		);
		assert(
			typeof Module["pthreadMainPrefixURL"] == "undefined",
			"Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead",
		);
		assert(
			typeof Module["cdInitializerPrefixURL"] == "undefined",
			"Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead",
		);
		assert(
			typeof Module["filePackagePrefixURL"] == "undefined",
			"Module.filePackagePrefixURL option was removed, use Module.locateFile instead",
		);
		assert(
			typeof Module["read"] == "undefined",
			"Module.read option was removed",
		);
		assert(
			typeof Module["readAsync"] == "undefined",
			"Module.readAsync option was removed (modify readAsync in JS)",
		);
		assert(
			typeof Module["readBinary"] == "undefined",
			"Module.readBinary option was removed (modify readBinary in JS)",
		);
		assert(
			typeof Module["setWindowTitle"] == "undefined",
			"Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)",
		);
		assert(
			typeof Module["TOTAL_MEMORY"] == "undefined",
			"Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY",
		);
		assert(
			typeof Module["ENVIRONMENT"] == "undefined",
			"Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)",
		);
		assert(
			typeof Module["STACK_SIZE"] == "undefined",
			"STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time",
		);
		if (Module["preInit"]) {
			if (typeof Module["preInit"] == "function")
				Module["preInit"] = [Module["preInit"]];
			while (Module["preInit"].length > 0) {
				Module["preInit"].shift()();
			}
		}
		consumedModuleProp("preInit");
	}

	// Begin runtime exports
	Module["callMain"] = callMain;

	Module["ENV"] = ENV;

	Module["wasmMemory"] = wasmMemory;

	Module["addRunDependency"] = addRunDependency;

	Module["removeRunDependency"] = removeRunDependency;

	Module["ccall"] = ccall;

	Module["UTF8ToString"] = UTF8ToString;

	Module["stringToNewUTF8"] = stringToNewUTF8;

	Module["FS_preloadFile"] = FS_preloadFile;

	Module["FS_unlink"] = FS_unlink;

	Module["FS_createPath"] = FS_createPath;

	Module["FS_createDevice"] = FS_createDevice;

	Module["FS"] = FS;

	Module["FS_createDataFile"] = FS_createDataFile;

	Module["FS_createLazyFile"] = FS_createLazyFile;

	var missingLibrarySymbols = [
		"writeI53ToI64",
		"writeI53ToI64Clamped",
		"writeI53ToI64Signaling",
		"writeI53ToU64Clamped",
		"writeI53ToU64Signaling",
		"readI53FromI64",
		"readI53FromU64",
		"convertI32PairToI53",
		"convertI32PairToI53Checked",
		"convertU32PairToI53",
		"getTempRet0",
		"setTempRet0",
		"createNamedFunction",
		"withStackSave",
		"readEmAsmArgs",
		"jstoi_q",
		"autoResumeAudioContext",
		"getDynCaller",
		"dynCall",
		"runtimeKeepalivePop",
		"asmjsMangle",
		"HandleAllocator",
		"addOnInit",
		"addOnPostCtor",
		"addOnPreMain",
		"addOnExit",
		"STACK_SIZE",
		"STACK_ALIGN",
		"POINTER_SIZE",
		"ASSERTIONS",
		"cwrap",
		"convertJsFunctionToWasm",
		"getEmptyTableSlot",
		"updateTableMap",
		"getFunctionAddress",
		"addFunction",
		"removeFunction",
		"intArrayToString",
		"AsciiToString",
		"stringToAscii",
		"UTF16ToString",
		"stringToUTF16",
		"lengthBytesUTF16",
		"UTF32ToString",
		"stringToUTF32",
		"lengthBytesUTF32",
		"registerKeyEventCallback",
		"maybeCStringToJsString",
		"findEventTarget",
		"getBoundingClientRect",
		"fillMouseEventData",
		"registerMouseEventCallback",
		"registerWheelEventCallback",
		"registerUiEventCallback",
		"registerFocusEventCallback",
		"fillDeviceOrientationEventData",
		"registerDeviceOrientationEventCallback",
		"fillDeviceMotionEventData",
		"registerDeviceMotionEventCallback",
		"screenOrientation",
		"fillOrientationChangeEventData",
		"registerOrientationChangeEventCallback",
		"fillFullscreenChangeEventData",
		"registerFullscreenChangeEventCallback",
		"JSEvents_requestFullscreen",
		"JSEvents_resizeCanvasForFullscreen",
		"registerRestoreOldStyle",
		"hideEverythingExceptGivenElement",
		"restoreHiddenElements",
		"setLetterbox",
		"softFullscreenResizeWebGLRenderTarget",
		"doRequestFullscreen",
		"fillPointerlockChangeEventData",
		"registerPointerlockChangeEventCallback",
		"registerPointerlockErrorEventCallback",
		"requestPointerLock",
		"fillVisibilityChangeEventData",
		"registerVisibilityChangeEventCallback",
		"registerTouchEventCallback",
		"fillGamepadEventData",
		"registerGamepadEventCallback",
		"registerBeforeUnloadEventCallback",
		"fillBatteryEventData",
		"registerBatteryEventCallback",
		"setCanvasElementSizeCallingThread",
		"setCanvasElementSizeMainThread",
		"setCanvasElementSize",
		"getCanvasSizeCallingThread",
		"getCanvasSizeMainThread",
		"getCanvasElementSize",
		"jsStackTrace",
		"getCallstack",
		"convertPCtoSourceLocation",
		"wasiRightsToMuslOFlags",
		"wasiOFlagsToMuslOFlags",
		"safeSetTimeout",
		"setImmediateWrapped",
		"safeRequestAnimationFrame",
		"clearImmediateWrapped",
		"registerPostMainLoop",
		"registerPreMainLoop",
		"getPromise",
		"makePromise",
		"addPromise",
		"idsToPromises",
		"makePromiseCallback",
		"ExceptionInfo",
		"findMatchingCatch",
		"incrementUncaughtExceptionCount",
		"decrementUncaughtExceptionCount",
		"Browser_asyncPrepareDataCounter",
		"arraySum",
		"addDays",
		"FS_mkdirTree",
		"_setNetworkCallback",
		"heapObjectForWebGLType",
		"toTypedArrayIndex",
		"webgl_enable_ANGLE_instanced_arrays",
		"webgl_enable_OES_vertex_array_object",
		"webgl_enable_WEBGL_draw_buffers",
		"webgl_enable_WEBGL_multi_draw",
		"webgl_enable_EXT_polygon_offset_clamp",
		"webgl_enable_EXT_clip_control",
		"webgl_enable_WEBGL_polygon_mode",
		"emscriptenWebGLGet",
		"computeUnpackAlignedImageSize",
		"colorChannelsInGlTextureFormat",
		"emscriptenWebGLGetTexPixelData",
		"emscriptenWebGLGetUniform",
		"webglGetProgramUniformLocation",
		"webglGetUniformLocation",
		"webglPrepareUniformLocationsBeforeFirstUse",
		"webglGetLeftBracePos",
		"emscriptenWebGLGetVertexAttrib",
		"__glGetActiveAttribOrUniform",
		"writeGLArray",
		"emscripten_webgl_destroy_context_before_on_calling_thread",
		"registerWebGlEventCallback",
		"runAndAbortIfError",
		"ALLOC_NORMAL",
		"ALLOC_STACK",
		"allocate",
		"writeStringToMemory",
		"writeAsciiToMemory",
		"allocateUTF8",
		"allocateUTF8OnStack",
		"demangle",
		"stackTrace",
		"getNativeTypeSize",
	];

	missingLibrarySymbols.forEach(missingLibrarySymbol);

	var unexportedSymbols = [
		"run",
		"out",
		"err",
		"abort",
		"wasmExports",
		"writeStackCookie",
		"checkStackCookie",
		"INT53_MAX",
		"INT53_MIN",
		"bigintToI53Checked",
		"HEAP8",
		"HEAP16",
		"HEAPU16",
		"HEAPF32",
		"HEAPF64",
		"HEAP64",
		"HEAPU64",
		"stackSave",
		"stackRestore",
		"stackAlloc",
		"ptrToString",
		"zeroMemory",
		"exitJS",
		"getHeapMax",
		"growMemory",
		"ERRNO_CODES",
		"strError",
		"inetPton4",
		"inetNtop4",
		"inetPton6",
		"inetNtop6",
		"readSockaddr",
		"writeSockaddr",
		"DNS",
		"Protocols",
		"Sockets",
		"timers",
		"warnOnce",
		"readEmAsmArgsArray",
		"getExecutableName",
		"handleException",
		"keepRuntimeAlive",
		"runtimeKeepalivePush",
		"callUserCallback",
		"maybeExit",
		"asyncLoad",
		"alignMemory",
		"mmapAlloc",
		"wasmTable",
		"getUniqueRunDependency",
		"noExitRuntime",
		"addOnPreRun",
		"addOnPostRun",
		"freeTableIndexes",
		"functionsInTableMap",
		"setValue",
		"getValue",
		"PATH",
		"PATH_FS",
		"UTF8Decoder",
		"UTF8ArrayToString",
		"stringToUTF8Array",
		"stringToUTF8",
		"lengthBytesUTF8",
		"intArrayFromString",
		"UTF16Decoder",
		"stringToUTF8OnStack",
		"writeArrayToMemory",
		"JSEvents",
		"specialHTMLTargets",
		"findCanvasEventTarget",
		"currentFullscreenStrategy",
		"restoreOldWindowedStyle",
		"UNWIND_CACHE",
		"ExitStatus",
		"getEnvStrings",
		"checkWasiClock",
		"doReadv",
		"doWritev",
		"initRandomFill",
		"randomFill",
		"emSetImmediate",
		"emClearImmediate_deps",
		"emClearImmediate",
		"promiseMap",
		"uncaughtExceptionCount",
		"exceptionCaught",
		"Browser",
		"requestFullscreen",
		"requestFullScreen",
		"setCanvasSize",
		"getUserMedia",
		"createContext",
		"getPreloadedImageData__data",
		"wget",
		"MONTH_DAYS_REGULAR",
		"MONTH_DAYS_LEAP",
		"MONTH_DAYS_REGULAR_CUMULATIVE",
		"MONTH_DAYS_LEAP_CUMULATIVE",
		"isLeapYear",
		"ydayFromDate",
		"SYSCALLS",
		"getSocketFromFD",
		"getSocketAddress",
		"preloadPlugins",
		"FS_createPreloadedFile",
		"FS_modeStringToFlags",
		"FS_getMode",
		"FS_fileDataToTypedArray",
		"FS_stdin_getChar_buffer",
		"FS_stdin_getChar",
		"FS_readFile",
		"FS_root",
		"FS_mounts",
		"FS_devices",
		"FS_streams",
		"FS_nextInode",
		"FS_nameTable",
		"FS_currentPath",
		"FS_initialized",
		"FS_ignorePermissions",
		"FS_filesystems",
		"FS_syncFSRequests",
		"FS_lookupPath",
		"FS_getPath",
		"FS_hashName",
		"FS_hashAddNode",
		"FS_hashRemoveNode",
		"FS_lookupNode",
		"FS_createNode",
		"FS_destroyNode",
		"FS_isRoot",
		"FS_isMountpoint",
		"FS_isFile",
		"FS_isDir",
		"FS_isLink",
		"FS_isChrdev",
		"FS_isBlkdev",
		"FS_isFIFO",
		"FS_isSocket",
		"FS_flagsToPermissionString",
		"FS_nodePermissions",
		"FS_mayLookup",
		"FS_mayCreate",
		"FS_mayDelete",
		"FS_mayOpen",
		"FS_checkOpExists",
		"FS_nextfd",
		"FS_getStreamChecked",
		"FS_getStream",
		"FS_createStream",
		"FS_closeStream",
		"FS_dupStream",
		"FS_doSetAttr",
		"FS_chrdev_stream_ops",
		"FS_major",
		"FS_minor",
		"FS_makedev",
		"FS_registerDevice",
		"FS_getDevice",
		"FS_getMounts",
		"FS_syncfs",
		"FS_mount",
		"FS_unmount",
		"FS_lookup",
		"FS_mknod",
		"FS_statfs",
		"FS_statfsStream",
		"FS_statfsNode",
		"FS_create",
		"FS_mkdir",
		"FS_mkdev",
		"FS_symlink",
		"FS_rename",
		"FS_rmdir",
		"FS_readdir",
		"FS_readlink",
		"FS_stat",
		"FS_fstat",
		"FS_lstat",
		"FS_doChmod",
		"FS_chmod",
		"FS_lchmod",
		"FS_fchmod",
		"FS_doChown",
		"FS_chown",
		"FS_lchown",
		"FS_fchown",
		"FS_doTruncate",
		"FS_truncate",
		"FS_ftruncate",
		"FS_utime",
		"FS_open",
		"FS_close",
		"FS_isClosed",
		"FS_llseek",
		"FS_read",
		"FS_write",
		"FS_mmap",
		"FS_msync",
		"FS_ioctl",
		"FS_writeFile",
		"FS_cwd",
		"FS_chdir",
		"FS_createDefaultDirectories",
		"FS_createDefaultDevices",
		"FS_createSpecialDirectories",
		"FS_createStandardStreams",
		"FS_staticInit",
		"FS_init",
		"FS_quit",
		"FS_findObject",
		"FS_analyzePath",
		"FS_createFile",
		"FS_forceLoadFile",
		"MEMFS",
		"TTY",
		"PIPEFS",
		"SOCKFS",
		"tempFixedLengthArray",
		"miniTempWebGLFloatBuffers",
		"miniTempWebGLIntBuffers",
		"GL",
		"AL",
		"GLUT",
		"EGL",
		"GLEW",
		"IDBStore",
		"SDL",
		"SDL_gfx",
		"waitAsyncPolyfilled",
		"print",
		"printErr",
		"jstoi_s",
		"PThread",
		"terminateWorker",
		"cleanupThread",
		"registerTLSInit",
		"spawnThread",
		"exitOnMainThread",
		"proxyToMainThread",
		"proxiedJSCallArgs",
		"invokeEntryPoint",
		"checkMailbox",
	];

	unexportedSymbols.forEach(unexportedRuntimeSymbol);

	// End runtime exports
	// Begin JS library exports
	// End JS library exports
	// end include: postlibrary.js
	// proxiedFunctionTable specifies the list of functions that can be called
	// either synchronously or asynchronously from other threads in postMessage()d
	// or internally queued events. This way a pthread in a Worker can synchronously
	// access e.g. the DOM on the main thread.
	var proxiedFunctionTable = [
		_proc_exit,
		exitOnMainThread,
		___syscall_chmod,
		___syscall_dup3,
		___syscall_faccessat,
		___syscall_fchmod,
		___syscall_fchown32,
		___syscall_fcntl64,
		___syscall_fstat64,
		___syscall_getdents64,
		___syscall_getsockopt,
		___syscall_ioctl,
		___syscall_lstat64,
		___syscall_mkdirat,
		___syscall_newfstatat,
		___syscall_openat,
		___syscall_pipe2,
		___syscall_poll,
		___syscall_poll_nonblocking,
		___syscall_readlinkat,
		___syscall_recvfrom,
		___syscall_renameat,
		___syscall_rmdir,
		___syscall_sendto,
		___syscall_socket,
		___syscall_stat64,
		___syscall_umask,
		___syscall_unlinkat,
		__mmap_js,
		__munmap_js,
		__setitimer_js,
		_environ_get,
		_environ_sizes_get,
		_fd_close,
		_fd_fdstat_get,
		_fd_read,
		_fd_seek,
		_fd_sync,
		_fd_write,
	];

	function checkIncomingModuleAPI() {
		ignoredModuleProp("fetchSettings");
		ignoredModuleProp("logReadFiles");
		ignoredModuleProp("loadSplitModule");
		ignoredModuleProp("onMalloc");
		ignoredModuleProp("onRealloc");
		ignoredModuleProp("onFree");
		ignoredModuleProp("onSbrkGrow");
		ignoredModuleProp("onCOSCacheHit");
		ignoredModuleProp("onCOSCacheMiss");
		ignoredModuleProp("onCOSStore");
	}

	function gexjs_socket() {
		return Module.gexos.socket();
	}

	function gexjs_bind(fd, path, len) {
		return Module.gexos.bind(fd, path, len);
	}

	function gexjs_connect(fd, path, len) {
		return Module.gexos.connect(fd, path, len);
	}

	function gexjs_accept(fd) {
		return Module.gexos.accept(fd);
	}

	function gexjs_close(fd) {
		return Module.gexos.close(fd);
	}

	function gexjs_readable(fd) {
		return Module.gexos.readable(fd);
	}

	function gexjs_writable(fd) {
		return Module.gexos.writable(fd);
	}

	function gexjs_send(fd, buf, len, fds, nfds) {
		return Module.gexos.send(fd, buf, len, fds, nfds);
	}

	function gexjs_recv(fd, buf, len, fds, maxfds, nfds) {
		return Module.gexos.recv(fd, buf, len, fds, maxfds, nfds);
	}

	function gexjs_tick() {
		Module.gexos.tick();
	}

	function gexjs_wait(ms) {
		return Module.gexos.wait(ms);
	}

	function gexjs_shm(addr, size) {
		return Module.gexos.shm(addr, size);
	}

	function gexjs_shm_addr(fd) {
		return Module.gexos.shmAddr(fd);
	}

	function gexjs_shm_unmap(addr) {
		return Module.gexos.shmUnmap(addr);
	}

	// Imports from the Wasm binary.
	var _strerror = makeInvalidEarlyAccess("_strerror");

	var _free = (Module["_free"] = makeInvalidEarlyAccess("_free"));

	var _malloc = (Module["_malloc"] = makeInvalidEarlyAccess("_malloc"));

	var _fflush = makeInvalidEarlyAccess("_fflush");

	var _main = (Module["_main"] = makeInvalidEarlyAccess("_main"));

	var _getenv = (Module["_getenv"] = makeInvalidEarlyAccess("_getenv"));

	var _htons = makeInvalidEarlyAccess("_htons");

	var __emscripten_tls_init = makeInvalidEarlyAccess("__emscripten_tls_init");

	var _pthread_self = makeInvalidEarlyAccess("_pthread_self");

	var _emscripten_builtin_memalign = makeInvalidEarlyAccess(
		"_emscripten_builtin_memalign",
	);

	var __emscripten_thread_init = makeInvalidEarlyAccess(
		"__emscripten_thread_init",
	);

	var ___set_thread_state = makeInvalidEarlyAccess("___set_thread_state");

	var __emscripten_thread_crashed = makeInvalidEarlyAccess(
		"__emscripten_thread_crashed",
	);

	var _emscripten_stack_get_end = makeInvalidEarlyAccess(
		"_emscripten_stack_get_end",
	);

	var _emscripten_stack_get_base = makeInvalidEarlyAccess(
		"_emscripten_stack_get_base",
	);

	var _ntohs = makeInvalidEarlyAccess("_ntohs");

	var __emscripten_run_js_on_main_thread_done = makeInvalidEarlyAccess(
		"__emscripten_run_js_on_main_thread_done",
	);

	var __emscripten_run_js_on_main_thread = makeInvalidEarlyAccess(
		"__emscripten_run_js_on_main_thread",
	);

	var __emscripten_thread_free_data = makeInvalidEarlyAccess(
		"__emscripten_thread_free_data",
	);

	var __emscripten_thread_exit = makeInvalidEarlyAccess(
		"__emscripten_thread_exit",
	);

	var _setenv = (Module["_setenv"] = makeInvalidEarlyAccess("_setenv"));

	var __emscripten_timeout = makeInvalidEarlyAccess("__emscripten_timeout");

	var __emscripten_check_mailbox = makeInvalidEarlyAccess(
		"__emscripten_check_mailbox",
	);

	var _emscripten_stack_init = makeInvalidEarlyAccess("_emscripten_stack_init");

	var _emscripten_stack_set_limits = makeInvalidEarlyAccess(
		"_emscripten_stack_set_limits",
	);

	var _emscripten_stack_get_free = makeInvalidEarlyAccess(
		"_emscripten_stack_get_free",
	);

	var __emscripten_stack_restore = makeInvalidEarlyAccess(
		"__emscripten_stack_restore",
	);

	var __emscripten_stack_alloc = makeInvalidEarlyAccess(
		"__emscripten_stack_alloc",
	);

	var _emscripten_stack_get_current = makeInvalidEarlyAccess(
		"_emscripten_stack_get_current",
	);

	var __indirect_function_table = makeInvalidEarlyAccess(
		"__indirect_function_table",
	);

	var wasmTable = makeInvalidEarlyAccess("wasmTable");

	function assignWasmExports(wasmExports) {
		assert(
			typeof wasmExports["strerror"] != "undefined",
			"missing Wasm export: strerror",
		);
		assert(
			typeof wasmExports["free"] != "undefined",
			"missing Wasm export: free",
		);
		assert(
			typeof wasmExports["malloc"] != "undefined",
			"missing Wasm export: malloc",
		);
		assert(
			typeof wasmExports["fflush"] != "undefined",
			"missing Wasm export: fflush",
		);
		assert(
			typeof wasmExports["main"] != "undefined",
			"missing Wasm export: main",
		);
		assert(
			typeof wasmExports["getenv"] != "undefined",
			"missing Wasm export: getenv",
		);
		assert(
			typeof wasmExports["htons"] != "undefined",
			"missing Wasm export: htons",
		);
		assert(
			typeof wasmExports["_emscripten_tls_init"] != "undefined",
			"missing Wasm export: _emscripten_tls_init",
		);
		assert(
			typeof wasmExports["pthread_self"] != "undefined",
			"missing Wasm export: pthread_self",
		);
		assert(
			typeof wasmExports["emscripten_builtin_memalign"] != "undefined",
			"missing Wasm export: emscripten_builtin_memalign",
		);
		assert(
			typeof wasmExports["_emscripten_thread_init"] != "undefined",
			"missing Wasm export: _emscripten_thread_init",
		);
		assert(
			typeof wasmExports["__set_thread_state"] != "undefined",
			"missing Wasm export: __set_thread_state",
		);
		assert(
			typeof wasmExports["_emscripten_thread_crashed"] != "undefined",
			"missing Wasm export: _emscripten_thread_crashed",
		);
		assert(
			typeof wasmExports["emscripten_stack_get_end"] != "undefined",
			"missing Wasm export: emscripten_stack_get_end",
		);
		assert(
			typeof wasmExports["emscripten_stack_get_base"] != "undefined",
			"missing Wasm export: emscripten_stack_get_base",
		);
		assert(
			typeof wasmExports["ntohs"] != "undefined",
			"missing Wasm export: ntohs",
		);
		assert(
			typeof wasmExports["_emscripten_run_js_on_main_thread_done"] !=
				"undefined",
			"missing Wasm export: _emscripten_run_js_on_main_thread_done",
		);
		assert(
			typeof wasmExports["_emscripten_run_js_on_main_thread"] != "undefined",
			"missing Wasm export: _emscripten_run_js_on_main_thread",
		);
		assert(
			typeof wasmExports["_emscripten_thread_free_data"] != "undefined",
			"missing Wasm export: _emscripten_thread_free_data",
		);
		assert(
			typeof wasmExports["_emscripten_thread_exit"] != "undefined",
			"missing Wasm export: _emscripten_thread_exit",
		);
		assert(
			typeof wasmExports["setenv"] != "undefined",
			"missing Wasm export: setenv",
		);
		assert(
			typeof wasmExports["_emscripten_timeout"] != "undefined",
			"missing Wasm export: _emscripten_timeout",
		);
		assert(
			typeof wasmExports["_emscripten_check_mailbox"] != "undefined",
			"missing Wasm export: _emscripten_check_mailbox",
		);
		assert(
			typeof wasmExports["emscripten_stack_init"] != "undefined",
			"missing Wasm export: emscripten_stack_init",
		);
		assert(
			typeof wasmExports["emscripten_stack_set_limits"] != "undefined",
			"missing Wasm export: emscripten_stack_set_limits",
		);
		assert(
			typeof wasmExports["emscripten_stack_get_free"] != "undefined",
			"missing Wasm export: emscripten_stack_get_free",
		);
		assert(
			typeof wasmExports["_emscripten_stack_restore"] != "undefined",
			"missing Wasm export: _emscripten_stack_restore",
		);
		assert(
			typeof wasmExports["_emscripten_stack_alloc"] != "undefined",
			"missing Wasm export: _emscripten_stack_alloc",
		);
		assert(
			typeof wasmExports["emscripten_stack_get_current"] != "undefined",
			"missing Wasm export: emscripten_stack_get_current",
		);
		assert(
			typeof wasmExports["__indirect_function_table"] != "undefined",
			"missing Wasm export: __indirect_function_table",
		);
		_strerror = createExportWrapper("strerror", 1);
		_free = Module["_free"] = createExportWrapper("free", 1);
		_malloc = Module["_malloc"] = createExportWrapper("malloc", 1);
		_fflush = createExportWrapper("fflush", 1);
		_main = Module["_main"] = createExportWrapper("main", 3);
		_getenv = Module["_getenv"] = createExportWrapper("getenv", 1);
		_htons = createExportWrapper("htons", 1);
		__emscripten_tls_init = createExportWrapper("_emscripten_tls_init", 0);
		_pthread_self = wasmExports["pthread_self"];
		_emscripten_builtin_memalign = createExportWrapper(
			"emscripten_builtin_memalign",
			2,
		);
		__emscripten_thread_init = createExportWrapper(
			"_emscripten_thread_init",
			6,
		);
		___set_thread_state = createExportWrapper("__set_thread_state", 4);
		__emscripten_thread_crashed = createExportWrapper(
			"_emscripten_thread_crashed",
			0,
		);
		_emscripten_stack_get_end = wasmExports["emscripten_stack_get_end"];
		_emscripten_stack_get_base = wasmExports["emscripten_stack_get_base"];
		_ntohs = createExportWrapper("ntohs", 1);
		__emscripten_run_js_on_main_thread_done = createExportWrapper(
			"_emscripten_run_js_on_main_thread_done",
			3,
		);
		__emscripten_run_js_on_main_thread = createExportWrapper(
			"_emscripten_run_js_on_main_thread",
			5,
		);
		__emscripten_thread_free_data = createExportWrapper(
			"_emscripten_thread_free_data",
			1,
		);
		__emscripten_thread_exit = createExportWrapper(
			"_emscripten_thread_exit",
			1,
		);
		_setenv = Module["_setenv"] = createExportWrapper("setenv", 3);
		__emscripten_timeout = createExportWrapper("_emscripten_timeout", 2);
		__emscripten_check_mailbox = createExportWrapper(
			"_emscripten_check_mailbox",
			0,
		);
		_emscripten_stack_init = wasmExports["emscripten_stack_init"];
		_emscripten_stack_set_limits = wasmExports["emscripten_stack_set_limits"];
		_emscripten_stack_get_free = wasmExports["emscripten_stack_get_free"];
		__emscripten_stack_restore = wasmExports["_emscripten_stack_restore"];
		__emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"];
		_emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"];
		__indirect_function_table = wasmTable =
			wasmExports["__indirect_function_table"];
	}

	var wasmImports;

	function assignWasmImports() {
		wasmImports = {
			/** @export */ __assert_fail: ___assert_fail,
			/** @export */ __call_sighandler: ___call_sighandler,
			/** @export */ __syscall_chmod: ___syscall_chmod,
			/** @export */ __syscall_dup3: ___syscall_dup3,
			/** @export */ __syscall_faccessat: ___syscall_faccessat,
			/** @export */ __syscall_fchmod: ___syscall_fchmod,
			/** @export */ __syscall_fchown32: ___syscall_fchown32,
			/** @export */ __syscall_fcntl64: ___syscall_fcntl64,
			/** @export */ __syscall_fstat64: ___syscall_fstat64,
			/** @export */ __syscall_getdents64: ___syscall_getdents64,
			/** @export */ __syscall_getsockopt: ___syscall_getsockopt,
			/** @export */ __syscall_ioctl: ___syscall_ioctl,
			/** @export */ __syscall_lstat64: ___syscall_lstat64,
			/** @export */ __syscall_mkdirat: ___syscall_mkdirat,
			/** @export */ __syscall_newfstatat: ___syscall_newfstatat,
			/** @export */ __syscall_openat: ___syscall_openat,
			/** @export */ __syscall_pipe2: ___syscall_pipe2,
			/** @export */ __syscall_poll: ___syscall_poll,
			/** @export */ __syscall_poll_nonblocking: ___syscall_poll_nonblocking,
			/** @export */ __syscall_readlinkat: ___syscall_readlinkat,
			/** @export */ __syscall_recvfrom: ___syscall_recvfrom,
			/** @export */ __syscall_renameat: ___syscall_renameat,
			/** @export */ __syscall_rmdir: ___syscall_rmdir,
			/** @export */ __syscall_sendto: ___syscall_sendto,
			/** @export */ __syscall_socket: ___syscall_socket,
			/** @export */ __syscall_stat64: ___syscall_stat64,
			/** @export */ __syscall_umask: ___syscall_umask,
			/** @export */ __syscall_unlinkat: ___syscall_unlinkat,
			/** @export */ _abort_js: __abort_js,
			/** @export */ _emscripten_init_main_thread_js:
				__emscripten_init_main_thread_js,
			/** @export */ _emscripten_lookup_name: __emscripten_lookup_name,
			/** @export */ _emscripten_notify_mailbox_postmessage:
				__emscripten_notify_mailbox_postmessage,
			/** @export */ _emscripten_receive_on_main_thread_js:
				__emscripten_receive_on_main_thread_js,
			/** @export */ _emscripten_runtime_keepalive_clear:
				__emscripten_runtime_keepalive_clear,
			/** @export */ _emscripten_thread_cleanup: __emscripten_thread_cleanup,
			/** @export */ _emscripten_thread_mailbox_await:
				__emscripten_thread_mailbox_await,
			/** @export */ _emscripten_thread_set_strongref:
				__emscripten_thread_set_strongref,
			/** @export */ _localtime_js: __localtime_js,
			/** @export */ _mmap_js: __mmap_js,
			/** @export */ _munmap_js: __munmap_js,
			/** @export */ _setitimer_js: __setitimer_js,
			/** @export */ _tzset_js: __tzset_js,
			/** @export */ clock_res_get: _clock_res_get,
			/** @export */ clock_time_get: _clock_time_get,
			/** @export */ emscripten_check_blocking_allowed:
				_emscripten_check_blocking_allowed,
			/** @export */ emscripten_date_now: _emscripten_date_now,
			/** @export */ emscripten_err: _emscripten_err,
			/** @export */ emscripten_exit_with_live_runtime:
				_emscripten_exit_with_live_runtime,
			/** @export */ emscripten_get_heap_max: _emscripten_get_heap_max,
			/** @export */ emscripten_get_now: _emscripten_get_now,
			/** @export */ emscripten_num_logical_cores:
				_emscripten_num_logical_cores,
			/** @export */ emscripten_resize_heap: _emscripten_resize_heap,
			/** @export */ environ_get: _environ_get,
			/** @export */ environ_sizes_get: _environ_sizes_get,
			/** @export */ exit: _exit,
			/** @export */ fd_close: _fd_close,
			/** @export */ fd_fdstat_get: _fd_fdstat_get,
			/** @export */ fd_read: _fd_read,
			/** @export */ fd_seek: _fd_seek,
			/** @export */ fd_sync: _fd_sync,
			/** @export */ fd_write: _fd_write,
			/** @export */ gexjs_accept,
			/** @export */ gexjs_bind,
			/** @export */ gexjs_close,
			/** @export */ gexjs_connect,
			/** @export */ gexjs_readable,
			/** @export */ gexjs_recv,
			/** @export */ gexjs_send,
			/** @export */ gexjs_shm,
			/** @export */ gexjs_shm_addr,
			/** @export */ gexjs_shm_unmap,
			/** @export */ gexjs_socket,
			/** @export */ gexjs_tick,
			/** @export */ gexjs_wait,
			/** @export */ gexjs_writable,
			/** @export */ memory: wasmMemory,
			/** @export */ proc_exit: _proc_exit,
		};
	}

	// include: postamble.js
	// === Auto-generated postamble setup entry stuff ===
	var calledRun;

	function callMain(args = []) {
		assert(
			runDependencies == 0,
			'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])',
		);
		assert(
			typeof onPreRuns === "undefined" || onPreRuns.length == 0,
			"cannot call main when preRun functions remain to be called",
		);
		var entryFunction = _main;
		args.unshift(thisProgram);
		var argc = args.length;
		var argv = stackAlloc((argc + 1) * 4);
		var argv_ptr = argv;
		for (var arg of args) {
			(growMemViews(), HEAPU32)[argv_ptr >> 2] = stringToUTF8OnStack(arg);
			argv_ptr += 4;
		}
		(growMemViews(), HEAPU32)[argv_ptr >> 2] = 0;
		try {
			var ret = entryFunction(argc, argv);
			// if we're not running an evented main loop, it's time to exit
			exitJS(ret, /* implicit = */ true);
			return ret;
		} catch (e) {
			return handleException(e);
		}
	}

	function stackCheckInit() {
		// This is normally called automatically during __wasm_call_ctors but need to
		// get these values before even running any of the ctors so we call it redundantly
		// here.
		// See $establishStackSpace for the equivalent code that runs on a thread
		assert(!ENVIRONMENT_IS_PTHREAD);
		_emscripten_stack_init();
		// TODO(sbc): Move writeStackCookie to native to to avoid this.
		writeStackCookie();
	}

	async function run(args = programArgs) {
		assert(!calledRun);
		calledRun = true;
		if (ENVIRONMENT_IS_PTHREAD) {
			initRuntime();
			return;
		}
		stackCheckInit();
		preRun();
		if (runDependencies > 0) {
			await new Promise((resolve) => (dependenciesFulfilled = resolve));
		}
		var setStatus = Module["setStatus"];
		if (setStatus) {
			setStatus("Running...");
			// Yield to the event loop to allow the browser to paint "Running..."
			await new Promise((resolve) => setTimeout(resolve, 1));
			// Then we want to clear the status text, but only after the rest of this function runs.
			setTimeout(setStatus, 1, "");
		}
		if (ABORT) return;
		initRuntime();
		preMain();
		Module["onRuntimeInitialized"]?.();
		consumedModuleProp("onRuntimeInitialized");
		var noInitialRun = Module["noInitialRun"] || true;
		if (!noInitialRun) callMain(args);
		postRun();
		checkStackCookie();
	}

	function checkUnflushedContent() {
		// Compiler settings do not allow exiting the runtime, so flushing
		// the streams is not possible. but in ASSERTIONS mode we check
		// if there was something to flush, and if so tell the user they
		// should request that the runtime be exitable.
		// Normally we would not even include flush() at all, but in ASSERTIONS
		// builds we do so just for this check, and here we see if there is any
		// content to flush, that is, we check if there would have been
		// something a non-ASSERTIONS build would have not seen.
		// How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
		// mode (which has its own special function for this; otherwise, all
		// the code is inside libc)
		var oldOut = out;
		var oldErr = err;
		var has = false;
		out = err = (x) => {
			has = true;
		};
		try {
			// it doesn't matter if it fails
			_fflush(0);
			// also flush in the JS FS layer
			for (var name of ["stdout", "stderr"]) {
				var info = FS.analyzePath("/dev/" + name);
				if (!info) return;
				var stream = info.object;
				var rdev = stream.rdev;
				var tty = TTY.ttys[rdev];
				if (tty?.output?.length) {
					has = true;
				}
			}
		} catch (e) {}
		out = oldOut;
		err = oldErr;
		if (has) {
			warnOnce(
				"stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.",
			);
		}
	}

	var wasmExports;

	if (!ENVIRONMENT_IS_PTHREAD) {
		// Call createWasm on startup if we are the main thread.
		// Worker threads call this once they receive the module via postMessage
		// In modularize mode the generated code is within a factory function so we
		// can use await here (since it's not top-level-await).
		wasmExports = await createWasm();
		await run();
	}

	// end include: postamble.js
	// include: postamble_modularize.js
	// In MODULARIZE mode we wrap the generated code in a factory function
	// and return either the Module itself, or a promise of the module.
	// Assertion for attempting to access module properties on the incoming
	// moduleArg.  In the past we used this object as the prototype of the module
	// and assigned properties to it, but now we return a distinct object.  This
	// keeps the instance private until it is ready (i.e the promise has been
	// resolved).
	for (const prop of Object.keys(Module)) {
		if (!(prop in moduleArg)) {
			Object.defineProperty(moduleArg, prop, {
				configurable: true,
				get() {
					abort(
						`Access to module property ('${prop}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`,
					);
				},
			});
		}
	}

	return Module;
}

// Export using a UMD style export, or ES6 exports if selected
export default Module;

// Create code for detecting if we are running in a pthread.
// Normally this detection is done when the module is itself run but
// when running in MODULARIZE mode we need use this to know if we should
// run the module constructor on startup (true only for pthreads).
var isPthread = globalThis.name?.startsWith("em-pthread");
// In order to support both web and node we also need to detect node here.
var isNode =
	globalThis.process?.versions?.node && globalThis.process?.type != "renderer";
if (isNode)
	isPthread = (await import("node:worker_threads")).workerData === "em-pthread";

isPthread && Module();
