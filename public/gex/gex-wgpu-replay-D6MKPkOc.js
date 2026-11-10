async function createGexWgpuReplay(moduleArg = {}) {
	var Module = moduleArg;
	var ENVIRONMENT_IS_WEB = !!globalThis.window;
	var ENVIRONMENT_IS_WORKER = !!globalThis.WorkerGlobalScope;
	var ENVIRONMENT_IS_NODE =
		globalThis.process?.versions?.node &&
		globalThis.process?.type != "renderer";
	var ENVIRONMENT_IS_PTHREAD =
		ENVIRONMENT_IS_WORKER && globalThis.name == "em-pthread";
	var gexMesaColdSplit = "GEX_MESA_COLD_YES";
	var gexMesaCold = function () {
		return globalThis.__gexMesaCold || (globalThis.__gexMesaCold = {});
	};
	var gexMesaColdFile = function () {
		return wasmBinaryFile.slice(0, -5) + ".deferred.wasm";
	};
	var gexMesaColdInstance = null;
	var gexMesaColdLoad = function () {
		if (gexMesaColdInstance) return;
		var t0 = performance.now();
		var file = gexMesaColdFile();
		var cache = gexMesaCold();
		var module = cache[file];
		var how = "prefetched";
		if (!(module instanceof WebAssembly.Module)) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", file, false);
			xhr.overrideMimeType("text/plain; charset=x-user-defined");
			xhr.send(null);
			if (xhr.status !== 200 && xhr.status !== 0) {
				throw new Error("Mesa's cold part " + file + ": HTTP " + xhr.status);
			}
			var text = xhr.responseText;
			var buf = new Uint8Array(text.length);
			for (var i = 0; i < text.length; i++) buf[i] = text.charCodeAt(i) & 255;
			module = cache[file] = new WebAssembly.Module(buf);
			how = "fetched and compiled now, " + buf.length + " bytes";
		}
		gexMesaColdInstance = new WebAssembly.Instance(module, {
			primary: wasmRawExports,
		});
		var where = String(new Error().stack)
			.split("\n")
			.filter(function (l) {
				return l.indexOf(".wasm") >= 0 && l.indexOf("gexcoldtramp") < 0;
			})
			.slice(0, 4)
			.map(function (l) {
				return l
					.trim()
					.replace(/^at /, "")
					.replace(/ \(.*$/, "");
			});
		console.warn(
			"[gex-wgpu] cold part loaded on a miss (" +
				how +
				") in " +
				(performance.now() - t0).toFixed(1) +
				" ms, from " +
				(where.join(" <- ") || "?"),
		);
	};
	if (gexMesaColdSplit === "GEX_MESA_COLD_YES" && !Module["instantiateWasm"]) {
		Module["instantiateWasm"] = function (imports, done) {
			var cold = { load: gexMesaColdLoad };
			var all = new Proxy(imports, {
				get: function (target, ns) {
					return ns === "gexcold" ? cold : target[ns];
				},
			});
			if (
				typeof ENVIRONMENT_IS_PTHREAD !== "undefined" &&
				ENVIRONMENT_IS_PTHREAD
			) {
				wasmBinaryFile ??= findWasmBinary();
				done(new WebAssembly.Instance(wasmModule, all), wasmModule);
				return {};
			}
			wasmBinaryFile ??= findWasmBinary();
			var file = wasmBinaryFile;
			var slow = function () {
				return fetch(file, { credentials: "same-origin" })
					.then(function (r) {
						return r.arrayBuffer();
					})
					.then(function (bytes) {
						return WebAssembly.instantiate(bytes, all);
					});
			};
			var eager =
				typeof ENVIRONMENT_IS_WEB !== "undefined" &&
				ENVIRONMENT_IS_WEB &&
				!Module["gexColdLazy"];
			WebAssembly.instantiateStreaming(
				fetch(file, { credentials: "same-origin" }),
				all,
			)
				.catch(slow)
				.then(function (r) {
					if (!eager) return r;
					var t0 = performance.now();
					var cold = gexMesaColdFile();
					var imp = { primary: r.instance.exports };
					return WebAssembly.instantiateStreaming(
						fetch(cold, { credentials: "same-origin" }),
						imp,
					)
						.catch(function () {
							return fetch(cold, { credentials: "same-origin" })
								.then(function (x) {
									return x.arrayBuffer();
								})
								.then(function (bytes) {
									return WebAssembly.instantiate(bytes, imp);
								});
						})
						.then(function (c) {
							gexMesaColdInstance = c.instance;
							console.warn(
								"[gex-wgpu] cold part loaded with the module (a page's main thread) in " +
									(performance.now() - t0).toFixed(1) +
									" ms",
							);
							return r;
						});
				})
				.then(
					function (r) {
						done(r.instance, r.module);
					},
					function (e) {
						abort("instantiating Mesa failed: " + e);
					},
				);
			return {};
		};
	}
	if (
		gexMesaColdSplit === "GEX_MESA_COLD_YES" &&
		!Module["gexNoColdPrefetch"] &&
		!(typeof ENVIRONMENT_IS_PTHREAD !== "undefined" && ENVIRONMENT_IS_PTHREAD)
	) {
		var gexColdPoll = setInterval(function () {
			if (
				typeof _gex_gl_presented !== "function" ||
				typeof wasmBinaryFile !== "string"
			)
				return;
			var presented = 0;
			try {
				presented = _gex_gl_presented();
			} catch (e) {
				return;
			}
			if (!presented) return;
			clearInterval(gexColdPoll);
			if (gexMesaColdInstance) return;
			var file = gexMesaColdFile();
			var cache = gexMesaCold();
			if (cache[file]) return;
			cache[file] = "pending";
			var t0 = performance.now(),
				size = 0;
			fetch(file)
				.then(function (r) {
					if (!r.ok) throw new Error("HTTP " + r.status);
					return r.arrayBuffer();
				})
				.then(function (bytes) {
					size = bytes.byteLength;
					return WebAssembly.compile(bytes);
				})
				.then(
					function (module) {
						if (!(cache[file] instanceof WebAssembly.Module))
							cache[file] = module;
						console.warn(
							"[gex-wgpu] cold part prefetched (" +
								size +
								" bytes) in " +
								(performance.now() - t0).toFixed(1) +
								" ms",
						);
					},
					function (e) {
						if (cache[file] === "pending") delete cache[file];
						console.warn("[gex-wgpu] cold part prefetch failed: " + e);
					},
				);
		}, 1e3);
	}
	var programArgs = [];
	var thisProgram = "./this.program";
	var quit_ = (status, toThrow) => {
		throw toThrow;
	};
	var _scriptName = import.meta.url;
	var scriptDirectory = "";
	function locateFile(path) {
		if (Module["locateFile"]) {
			return Module["locateFile"](path, scriptDirectory);
		}
		return scriptDirectory + path;
	}
	var readAsync, readBinary;
	if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
		try {
			scriptDirectory = new URL(".", _scriptName).href;
		} catch {}
		{
			if (ENVIRONMENT_IS_WORKER) {
				readBinary = (url) => {
					var xhr = new XMLHttpRequest();
					xhr.open("GET", url, false);
					xhr.responseType = "arraybuffer";
					xhr.send(null);
					return new Uint8Array(xhr.response);
				};
			}
			readAsync = async (url) => {
				var response = await fetch(url, { credentials: "same-origin" });
				if (response.ok) {
					return response.arrayBuffer();
				}
				throw new Error(response.status + " : " + response.url);
			};
		}
	} else {
	}
	var out = console.log.bind(console);
	var err = console.error.bind(console);
	var wasmBinary;
	var wasmModule;
	var ABORT = false;
	var EXITSTATUS;
	function assert(condition, text) {
		if (!condition) {
			abort(text);
		}
	}
	class EmscriptenEH {}
	class EmscriptenSjLj extends EmscriptenEH {}
	function growMemViews() {
		if (wasmMemory.buffer != HEAP8.buffer) {
			updateMemoryViews();
		}
	}
	var startWorker;
	if (ENVIRONMENT_IS_PTHREAD) {
		var initializedJS = false;
		self.onunhandledrejection = (e) => {
			throw e.reason || e;
		};
		function handleMessage(e) {
			try {
				var msgData = e.data;
				var cmd = msgData.cmd;
				if (cmd == 1) {
					let messageQueue = [];
					self.onmessage = (e) => messageQueue.push(e);
					startWorker = () => {
						postMessage({ cmd: 3 });
						for (let msg of messageQueue) {
							handleMessage(msg);
						}
						self.onmessage = handleMessage;
					};
					for (const handler of msgData.handlers) {
						if (!Module[handler] || Module[handler].proxy) {
							Module[handler] = (...args) => {
								postMessage({ cmd: 9, handler, args });
							};
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
					establishStackSpace(msgData.pthread_ptr);
					__emscripten_thread_init(msgData.pthread_ptr, 0, 0, 1, 0, 0);
					PThread.threadInitTLS();
					__emscripten_thread_mailbox_await(msgData.pthread_ptr);
					if (!initializedJS) {
						initializedJS = true;
					}
					try {
						invokeEntryPoint(msgData.start_routine, msgData.arg);
					} catch (ex) {
						if (ex != "unwind") {
							throw ex;
						}
					}
				} else if (cmd == 4) {
					if (initializedJS) {
						checkMailbox();
					}
				} else if (cmd) {
					err(`worker: received unknown command ${cmd}`);
					err(msgData);
				}
			} catch (ex) {
				if (runtimeInitialized) __emscripten_thread_crashed();
				throw ex;
			}
		}
		self.onmessage = handleMessage;
	}
	var runtimeInitialized = false;
	function updateMemoryViews() {
		var b = wasmMemory.buffer;
		HEAP8 = new Int8Array(b);
		HEAP16 = new Int16Array(b);
		Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
		HEAPU16 = new Uint16Array(b);
		HEAP32 = new Int32Array(b);
		HEAPU32 = new Uint32Array(b);
		HEAPF32 = new Float32Array(b);
		HEAPF64 = new Float64Array(b);
		HEAP64 = new BigInt64Array(b);
		HEAPU64 = new BigUint64Array(b);
	}
	function initMemory() {
		if (ENVIRONMENT_IS_PTHREAD) {
			return;
		}
		if (Module["wasmMemory"]) {
			wasmMemory = Module["wasmMemory"];
		} else {
			var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 67108864;
			wasmMemory = new WebAssembly.Memory({
				initial: INITIAL_MEMORY / 65536,
				maximum: 32768,
				shared: true,
			});
		}
		updateMemoryViews();
	}
	function preRun() {
		if (Module["preRun"]) {
			if (typeof Module["preRun"] == "function")
				Module["preRun"] = [Module["preRun"]];
			while (Module["preRun"].length) {
				addOnPreRun(Module["preRun"].shift());
			}
		}
		callRuntimeCallbacks(onPreRuns);
	}
	function initRuntime() {
		runtimeInitialized = true;
		if (ENVIRONMENT_IS_PTHREAD) return startWorker();
		if (!Module["noFSInit"] && !FS.initialized) FS.init();
		TTY.init();
		wasmExports["eb"]();
		FS.ignorePermissions = false;
	}
	function postRun() {
		if (ENVIRONMENT_IS_PTHREAD) {
			return;
		}
		if (Module["postRun"]) {
			if (typeof Module["postRun"] == "function")
				Module["postRun"] = [Module["postRun"]];
			while (Module["postRun"].length) {
				addOnPostRun(Module["postRun"].shift());
			}
		}
		callRuntimeCallbacks(onPostRuns);
	}
	function abort(what) {
		Module["onAbort"]?.(what);
		what = `Aborted(${what})`;
		err(what);
		ABORT = true;
		what += ". Build with -sASSERTIONS for more info.";
		var e = new WebAssembly.RuntimeError(what);
		throw e;
	}
	var wasmBinaryFile;
	function findWasmBinary() {
		if (Module["locateFile"]) {
			return locateFile("gex-wgpu-replay.wasm");
		}
		return new URL("gex-wgpu-replay.wasm", import.meta.url).href;
	}
	function getBinarySync(file) {
		if (file == wasmBinaryFile && wasmBinary) {
			return new Uint8Array(wasmBinary);
		}
		if (readBinary) {
			return readBinary(file);
		}
		throw "both async and sync fetching of the wasm failed";
	}
	async function getWasmBinary(binaryFile) {
		if (!wasmBinary) {
			try {
				var response = await readAsync(binaryFile);
				return new Uint8Array(response);
			} catch {}
		}
		return getBinarySync(binaryFile);
	}
	var loadSplitModule = instantiateSync;
	var splitModuleProxyHandler = {
		get(target, moduleName, receiver) {
			if (moduleName.startsWith("placeholder")) {
				let secondaryFile;
				if (moduleName == "placeholder") {
					secondaryFile = wasmBinaryFile.slice(0, -5) + ".deferred.wasm";
				} else {
					let moduleID = moduleName.split(".")[1];
					secondaryFile =
						wasmBinaryFile.slice(0, -5) + "." + moduleID + ".wasm";
				}
				return new Proxy(
					{},
					{
						get(target, base, receiver) {
							let ret = (...args) => {
								var imports = { primary: wasmRawExports };
								loadSplitModule(secondaryFile, imports, base);
								return wasmTable.get(base)(...args);
							};
							return ret;
						},
					},
				);
			}
			return target[moduleName];
		},
	};
	function instantiateSync(file, info) {
		var module;
		var binary = getBinarySync(file);
		module = new WebAssembly.Module(binary);
		var instance = new WebAssembly.Instance(module, info);
		return [instance, module];
	}
	async function instantiateArrayBuffer(binaryFile, imports) {
		try {
			var binary = await getWasmBinary(binaryFile);
			var instance = await WebAssembly.instantiate(binary, imports);
			return instance;
		} catch (reason) {
			err(`failed to asynchronously prepare wasm: ${reason}`);
			abort(reason);
		}
	}
	async function instantiateAsync(binary, binaryFile, imports) {
		if (!binary) {
			try {
				var response = fetch(binaryFile, { credentials: "same-origin" });
				var instantiationResult = await WebAssembly.instantiateStreaming(
					response,
					imports,
				);
				return instantiationResult;
			} catch (reason) {
				err(`wasm streaming compile failed: ${reason}`);
				err("falling back to ArrayBuffer instantiation");
			}
		}
		return instantiateArrayBuffer(binaryFile, imports);
	}
	function getWasmImports() {
		assignWasmImports();
		var imports = { a: wasmImports };
		imports = new Proxy(imports, splitModuleProxyHandler);
		return imports;
	}
	async function createWasm() {
		function receiveInstance(instance, module) {
			wasmExports = instance.exports;
			wasmRawExports = wasmExports;
			registerTLSInit(wasmExports["nc"]);
			assignWasmExports(wasmExports);
			wasmModule = module;
			return wasmExports;
		}
		function receiveInstantiationResult(result) {
			return receiveInstance(result["instance"], result["module"]);
		}
		var info = getWasmImports();
		if (Module["instantiateWasm"]) {
			return new Promise((resolve, reject) => {
				Module["instantiateWasm"](info, (inst, mod) => {
					resolve(receiveInstance(inst, mod));
				});
			});
		}
		if (ENVIRONMENT_IS_PTHREAD) {
			var instance = new WebAssembly.Instance(wasmModule, getWasmImports());
			return receiveInstance(instance, wasmModule);
		}
		wasmBinaryFile ??= findWasmBinary();
		var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
		var exports = receiveInstantiationResult(result);
		return exports;
	}
	class ExitStatus {
		name = "ExitStatus";
		constructor(status) {
			this.message = `Program terminated with exit(${status})`;
			this.status = status;
		}
	}
	var HEAP16;
	var HEAP32;
	var HEAP64;
	var HEAP8;
	var HEAPF32;
	var HEAPF64;
	var HEAPU16;
	var HEAPU32;
	var HEAPU64;
	var HEAPU8;
	var terminateWorker = (worker) => {
		worker.terminate();
		worker.onmessage = (e) => {};
	};
	var cleanupThread = (pthread_ptr) => {
		var worker = PThread.pthreads[pthread_ptr];
		PThread.returnWorkerToPool(worker);
	};
	var callRuntimeCallbacks = (callbacks) => {
		while (callbacks.length > 0) {
			callbacks.shift()(Module);
		}
	};
	var onPreRuns = [];
	var addOnPreRun = (cb) => onPreRuns.push(cb);
	var runDependencies = 0;
	var dependenciesFulfilled = null;
	var removeRunDependency = (id) => {
		runDependencies--;
		Module["monitorRunDependencies"]?.(runDependencies);
		if (runDependencies == 0) {
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
	};
	var spawnThread = (threadParams) => {
		var worker = PThread.getNewWorker();
		if (!worker) {
			return 6;
		}
		PThread.pthreads[threadParams.pthread_ptr] = worker;
		worker.pthread_ptr = threadParams.pthread_ptr;
		var msg = {
			cmd: 2,
			start_routine: threadParams.startRoutine,
			arg: threadParams.arg,
			pthread_ptr: threadParams.pthread_ptr,
		};
		worker.postMessage(msg, threadParams.transferList);
		return 0;
	};
	var runtimeKeepaliveCounter = 0;
	var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
	var stackSave = () => _emscripten_stack_get_current();
	var stackRestore = (val) => __emscripten_stack_restore(val);
	var stackAlloc = (sz) => __emscripten_stack_alloc(sz);
	var proxyToMainThread = (funcIndex, emAsmAddr, proxyMode, ...callArgs) => {
		var bufSize = 8 * callArgs.length * 2;
		var sp = stackSave();
		var args = stackAlloc(bufSize);
		var b = args >> 3;
		for (var arg of callArgs) {
			if (typeof arg == "bigint") {
				(growMemViews(), HEAP64)[b++] = 1n;
				(growMemViews(), HEAP64)[b++] = arg;
			} else {
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
	var exitJS = (status, implicit) => {
		EXITSTATUS = status;
		if (ENVIRONMENT_IS_PTHREAD) {
			exitOnMainThread(status);
			throw "unwind";
		}
		_proc_exit(status);
	};
	var _exit = exitJS;
	var waitAsyncPolyfilled =
		!Atomics.waitAsync ||
		(globalThis.navigator?.userAgent &&
			Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./) || [])[2]) <
				91);
	var PThread = {
		unusedWorkers: [],
		tlsInitFunctions: [],
		pthreads: {},
		init() {
			if (!ENVIRONMENT_IS_PTHREAD) {
				PThread.initMainThread();
			}
		},
		initMainThread() {
			var pthreadPoolSize = 4;
			while (pthreadPoolSize--) {
				PThread.allocateUnusedWorker();
			}
			addOnPreRun(async () => {
				var pthreadPoolReady = PThread.loadWasmModuleToAllWorkers();
				addRunDependency("loading-workers");
				await pthreadPoolReady;
				removeRunDependency("loading-workers");
			});
		},
		terminateAllThreads: () => {
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
			PThread.terminateAllThreads();
			var pthread_ptr = _pthread_self();
			___set_thread_state(0, 0, 0, 1);
			if (!waitAsyncPolyfilled) {
				Atomics.notify((growMemViews(), HEAP32), pthread_ptr >> 2);
			}
		},
		returnWorkerToPool: (worker) => {
			var pthread_ptr = worker.pthread_ptr;
			delete PThread.pthreads[pthread_ptr];
			PThread.unusedWorkers.push(worker);
			worker.pthread_ptr = 0;
			__emscripten_thread_free_data(pthread_ptr);
		},
		threadInitTLS() {
			PThread.tlsInitFunctions.forEach((f) => f());
		},
		loadWasmModuleToWorker: (worker) =>
			new Promise((onFinishedLoading) => {
				worker.onmessage = (e) => {
					var d = e.data;
					var cmd = d.cmd;
					if (d.targetThread) {
						var targetWorker = PThread.pthreads[d.targetThread];
						targetWorker?.postMessage(d);
						return;
					}
					if (d === "setimmediate" || d === "_si") {
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
							callUserCallback(() => cleanupThread(d.thread));
							break;
						case 3:
							onFinishedLoading(worker);
							break;
						case 9:
							Module[d.handler](...d.args);
							break;
						default:
							if (cmd) err(`worker sent an unknown command ${cmd}`);
					}
				};
				worker.onerror = (e) => {
					var message = "worker sent an error!";
					err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);
					throw e;
				};
				var handlers = [];
				var knownHandlers = ["onExit", "onAbort", "print", "printErr"];
				for (var handler of knownHandlers) {
					if (Module.propertyIsEnumerable(handler)) {
						handlers.push(handler);
					}
				}
				worker.postMessage({ cmd: 1, handlers, wasmMemory, wasmModule });
			}),
		async loadWasmModuleToAllWorkers() {
			if (ENVIRONMENT_IS_PTHREAD) {
				return;
			}
			let pthreadPoolReady = Promise.all(
				PThread.unusedWorkers.map(PThread.loadWasmModuleToWorker),
			);
			return pthreadPoolReady;
		},
		allocateUnusedWorker() {
			var worker;
			if (Module["mainScriptUrlOrBlob"]) {
				var pthreadMainJs = Module["mainScriptUrlOrBlob"];
				if (typeof pthreadMainJs != "string") {
					pthreadMainJs = URL.createObjectURL(pthreadMainJs);
				}
				worker = new Worker(pthreadMainJs, {
					type: "module",
					name: "em-pthread",
				});
			} else
				worker = new Worker(new URL("gex-wgpu-replay.js", import.meta.url), {
					type: "module",
					name: "em-pthread",
				});
			PThread.unusedWorkers.push(worker);
			return worker;
		},
		getNewWorker() {
			if (PThread.unusedWorkers.length == 0) {
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
		_emscripten_stack_set_limits(stackHigh, stackLow);
		stackRestore(stackHigh);
	}
	var wasmTableMirror = [];
	var getWasmTableEntry = (funcPtr) => {
		var func = wasmTableMirror[funcPtr];
		if (!func) {
			wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
		}
		return func;
	};
	var invokeEntryPoint = (ptr, arg) => {
		runtimeKeepaliveCounter = 0;
		noExitRuntime = 0;
		var result = getWasmTableEntry(ptr)(arg);
		function finish(result) {
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
	var wasmMemory;
	var ___call_sighandler = (fp, sig) => getWasmTableEntry(fp)(sig);
	class ExceptionInfo {
		constructor(excPtr) {
			this.excPtr = excPtr;
			this.ptr = excPtr - 24;
		}
		set_type(type) {
			(growMemViews(), HEAPU32)[(this.ptr + 4) >> 2] = type;
		}
		get_type() {
			return (growMemViews(), HEAPU32)[(this.ptr + 4) >> 2];
		}
		set_destructor(destructor) {
			(growMemViews(), HEAPU32)[(this.ptr + 8) >> 2] = destructor;
		}
		get_destructor() {
			return (growMemViews(), HEAPU32)[(this.ptr + 8) >> 2];
		}
		set_caught(caught) {
			caught = caught ? 1 : 0;
			(growMemViews(), HEAP8)[this.ptr + 12] = caught;
		}
		get_caught() {
			return (growMemViews(), HEAP8)[this.ptr + 12] != 0;
		}
		set_rethrown(rethrown) {
			rethrown = rethrown ? 1 : 0;
			(growMemViews(), HEAP8)[this.ptr + 13] = rethrown;
		}
		get_rethrown() {
			return (growMemViews(), HEAP8)[this.ptr + 13] != 0;
		}
		init(type, destructor) {
			this.set_adjusted_ptr(0);
			this.set_type(type);
			this.set_destructor(destructor);
		}
		set_adjusted_ptr(adjustedPtr) {
			(growMemViews(), HEAPU32)[(this.ptr + 16) >> 2] = adjustedPtr;
		}
		get_adjusted_ptr() {
			return (growMemViews(), HEAPU32)[(this.ptr + 16) >> 2];
		}
	}
	var uncaughtExceptionCount = 0;
	var ___cxa_throw = (ptr, type, destructor) => {
		var info = new ExceptionInfo(ptr);
		info.init(type, destructor);
		uncaughtExceptionCount++;
		abort();
	};
	function pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(2, 0, 1, pthread_ptr, attr, startRoutine, arg);
		return ___pthread_create_js(pthread_ptr, attr, startRoutine, arg);
	}
	var _emscripten_has_threading_support = () => !!globalThis.SharedArrayBuffer;
	var ___pthread_create_js = (pthread_ptr, attr, startRoutine, arg) => {
		if (!_emscripten_has_threading_support()) {
			return 6;
		}
		var transferList = [];
		var error = 0;
		if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
			return pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg);
		}
		if (error) return error;
		var threadParams = { startRoutine, pthread_ptr, arg, transferList };
		if (ENVIRONMENT_IS_PTHREAD) {
			threadParams.cmd = 5;
			postMessage(threadParams, transferList);
			return 0;
		}
		return spawnThread(threadParams);
	};
	var syscallGetVarargI = () => {
		var ret = (growMemViews(), HEAP32)[+SYSCALLS.varargs >> 2];
		SYSCALLS.varargs += 4;
		return ret;
	};
	var syscallGetVarargP = syscallGetVarargI;
	var PATH = {
		isAbs: (path) => path.charAt(0) === "/",
		splitPath: (filename) => {
			var splitPathRe =
				/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
			return splitPathRe.exec(filename).slice(1);
		},
		normalizeArray: (parts, allowAboveRoot) => {
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
				return ".";
			}
			if (dir) {
				dir = dir.slice(0, -1);
			}
			return root + dir;
		},
		basename: (path) => path && path.match(/([^\/]+|\/)\/*$/)[1],
		join: (...paths) => PATH.normalize(paths.join("/")),
		join2: (l, r) => PATH.normalize(l + "/" + r),
	};
	var initRandomFill = () => (view) => (
		view.set(crypto.getRandomValues(new Uint8Array(view.byteLength))),
		0
	);
	var randomFill = (view) => (randomFill = initRandomFill())(view);
	var PATH_FS = {
		resolve: (...args) => {
			var resolvedPath = "",
				resolvedAbsolute = false;
			for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
				var path = i >= 0 ? args[i] : FS.cwd();
				if (typeof path != "string") {
					throw new TypeError("Arguments to path.resolve must be strings");
				} else if (!path) {
					return "";
				}
				resolvedPath = path + "/" + resolvedPath;
				resolvedAbsolute = PATH.isAbs(path);
			}
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
	var UTF8Decoder = globalThis.TextDecoder && new TextDecoder();
	var findStringEnd = (heapOrArray, idx, maxBytesToRead, ignoreNul) => {
		var maxIdx = idx + maxBytesToRead;
		if (ignoreNul) return maxIdx;
		while (heapOrArray[idx] && !(idx >= maxIdx)) ++idx;
		return idx;
	};
	var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead, ignoreNul) => {
		var endPtr = findStringEnd(heapOrArray, idx, maxBytesToRead, ignoreNul);
		if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
			return UTF8Decoder.decode(
				heapOrArray.buffer instanceof ArrayBuffer
					? heapOrArray.subarray(idx, endPtr)
					: heapOrArray.slice(idx, endPtr),
			);
		}
		var str = "";
		while (idx < endPtr) {
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
	var FS_stdin_getChar_buffer = [];
	var lengthBytesUTF8 = (str) => {
		var len = 0;
		for (var i = 0; i < str.length; ++i) {
			var c = str.charCodeAt(i);
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
		if (!(maxBytesToWrite > 0)) return 0;
		var startIdx = outIdx;
		var endIdx = outIdx + maxBytesToWrite - 1;
		for (var i = 0; i < str.length; ++i) {
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
				heap[outIdx++] = 240 | (u >> 18);
				heap[outIdx++] = 128 | ((u >> 12) & 63);
				heap[outIdx++] = 128 | ((u >> 6) & 63);
				heap[outIdx++] = 128 | (u & 63);
				i++;
			}
		}
		heap[outIdx] = 0;
		return outIdx - startIdx;
	};
	var intArrayFromString = (stringy, dontAddNull, length) => {
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
			if (globalThis.window?.prompt) {
				result = window.prompt("Input: ");
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
			TTY.ttys[dev] = { input: [], output: [], ops };
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
	var mmapAlloc = (size) => {
		abort();
	};
	var MEMFS = {
		ops_table: null,
		mount(mount) {
			return MEMFS.createNode(null, "/", 16895, 0);
		},
		createNode(parent, name, mode, dev) {
			if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
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
					stream: { llseek: MEMFS.stream_ops.llseek },
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
				node.usedBytes = 0;
				node.contents = MEMFS.emptyFileContents ??= new Uint8Array(0);
			} else if (FS.isLink(node.mode)) {
				node.node_ops = MEMFS.ops_table.link.node;
				node.stream_ops = MEMFS.ops_table.link.stream;
			} else if (FS.isChrdev(node.mode)) {
				node.node_ops = MEMFS.ops_table.chrdev.node;
				node.stream_ops = MEMFS.ops_table.chrdev.stream;
			}
			node.atime = node.mtime = node.ctime = Date.now();
			if (parent) {
				parent.contents[name] = node;
				parent.atime = parent.mtime = parent.ctime = node.atime;
			}
			return node;
		},
		getFileDataAsTypedArray(node) {
			return node.contents.subarray(0, node.usedBytes);
		},
		expandFileStorage(node, newCapacity) {
			var prevCapacity = node.contents.length;
			if (prevCapacity >= newCapacity) return;
			var CAPACITY_DOUBLING_MAX = 1024 * 1024;
			newCapacity = Math.max(
				newCapacity,
				(prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>>
					0,
			);
			if (prevCapacity) newCapacity = Math.max(newCapacity, 256);
			var oldContents = MEMFS.getFileDataAsTypedArray(node);
			node.contents = new Uint8Array(newCapacity);
			node.contents.set(oldContents);
		},
		resizeFileStorage(node, newSize) {
			if (node.usedBytes == newSize) return;
			var oldContents = node.contents;
			node.contents = new Uint8Array(newSize);
			node.contents.set(
				oldContents.subarray(0, Math.min(newSize, node.usedBytes)),
			);
			node.usedBytes = newSize;
		},
		node_ops: {
			getattr(node) {
				var attr = {};
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
				if (!MEMFS.doesNotExistError) {
					MEMFS.doesNotExistError = new FS.ErrnoError(44);
					MEMFS.doesNotExistError.stack = "<generic error, no stack>";
				}
				throw MEMFS.doesNotExistError;
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
						for (var i in new_node.contents) {
							throw new FS.ErrnoError(55);
						}
					}
					FS.hashRemoveNode(new_node);
				}
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
				buffer.set(contents.subarray(position, position + size), offset);
				return size;
			},
			write(stream, buffer, offset, length, position, canOwn) {
				if (buffer.buffer === (growMemViews(), HEAP8).buffer) {
					canOwn = false;
				}
				if (!length) return 0;
				var node = stream.node;
				node.mtime = node.ctime = Date.now();
				if (canOwn) {
					node.contents = buffer.subarray(offset, offset + length);
					node.usedBytes = length;
				} else if (node.usedBytes === 0 && position === 0) {
					node.contents = buffer.slice(offset, offset + length);
					node.usedBytes = length;
				} else {
					MEMFS.expandFileStorage(node, position + length);
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
				if (
					!(flags & 2) &&
					contents.buffer === (growMemViews(), HEAP8).buffer
				) {
					allocated = false;
					ptr = contents.byteOffset;
				} else {
					allocated = true;
					ptr = mmapAlloc(length);
					if (!ptr) {
						throw new FS.ErrnoError(48);
					}
					if (contents) {
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
				return { ptr, allocated };
			},
			msync(stream, buffer, offset, length, mmapFlags) {
				MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
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
	var asyncLoad = async (url) => {
		var arrayBuffer = await readAsync(url);
		return new Uint8Array(arrayBuffer);
	};
	var FS_createDataFile = (...args) => FS.createDataFile(...args);
	var getUniqueRunDependency = (id) => id;
	var preloadPlugins = [];
	var FS_handledByPreloadPlugin = async (byteArray, fullname) => {
		if (typeof Browser != "undefined") Browser.init();
		for (var plugin of preloadPlugins) {
			if (plugin["canHandle"](fullname)) {
				return plugin["handle"](byteArray, fullname);
			}
		}
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
		var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
		var dep = getUniqueRunDependency(`cp ${fullname}`);
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
		ErrnoError: class {
			name = "ErrnoError";
			constructor(errno) {
				this.errno = errno;
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
			linkloop: for (var nlinks = 0; nlinks < 40; nlinks++) {
				var parts = path.split("/").filter((p) => !!p);
				var current = FS.root;
				var current_path = "/";
				for (var i = 0; i < parts.length; i++) {
					var islast = i === parts.length - 1;
					if (islast && opts.parent) {
						break;
					}
					if (parts[i] === ".") {
						continue;
					}
					if (parts[i] === "..") {
						current_path = PATH.dirname(current_path);
						if (FS.isRoot(current)) {
							path = current_path + "/" + parts.slice(i + 1).join("/");
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
						if (e?.errno === 44 && islast && opts.noent_okay) {
							return { path: current_path };
						}
						throw e;
					}
					if (FS.isMountpoint(current) && (!islast || opts.follow_mount)) {
						current = current.mounted.root;
					}
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
				return { path: current_path, node: current };
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
			return FS.lookup(parent, name);
		},
		createNode(parent, name, mode, rdev) {
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
				stream.stream_ops = device.stream_ops;
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
			FS.devices[dev] = { stream_ops: ops };
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
			for (var mount of mounts) {
				if (mount.type.syncfs) {
					mount.type.syncfs(mount, populate, done);
				} else {
					done(null);
				}
			}
		},
		mount(type, opts, mountpoint) {
			var root = mountpoint === "/";
			var pseudo = !mountpoint;
			var node;
			if (root && FS.root) {
				throw new FS.ErrnoError(10);
			} else if (!root && !pseudo) {
				var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
				mountpoint = lookup.path;
				node = lookup.node;
				if (FS.isMountpoint(node)) {
					throw new FS.ErrnoError(10);
				}
				if (!FS.isDir(node.mode)) {
					throw new FS.ErrnoError(54);
				}
			}
			var mount = { type, opts, mountpoint, mounts: [] };
			var mountRoot = type.mount(mount);
			mountRoot.mount = mount;
			mount.root = mountRoot;
			if (root) {
				FS.root = mountRoot;
			} else if (node) {
				node.mounted = mount;
				if (node.mount) {
					node.mount.mounts.push(mount);
				}
			}
			return mountRoot;
		},
		unmount(mountpoint) {
			var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
			if (!FS.isMountpoint(lookup.node)) {
				throw new FS.ErrnoError(28);
			}
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
			node.mounted = null;
			var idx = node.mount.mounts.indexOf(mount);
			node.mount.mounts.splice(idx, 1);
		},
		lookup(parent, name) {
			return parent.node_ops.lookup(parent, name);
		},
		mknod(path, mode, dev) {
			var lookup = FS.lookupPath(path, { parent: true });
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
			return FS.statfsNode(FS.lookupPath(path, { follow: true }).node);
		},
		statfsStream(stream) {
			return FS.statfsNode(stream.node);
		},
		statfsNode(node) {
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
			var lookup = FS.lookupPath(newpath, { parent: true });
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
			var lookup, old_dir, new_dir;
			lookup = FS.lookupPath(old_path, { parent: true });
			old_dir = lookup.node;
			lookup = FS.lookupPath(new_path, { parent: true });
			new_dir = lookup.node;
			if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
			if (old_dir.mount !== new_dir.mount) {
				throw new FS.ErrnoError(75);
			}
			var old_node = FS.lookupNode(old_dir, old_name);
			var relative = PATH_FS.relative(old_path, new_dirname);
			if (relative.charAt(0) !== ".") {
				throw new FS.ErrnoError(28);
			}
			relative = PATH_FS.relative(new_path, old_dirname);
			if (relative.charAt(0) !== ".") {
				throw new FS.ErrnoError(55);
			}
			var new_node;
			try {
				new_node = FS.lookupNode(new_dir, new_name);
			} catch (e) {}
			if (old_node === new_node) {
				return;
			}
			var isdir = FS.isDir(old_node.mode);
			var errCode = FS.mayDelete(old_dir, old_name, isdir);
			if (errCode) {
				throw new FS.ErrnoError(errCode);
			}
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
			if (new_dir !== old_dir) {
				errCode = FS.nodePermissions(old_dir, "w");
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
			}
			FS.hashRemoveNode(old_node);
			try {
				old_dir.node_ops.rename(old_node, new_dir, new_name);
				old_node.parent = new_dir;
			} catch (e) {
				throw e;
			} finally {
				FS.hashAddNode(old_node);
			}
		},
		rmdir(path) {
			var lookup = FS.lookupPath(path, { parent: true });
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
			var lookup = FS.lookupPath(path, { follow: true });
			var node = lookup.node;
			var readdir = FS.checkOpExists(node.node_ops.readdir, 54);
			return readdir(node);
		},
		unlink(path) {
			var lookup = FS.lookupPath(path, { parent: true });
			var parent = lookup.node;
			if (!parent) {
				throw new FS.ErrnoError(44);
			}
			var name = PATH.basename(path);
			var node = FS.lookupNode(parent, name);
			var errCode = FS.mayDelete(parent, name, false);
			if (errCode) {
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
			var lookup = FS.lookupPath(path, { follow: !dontFollow });
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
				var lookup = FS.lookupPath(path, { follow: !dontFollow });
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
			FS.doSetAttr(stream, node, { timestamp: Date.now(), dontFollow });
		},
		chown(path, uid, gid, dontFollow) {
			var node;
			if (typeof path == "string") {
				var lookup = FS.lookupPath(path, { follow: !dontFollow });
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
			FS.doSetAttr(stream, node, { size: len, timestamp: Date.now() });
		},
		truncate(path, len) {
			if (len < 0) {
				throw new FS.ErrnoError(28);
			}
			var node;
			if (typeof path == "string") {
				var lookup = FS.lookupPath(path, { follow: true });
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
			var lookup = FS.lookupPath(path, { follow: true });
			var node = lookup.node;
			var setattr = FS.checkOpExists(node.node_ops.setattr, 63);
			setattr(node, { atime, mtime });
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
				var lookup = FS.lookupPath(path, {
					follow: !(flags & 131072),
					noent_okay: true,
				});
				node = lookup.node;
				path = lookup.path;
			}
			var created = false;
			if (flags & 64) {
				if (node) {
					if (flags & 128) {
						throw new FS.ErrnoError(20);
					}
				} else if (isDirPath) {
					throw new FS.ErrnoError(31);
				} else {
					node = FS.mknod(path, mode | 511, 0);
					created = true;
				}
			}
			if (!node) {
				throw new FS.ErrnoError(44);
			}
			if (FS.isChrdev(node.mode)) {
				flags &= ~512;
			}
			if (flags & 65536 && !FS.isDir(node.mode)) {
				throw new FS.ErrnoError(54);
			}
			if (!created) {
				var errCode = FS.mayOpen(node, flags);
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
			}
			if (flags & 512 && !created) {
				FS.truncate(node, 0);
			}
			flags &= ~(128 | 512 | 131072);
			var stream = FS.createStream({
				node,
				path: FS.getPath(node),
				flags,
				seekable: true,
				position: 0,
				stream_ops: node.stream_ops,
				ungotten: [],
				error: false,
			});
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
			var lookup = FS.lookupPath(path, { follow: true });
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
			FS.mkdir("/dev");
			FS.registerDevice(FS.makedev(1, 3), {
				read: () => 0,
				write: (stream, buffer, offset, length, pos) => length,
				llseek: () => 0,
			});
			FS.mkdev("/dev/null", FS.makedev(1, 3));
			TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
			TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
			FS.mkdev("/dev/tty", FS.makedev(5, 0));
			FS.mkdev("/dev/tty1", FS.makedev(6, 0));
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
			FS.mkdir("/dev/shm");
			FS.mkdir("/dev/shm/tmp");
		},
		createSpecialDirectories() {
			FS.mkdir("/proc");
			var proc_self = FS.mkdir("/proc/self");
			FS.mkdir("/proc/self/fd");
			FS.mount(
				{
					mount() {
						var node = FS.createNode(proc_self, "fd", 16895, 73);
						node.stream_ops = { llseek: MEMFS.stream_ops.llseek };
						node.node_ops = {
							lookup(parent, name) {
								var fd = +name;
								var stream = FS.getStreamChecked(fd);
								var ret = {
									parent: null,
									mount: { mountpoint: "fake" },
									node_ops: { readlink: () => stream.path },
									id: fd + 1,
								};
								ret.parent = ret;
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
			var stdin = FS.open("/dev/stdin", 0);
			var stdout = FS.open("/dev/stdout", 1);
			var stderr = FS.open("/dev/stderr", 1);
		},
		staticInit() {
			FS.nameTable = new Array(4096);
			FS.mount(MEMFS, {}, "/");
			FS.createDefaultDirectories();
			FS.createDefaultDevices();
			FS.createSpecialDirectories();
			FS.filesystems = { MEMFS };
		},
		init(input, output, error) {
			FS.initialized = true;
			input ??= Module["stdin"];
			output ??= Module["stdout"];
			error ??= Module["stderr"];
			FS.createStandardStreams(input, output, error);
		},
		quit() {
			FS.initialized = false;
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
			try {
				var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
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
				var lookup = FS.lookupPath(path, { parent: true });
				ret.parentExists = true;
				ret.parentPath = lookup.path;
				ret.parentObject = lookup.node;
				ret.name = PATH.basename(path);
				lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
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
			FS.registerDevice(dev, {
				open(stream) {
					stream.seekable = false;
				},
				close(stream) {
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
				try {
					obj.contents = readBinary(obj.url);
				} catch (e) {
					throw new FS.ErrnoError(29);
				}
			}
		},
		createLazyFile(parent, name, url, canRead, canWrite) {
			class LazyUint8Array {
				lengthKnown = false;
				chunks = [];
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
					if (!hasByteServing) chunkSize = datalength;
					var doXHR = (from, to) => {
						if (from > to)
							abort(`invalid range (${from}, ${to}) or no bytes requested!`);
						if (to > datalength - 1)
							abort(`only ${datalength} bytes available! programmer error!`);
						var xhr = new XMLHttpRequest();
						xhr.open("GET", url, false);
						if (datalength !== chunkSize)
							xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
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
							return new Uint8Array(xhr.response || []);
						}
						return intArrayFromString(xhr.responseText ?? "", true);
					};
					var lazyArray = this;
					lazyArray.setDataGetter((chunkNum) => {
						var start = chunkNum * chunkSize;
						var end = (chunkNum + 1) * chunkSize - 1;
						end = Math.min(end, datalength - 1);
						if (typeof lazyArray.chunks[chunkNum] == "undefined") {
							lazyArray.chunks[chunkNum] = doXHR(start, end);
						}
						if (typeof lazyArray.chunks[chunkNum] == "undefined")
							abort("doXHR failed!");
						return lazyArray.chunks[chunkNum];
					});
					if (usesGzip || !datalength) {
						chunkSize = datalength = 1;
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
				var properties = { isDevice: false, contents: lazyArray };
			} else {
				var properties = { isDevice: false, url };
			}
			var node = FS.createFile(parent, name, properties, canRead, canWrite);
			if (properties.contents) {
				node.contents = properties.contents;
			} else if (properties.url) {
				node.contents = null;
				node.url = properties.url;
			}
			Object.defineProperties(node, {
				usedBytes: {
					get: function () {
						return this.contents.length;
					},
				},
			});
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
				if (contents.slice) {
					for (var i = 0; i < size; i++) {
						buffer[offset + i] = contents[position + i];
					}
				} else {
					for (var i = 0; i < size; i++) {
						buffer[offset + i] = contents.get(position + i);
					}
				}
				return size;
			}
			stream_ops.read = (stream, buffer, offset, length, position) => {
				FS.forceLoadFile(node);
				return writeChunks(stream, buffer, offset, length, position);
			};
			stream_ops.mmap = (stream, length, position, prot, flags) => {
				FS.forceLoadFile(node);
				var ptr = mmapAlloc(length);
				if (!ptr) {
					throw new FS.ErrnoError(48);
				}
				writeChunks(stream, (growMemViews(), HEAP8), ptr, length, position);
				return { ptr, allocated: true };
			};
			node.stream_ops = stream_ops;
			return node;
		},
	};
	var UTF8ToString = (ptr, maxBytesToRead, ignoreNul) =>
		ptr
			? UTF8ArrayToString(
					(growMemViews(), HEAPU8),
					ptr,
					maxBytesToRead,
					ignoreNul,
				)
			: "";
	var SYSCALLS = {
		currentUmask: 18,
		calculateAt(dirfd, path, allowEmpty) {
			if (PATH.isAbs(path)) {
				return path;
			}
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
			(growMemViews(), HEAPU32)[(buf + 56) >> 2] = stats.namelen;
		},
		doMsync(addr, stream, len, flags, offset) {
			if (!FS.isFile(stream.node.mode)) {
				throw new FS.ErrnoError(43);
			}
			if (flags & 2) {
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
	function ___syscall_fcntl64(fd, cmd, varargs) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(3, 0, 1, fd, cmd, varargs);
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
					(growMemViews(), HEAP16)[(arg + offset) >> 1] = 2;
					return 0;
				}
				case 13:
				case 14:
					return 0;
			}
			return -28;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return -e.errno;
		}
	}
	function ___syscall_ioctl(fd, op, varargs) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(4, 0, 1, fd, op, varargs);
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
	function ___syscall_openat(dirfd, path, flags, varargs) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(5, 0, 1, dirfd, path, flags, varargs);
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
	var __abort_js = () => abort("");
	var getExecutableName = () => thisProgram;
	var stringToUTF8 = (str, outPtr, maxBytesToWrite) =>
		stringToUTF8Array(str, (growMemViews(), HEAPU8), outPtr, maxBytesToWrite);
	var __emscripten_get_progname = (str, len) =>
		stringToUTF8(getExecutableName(), str, len);
	var __emscripten_init_main_thread_js = (tb) => {
		var can_block = !ENVIRONMENT_IS_WEB;
		try {
			Atomics.wait((growMemViews(), HEAP32), 0, 0, 0);
			can_block = true;
		} catch (e) {}
		__emscripten_thread_init(
			tb,
			!ENVIRONMENT_IS_WORKER,
			1,
			can_block,
			16777216,
			false,
		);
		PThread.threadInitTLS();
	};
	var jsStackTrace = () => new Error().stack.toString();
	var getCallstack = (flags) => {
		var callstack = jsStackTrace();
		var lines = callstack.split("\n");
		callstack = "";
		var firefoxRe = new RegExp("\\s*(.*?)@(.*?):([0-9]+):([0-9]+)");
		var chromeRe = new RegExp("\\s*at (.*?) \\((.*):(.*):(.*)\\)");
		for (var line of lines) {
			var symbolName = "";
			var file = "";
			var lineno = 0;
			var column = 0;
			var parts = chromeRe.exec(line);
			if (parts?.length == 5) {
				symbolName = parts[1];
				file = parts[2];
				lineno = parts[3];
				column = parts[4];
			} else {
				parts = firefoxRe.exec(line);
				if (parts?.length >= 4) {
					symbolName = parts[1];
					file = parts[2];
					lineno = parts[3];
					column = parts[4] | 0;
				} else {
					callstack += line + "\n";
					continue;
				}
			}
			if (
				symbolName == "_emscripten_log" ||
				symbolName == "_emscripten_get_callstack"
			) {
				callstack = "";
				continue;
			}
			if (flags & 24) {
				if (flags & 64) {
					file = file.substring(file.replace(/\\/g, "/").lastIndexOf("/") + 1);
				}
				callstack += `    at ${symbolName} (${file}:${lineno}:${column})\n`;
			}
		}
		callstack = callstack.replace(/\s+$/, "");
		return callstack;
	};
	var __emscripten_log_formatted = (flags, str) => {
		str = UTF8ToString(str);
		if (flags & 24) {
			str = str.replace(/\s+$/, "");
			str += (str.length > 0 ? "\n" : "") + getCallstack(flags);
		}
		if (flags & 1) {
			if (flags & 4) {
				console.error(str);
			} else if (flags & 2) {
				console.warn(str);
			} else if (flags & 512) {
				console.info(str);
			} else if (flags & 256) {
				console.debug(str);
			} else {
				console.log(str);
			}
		} else if (flags & 6) {
			err(str);
		} else {
			out(str);
		}
	};
	var handleException = (e) => {
		if (e instanceof ExitStatus || e == "unwind") {
			return EXITSTATUS;
		}
		quit_(1, e);
	};
	var maybeExit = () => {
		if (!keepRuntimeAlive()) {
			try {
				if (ENVIRONMENT_IS_PTHREAD) {
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
			var wait = Atomics.waitAsync(
				(growMemViews(), HEAP32),
				pthread_ptr >> 2,
				pthread_ptr,
			);
			wait.value.then(checkMailbox);
			var waitingAsync = pthread_ptr + 112;
			Atomics.store((growMemViews(), HEAP32), waitingAsync >> 2, 1);
		}
	};
	var checkMailbox = () => {
		var pthread_ptr = _pthread_self();
		if (!pthread_ptr) return;
		callUserCallback(() => {
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
			postMessage({ targetThread, cmd: 4 });
		} else {
			var worker = PThread.pthreads[targetThread];
			if (!worker) {
				return;
			}
			worker.postMessage({ cmd: 4 });
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
		proxiedJSCallArgs.length = 0;
		var b = args >> 3;
		var end = (args + bufSize) >> 3;
		while (b < end) {
			var arg;
			if ((growMemViews(), HEAP64)[b++]) {
				arg = (growMemViews(), HEAP64)[b++];
			} else {
				arg = (growMemViews(), HEAPF64)[b++];
			}
			proxiedJSCallArgs.push(arg);
		}
		var func = proxiedFunctionTable[funcIndex];
		PThread.currentProxiedOperationCallerThread = callingThread;
		var rtn = func(...proxiedJSCallArgs);
		PThread.currentProxiedOperationCallerThread = 0;
		if (ctx) {
			rtn.then((rtn) =>
				__emscripten_run_js_on_main_thread_done(ctx, ctxArgs, rtn),
			);
			return;
		}
		return rtn;
	};
	var __emscripten_runtime_keepalive_clear = () => {
		noExitRuntime = false;
		runtimeKeepaliveCounter = 0;
	};
	var __emscripten_thread_cleanup = (thread) => {
		if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread);
		else postMessage({ cmd: 6, thread });
	};
	var __emscripten_thread_set_strongref = (thread) => {};
	var __emscripten_throw_longjmp = () => {
		throw new EmscriptenSjLj();
	};
	var timers = {};
	var _emscripten_get_now = () => performance.timeOrigin + performance.now();
	function __setitimer_js(which, timeout_ms) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(6, 0, 1, which, timeout_ms);
		if (timers[which]) {
			clearTimeout(timers[which].id);
			delete timers[which];
		}
		if (!timeout_ms) return 0;
		var id = setTimeout(() => {
			delete timers[which];
			callUserCallback(() =>
				__emscripten_timeout(which, _emscripten_get_now()),
			);
		}, timeout_ms);
		timers[which] = { id, timeout_ms };
		return 0;
	}
	var __tzset_js = (timezone, daylight, std_name, dst_name) => {
		var currentYear = new Date().getFullYear();
		var winter = new Date(currentYear, 0, 1);
		var summer = new Date(currentYear, 6, 1);
		var winterOffset = winter.getTimezoneOffset();
		var summerOffset = summer.getTimezoneOffset();
		var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
		(growMemViews(), HEAPU32)[timezone >> 2] = stdTimezoneOffset * 60;
		(growMemViews(), HEAP32)[daylight >> 2] = Number(
			winterOffset != summerOffset,
		);
		var extractZone = (timezoneOffset) => {
			var sign = timezoneOffset >= 0 ? "-" : "+";
			var absOffset = Math.abs(timezoneOffset);
			var hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
			var minutes = String(absOffset % 60).padStart(2, "0");
			return `UTC${sign}${hours}${minutes}`;
		};
		var winterName = extractZone(winterOffset);
		var summerName = extractZone(summerOffset);
		if (summerOffset < winterOffset) {
			stringToUTF8(winterName, std_name, 17);
			stringToUTF8(summerName, dst_name, 17);
		} else {
			stringToUTF8(winterName, dst_name, 17);
			stringToUTF8(summerName, std_name, 17);
		}
	};
	var _emscripten_date_now = () => Date.now();
	var nowIsMonotonic = 1;
	var checkWasiClock = (clock_id) => clock_id >= 0 && clock_id <= 3;
	var INT53_MAX = 9007199254740992;
	var INT53_MIN = -9007199254740992;
	var bigintToI53Checked = (num) =>
		num < INT53_MIN || num > INT53_MAX ? NaN : Number(num);
	function _clock_time_get(clk_id, ignored_precision, ptime) {
		ignored_precision = bigintToI53Checked(ignored_precision);
		if (!checkWasiClock(clk_id)) {
			return 28;
		}
		var now;
		if (clk_id === 0) {
			now = _emscripten_date_now();
		} else if (nowIsMonotonic) {
			now = _emscripten_get_now();
		} else {
			return 52;
		}
		var nsec = Math.round(now * 1e3 * 1e3);
		(growMemViews(), HEAP64)[ptime >> 3] = BigInt(nsec);
		return 0;
	}
	var _emscripten_check_blocking_allowed = () => {};
	var runtimeKeepalivePush = () => {
		runtimeKeepaliveCounter += 1;
	};
	var _emscripten_exit_with_live_runtime = () => {
		runtimeKeepalivePush();
		throw "unwind";
	};
	var getHeapMax = () => 2147483648;
	var alignMemory = (size, alignment) =>
		Math.ceil(size / alignment) * alignment;
	var growMemory = (size) => {
		var oldHeapSize = wasmMemory.buffer.byteLength;
		var pages = ((size - oldHeapSize + 65535) / 65536) | 0;
		try {
			wasmMemory.grow(pages);
			updateMemoryViews();
			return 1;
		} catch (e) {}
	};
	var _emscripten_resize_heap = (requestedSize) => {
		var oldSize = (growMemViews(), HEAPU8).length;
		requestedSize >>>= 0;
		if (requestedSize <= oldSize) {
			return false;
		}
		var maxHeapSize = getHeapMax();
		if (requestedSize > maxHeapSize) {
			return false;
		}
		for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
			var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
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
		return false;
	};
	var maybeCStringToJsString = (cString) =>
		cString > 2 ? UTF8ToString(cString) : cString;
	var specialHTMLTargets = [
		0,
		globalThis.document ?? 0,
		globalThis.window ?? 0,
	];
	var findEventTarget = (target) => {
		target = maybeCStringToJsString(target);
		var domElement =
			specialHTMLTargets[target] || globalThis.document?.querySelector(target);
		return domElement;
	};
	var findCanvasEventTarget = findEventTarget;
	var setCanvasElementSizeCallingThread = (target, width, height) => {
		var canvas = findCanvasEventTarget(target);
		if (!canvas) return -4;
		if (!canvas.controlTransferredOffscreen) {
			var autoResizeViewport = false;
			if (canvas.GLctxObject?.GLctx) {
				var prevViewport = canvas.GLctxObject.GLctx.getParameter(2978);
				autoResizeViewport =
					prevViewport[0] === 0 &&
					prevViewport[1] === 0 &&
					prevViewport[2] === canvas.width &&
					prevViewport[3] === canvas.height;
			}
			canvas.width = width;
			canvas.height = height;
			if (autoResizeViewport) {
				canvas.GLctxObject.GLctx.viewport(0, 0, width, height);
			}
		} else {
			return -4;
		}
		return 0;
	};
	function setCanvasElementSizeMainThread(target, width, height) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(7, 0, 1, target, width, height);
		return setCanvasElementSizeCallingThread(target, width, height);
	}
	var _emscripten_set_canvas_element_size = (target, width, height) => {
		var canvas = findCanvasEventTarget(target);
		if (canvas) {
			return setCanvasElementSizeCallingThread(target, width, height);
		}
		return setCanvasElementSizeMainThread(target, width, height);
	};
	var _stackSave = stackSave;
	var _stackRestore = stackSave;
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
	var WebGPU = {
		Internals: {
			jsObjects: [],
			jsObjectInsert: (ptr, jsObject) => {
				WebGPU.Internals.jsObjects[(ptr >>>= 0)] = jsObject;
			},
			bufferOnUnmaps: [],
			futures: [],
			futureInsert: (futureId, promise) => {},
		},
		getJsObject: (ptr) => {
			if (!ptr) return undefined;
			var key = (ptr >>>= 0);
			return WebGPU.Internals.jsObjects[key];
		},
		importJsAdapter: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateAdapter(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsBindGroup: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateBindGroup(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsBindGroupLayout: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateBindGroupLayout(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsBuffer: (buffer, parentPtr = 0) => {
			assert(buffer.mapState != "pending");
			var mapState = buffer.mapState == "mapped" ? 3 : 1;
			var bufferPtr = _emwgpuCreateBuffer(parentPtr, mapState);
			WebGPU.Internals.jsObjectInsert(bufferPtr, buffer);
			if (buffer.mapState == "mapped") {
				WebGPU.Internals.bufferOnUnmaps[bufferPtr] = [];
			}
			return bufferPtr;
		},
		importJsCommandBuffer: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateCommandBuffer(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsCommandEncoder: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateCommandEncoder(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsComputePassEncoder: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateComputePassEncoder(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsComputePipeline: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateComputePipeline(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsDevice: (device, parentPtr = 0) => {
			var queuePtr = _emwgpuCreateQueue(parentPtr);
			var devicePtr = _emwgpuCreateDevice(parentPtr, queuePtr);
			WebGPU.Internals.jsObjectInsert(queuePtr, device.queue);
			WebGPU.Internals.jsObjectInsert(devicePtr, device);
			return devicePtr;
		},
		importJsPipelineLayout: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreatePipelineLayout(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsQuerySet: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateQuerySet(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsQueue: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateQueue(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsRenderBundle: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateRenderBundle(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsRenderBundleEncoder: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateRenderBundleEncoder(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsRenderPassEncoder: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateRenderPassEncoder(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsRenderPipeline: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateRenderPipeline(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsSampler: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateSampler(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsShaderModule: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateShaderModule(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsSurface: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateSurface(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsTexture: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateTexture(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		importJsTextureView: (obj, parentPtr = 0) => {
			var ptr = _emwgpuCreateTextureView(parentPtr);
			WebGPU.Internals.jsObjects[ptr >>> 0] = obj;
			return ptr;
		},
		errorCallback: (callback, type, message, userdata) => {
			var sp = stackSave();
			var messagePtr = stringToUTF8OnStack(message);
			getWasmTableEntry(callback)(type, messagePtr, userdata);
			stackRestore(sp);
		},
		setStringView: (ptr, data, length) => {
			(growMemViews(), HEAPU32)[ptr >> 2] = data;
			(growMemViews(), HEAPU32)[(ptr + 4) >> 2] = length;
		},
		makeStringFromStringView: (stringViewPtr) => {
			var ptr = (growMemViews(), HEAPU32)[stringViewPtr >> 2];
			var length = (growMemViews(), HEAPU32)[(stringViewPtr + 4) >> 2];
			return UTF8ToString(ptr, length);
		},
		makeStringFromOptionalStringView: (stringViewPtr) => {
			var ptr = (growMemViews(), HEAPU32)[stringViewPtr >> 2];
			var length = (growMemViews(), HEAPU32)[(stringViewPtr + 4) >> 2];
			if (!ptr) {
				if (length === 0) {
					return "";
				}
				return undefined;
			}
			return UTF8ToString(ptr, length);
		},
		makeColor: (ptr) => ({
			r: (growMemViews(), HEAPF64)[ptr >> 3],
			g: (growMemViews(), HEAPF64)[(ptr + 8) >> 3],
			b: (growMemViews(), HEAPF64)[(ptr + 16) >> 3],
			a: (growMemViews(), HEAPF64)[(ptr + 24) >> 3],
		}),
		makeExtent3D: (ptr) => ({
			width: (growMemViews(), HEAPU32)[ptr >> 2],
			height: (growMemViews(), HEAPU32)[(ptr + 4) >> 2],
			depthOrArrayLayers: (growMemViews(), HEAPU32)[(ptr + 8) >> 2],
		}),
		makeOrigin3D: (ptr) => ({
			x: (growMemViews(), HEAPU32)[ptr >> 2],
			y: (growMemViews(), HEAPU32)[(ptr + 4) >> 2],
			z: (growMemViews(), HEAPU32)[(ptr + 8) >> 2],
		}),
		makeTexelCopyTextureInfo: (ptr) => ({
			texture: WebGPU.getJsObject((growMemViews(), HEAPU32)[ptr >> 2]),
			mipLevel: (growMemViews(), HEAPU32)[(ptr + 4) >> 2],
			origin: WebGPU.makeOrigin3D(ptr + 8),
			aspect: WebGPU.TextureAspect[(growMemViews(), HEAPU32)[(ptr + 20) >> 2]],
		}),
		makeTexelCopyBufferLayout: (ptr) => {
			var bytesPerRow = (growMemViews(), HEAPU32)[(ptr + 8) >> 2];
			var rowsPerImage = (growMemViews(), HEAPU32)[(ptr + 12) >> 2];
			return {
				offset:
					(growMemViews(), HEAPU32)[(ptr + 4) >> 2] * 4294967296 +
					(growMemViews(), HEAPU32)[ptr >> 2],
				bytesPerRow: bytesPerRow === 4294967295 ? undefined : bytesPerRow,
				rowsPerImage: rowsPerImage === 4294967295 ? undefined : rowsPerImage,
			};
		},
		makeTexelCopyBufferInfo: (ptr) => {
			var layoutPtr = ptr + 0;
			var bufferCopyView = WebGPU.makeTexelCopyBufferLayout(layoutPtr);
			bufferCopyView["buffer"] = WebGPU.getJsObject(
				(growMemViews(), HEAPU32)[(ptr + 16) >> 2],
			);
			return bufferCopyView;
		},
		optionalQuerySetIndex: (index) =>
			index === 4294967295 ? undefined : index,
		makePassTimestampWrites: (ptr) => {
			if (ptr === 0) return undefined;
			return {
				querySet: WebGPU.getJsObject((growMemViews(), HEAPU32)[(ptr + 4) >> 2]),
				beginningOfPassWriteIndex: WebGPU.optionalQuerySetIndex(
					(growMemViews(), HEAPU32)[(ptr + 8) >> 2],
				),
				endOfPassWriteIndex: WebGPU.optionalQuerySetIndex(
					(growMemViews(), HEAPU32)[(ptr + 12) >> 2],
				),
			};
		},
		makePipelineConstants: (constantCount, constantsPtr) => {
			if (!constantCount) return;
			var constants = {};
			for (var i = 0; i < constantCount; ++i) {
				var entryPtr = constantsPtr + 24 * i;
				var key = WebGPU.makeStringFromStringView(entryPtr + 4);
				constants[key] = (growMemViews(), HEAPF64)[(entryPtr + 16) >> 3];
			}
			return constants;
		},
		makePipelineLayout: (layoutPtr) => {
			if (!layoutPtr) return "auto";
			return WebGPU.getJsObject(layoutPtr);
		},
		makeComputeState: (ptr) => {
			if (!ptr) return undefined;
			var desc = {
				module: WebGPU.getJsObject((growMemViews(), HEAPU32)[(ptr + 4) >> 2]),
				constants: WebGPU.makePipelineConstants(
					(growMemViews(), HEAPU32)[(ptr + 16) >> 2],
					(growMemViews(), HEAPU32)[(ptr + 20) >> 2],
				),
				entryPoint: WebGPU.makeStringFromOptionalStringView(ptr + 8),
			};
			return desc;
		},
		makeComputePipelineDesc: (descriptor) => {
			var desc = {
				label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
				layout: WebGPU.makePipelineLayout(
					(growMemViews(), HEAPU32)[(descriptor + 12) >> 2],
				),
				compute: WebGPU.makeComputeState(descriptor + 16),
			};
			return desc;
		},
		makeRenderPipelineDesc: (descriptor) => {
			function makePrimitiveState(psPtr) {
				if (!psPtr) return undefined;
				return {
					topology:
						WebGPU.PrimitiveTopology[
							(growMemViews(), HEAPU32)[(psPtr + 4) >> 2]
						],
					stripIndexFormat:
						WebGPU.IndexFormat[(growMemViews(), HEAPU32)[(psPtr + 8) >> 2]],
					frontFace:
						WebGPU.FrontFace[(growMemViews(), HEAPU32)[(psPtr + 12) >> 2]],
					cullMode:
						WebGPU.CullMode[(growMemViews(), HEAPU32)[(psPtr + 16) >> 2]],
					unclippedDepth: !!(growMemViews(), HEAPU32)[(psPtr + 20) >> 2],
				};
			}
			function makeBlendComponent(bdPtr) {
				if (!bdPtr) return undefined;
				return {
					operation:
						WebGPU.BlendOperation[(growMemViews(), HEAPU32)[bdPtr >> 2]],
					srcFactor:
						WebGPU.BlendFactor[(growMemViews(), HEAPU32)[(bdPtr + 4) >> 2]],
					dstFactor:
						WebGPU.BlendFactor[(growMemViews(), HEAPU32)[(bdPtr + 8) >> 2]],
				};
			}
			function makeBlendState(bsPtr) {
				if (!bsPtr) return undefined;
				return {
					alpha: makeBlendComponent(bsPtr + 12),
					color: makeBlendComponent(bsPtr + 0),
				};
			}
			function makeColorState(csPtr) {
				var formatInt = (growMemViews(), HEAPU32)[(csPtr + 4) >> 2];
				return formatInt === 0
					? undefined
					: {
							format: WebGPU.TextureFormat[formatInt],
							blend: makeBlendState(
								(growMemViews(), HEAPU32)[(csPtr + 8) >> 2],
							),
							writeMask: (growMemViews(), HEAPU32)[(csPtr + 16) >> 2],
						};
			}
			function makeColorStates(count, csArrayPtr) {
				var states = [];
				for (var i = 0; i < count; ++i) {
					states.push(makeColorState(csArrayPtr + 24 * i));
				}
				return states;
			}
			function makeStencilStateFace(ssfPtr) {
				return {
					compare:
						WebGPU.CompareFunction[(growMemViews(), HEAPU32)[ssfPtr >> 2]],
					failOp:
						WebGPU.StencilOperation[
							(growMemViews(), HEAPU32)[(ssfPtr + 4) >> 2]
						],
					depthFailOp:
						WebGPU.StencilOperation[
							(growMemViews(), HEAPU32)[(ssfPtr + 8) >> 2]
						],
					passOp:
						WebGPU.StencilOperation[
							(growMemViews(), HEAPU32)[(ssfPtr + 12) >> 2]
						],
				};
			}
			function makeDepthStencilState(dssPtr) {
				if (!dssPtr) return undefined;
				return {
					format:
						WebGPU.TextureFormat[(growMemViews(), HEAPU32)[(dssPtr + 4) >> 2]],
					depthWriteEnabled: !!(growMemViews(), HEAPU32)[(dssPtr + 8) >> 2],
					depthCompare:
						WebGPU.CompareFunction[
							(growMemViews(), HEAPU32)[(dssPtr + 12) >> 2]
						],
					stencilFront: makeStencilStateFace(dssPtr + 16),
					stencilBack: makeStencilStateFace(dssPtr + 32),
					stencilReadMask: (growMemViews(), HEAPU32)[(dssPtr + 48) >> 2],
					stencilWriteMask: (growMemViews(), HEAPU32)[(dssPtr + 52) >> 2],
					depthBias: (growMemViews(), HEAP32)[(dssPtr + 56) >> 2],
					depthBiasSlopeScale: (growMemViews(), HEAPF32)[(dssPtr + 60) >> 2],
					depthBiasClamp: (growMemViews(), HEAPF32)[(dssPtr + 64) >> 2],
				};
			}
			function makeVertexAttribute(vaPtr) {
				return {
					format:
						WebGPU.VertexFormat[(growMemViews(), HEAPU32)[(vaPtr + 4) >> 2]],
					offset:
						(growMemViews(), HEAPU32)[(vaPtr + 4 + 8) >> 2] * 4294967296 +
						(growMemViews(), HEAPU32)[(vaPtr + 8) >> 2],
					shaderLocation: (growMemViews(), HEAPU32)[(vaPtr + 16) >> 2],
				};
			}
			function makeVertexAttributes(count, vaArrayPtr) {
				var vas = [];
				for (var i = 0; i < count; ++i) {
					vas.push(makeVertexAttribute(vaArrayPtr + i * 24));
				}
				return vas;
			}
			function makeVertexBuffer(vbPtr) {
				if (!vbPtr) return undefined;
				var stepModeInt = (growMemViews(), HEAPU32)[(vbPtr + 4) >> 2];
				var attributeCountInt = (growMemViews(), HEAPU32)[(vbPtr + 16) >> 2];
				if (stepModeInt === 0 && attributeCountInt === 0) {
					return null;
				}
				return {
					arrayStride:
						(growMemViews(), HEAPU32)[(vbPtr + 4 + 8) >> 2] * 4294967296 +
						(growMemViews(), HEAPU32)[(vbPtr + 8) >> 2],
					stepMode: WebGPU.VertexStepMode[stepModeInt],
					attributes: makeVertexAttributes(
						attributeCountInt,
						(growMemViews(), HEAPU32)[(vbPtr + 20) >> 2],
					),
				};
			}
			function makeVertexBuffers(count, vbArrayPtr) {
				if (!count) return undefined;
				var vbs = [];
				for (var i = 0; i < count; ++i) {
					vbs.push(makeVertexBuffer(vbArrayPtr + i * 24));
				}
				return vbs;
			}
			function makeVertexState(viPtr) {
				if (!viPtr) return undefined;
				var desc = {
					module: WebGPU.getJsObject(
						(growMemViews(), HEAPU32)[(viPtr + 4) >> 2],
					),
					constants: WebGPU.makePipelineConstants(
						(growMemViews(), HEAPU32)[(viPtr + 16) >> 2],
						(growMemViews(), HEAPU32)[(viPtr + 20) >> 2],
					),
					buffers: makeVertexBuffers(
						(growMemViews(), HEAPU32)[(viPtr + 24) >> 2],
						(growMemViews(), HEAPU32)[(viPtr + 28) >> 2],
					),
					entryPoint: WebGPU.makeStringFromOptionalStringView(viPtr + 8),
				};
				return desc;
			}
			function makeMultisampleState(msPtr) {
				if (!msPtr) return undefined;
				return {
					count: (growMemViews(), HEAPU32)[(msPtr + 4) >> 2],
					mask: (growMemViews(), HEAPU32)[(msPtr + 8) >> 2],
					alphaToCoverageEnabled: !!(growMemViews(), HEAPU32)[
						(msPtr + 12) >> 2
					],
				};
			}
			function makeFragmentState(fsPtr) {
				if (!fsPtr) return undefined;
				var desc = {
					module: WebGPU.getJsObject(
						(growMemViews(), HEAPU32)[(fsPtr + 4) >> 2],
					),
					constants: WebGPU.makePipelineConstants(
						(growMemViews(), HEAPU32)[(fsPtr + 16) >> 2],
						(growMemViews(), HEAPU32)[(fsPtr + 20) >> 2],
					),
					targets: makeColorStates(
						(growMemViews(), HEAPU32)[(fsPtr + 24) >> 2],
						(growMemViews(), HEAPU32)[(fsPtr + 28) >> 2],
					),
					entryPoint: WebGPU.makeStringFromOptionalStringView(fsPtr + 8),
				};
				return desc;
			}
			var desc = {
				label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
				layout: WebGPU.makePipelineLayout(
					(growMemViews(), HEAPU32)[(descriptor + 12) >> 2],
				),
				vertex: makeVertexState(descriptor + 16),
				primitive: makePrimitiveState(descriptor + 48),
				depthStencil: makeDepthStencilState(
					(growMemViews(), HEAPU32)[(descriptor + 72) >> 2],
				),
				multisample: makeMultisampleState(descriptor + 76),
				fragment: makeFragmentState(
					(growMemViews(), HEAPU32)[(descriptor + 92) >> 2],
				),
			};
			return desc;
		},
		fillLimitStruct: (limits, limitsOutPtr) => {
			function setLimitValueU32(name, limitOffset) {
				var limitValue = limits[name];
				(growMemViews(), HEAP32)[(limitsOutPtr + limitOffset) >> 2] =
					limitValue;
			}
			function setLimitValueU64(name, limitOffset) {
				var limitValue = limits[name];
				(growMemViews(), HEAP64)[(limitsOutPtr + limitOffset) >> 3] =
					BigInt(limitValue);
			}
			setLimitValueU32("maxTextureDimension1D", 4);
			setLimitValueU32("maxTextureDimension2D", 8);
			setLimitValueU32("maxTextureDimension3D", 12);
			setLimitValueU32("maxTextureArrayLayers", 16);
			setLimitValueU32("maxBindGroups", 20);
			setLimitValueU32("maxBindGroupsPlusVertexBuffers", 24);
			setLimitValueU32("maxBindingsPerBindGroup", 28);
			setLimitValueU32("maxDynamicUniformBuffersPerPipelineLayout", 32);
			setLimitValueU32("maxDynamicStorageBuffersPerPipelineLayout", 36);
			setLimitValueU32("maxSampledTexturesPerShaderStage", 40);
			setLimitValueU32("maxSamplersPerShaderStage", 44);
			setLimitValueU32("maxStorageBuffersPerShaderStage", 48);
			setLimitValueU32("maxStorageTexturesPerShaderStage", 52);
			setLimitValueU32("maxUniformBuffersPerShaderStage", 56);
			setLimitValueU32("minUniformBufferOffsetAlignment", 80);
			setLimitValueU32("minStorageBufferOffsetAlignment", 84);
			setLimitValueU64("maxUniformBufferBindingSize", 64);
			setLimitValueU64("maxStorageBufferBindingSize", 72);
			setLimitValueU32("maxVertexBuffers", 88);
			setLimitValueU64("maxBufferSize", 96);
			setLimitValueU32("maxVertexAttributes", 104);
			setLimitValueU32("maxVertexBufferArrayStride", 108);
			setLimitValueU32("maxInterStageShaderVariables", 112);
			setLimitValueU32("maxColorAttachments", 116);
			setLimitValueU32("maxColorAttachmentBytesPerSample", 120);
			setLimitValueU32("maxComputeWorkgroupStorageSize", 124);
			setLimitValueU32("maxComputeInvocationsPerWorkgroup", 128);
			setLimitValueU32("maxComputeWorkgroupSizeX", 132);
			setLimitValueU32("maxComputeWorkgroupSizeY", 136);
			setLimitValueU32("maxComputeWorkgroupSizeZ", 140);
			setLimitValueU32("maxComputeWorkgroupsPerDimension", 144);
			if (limits.maxImmediateSize !== undefined) {
				setLimitValueU32("maxImmediateSize", 148);
			}
		},
		fillAdapterInfoStruct: (info, infoStruct) => {
			(growMemViews(), HEAP32)[(infoStruct + 52) >> 2] = info.subgroupMinSize;
			(growMemViews(), HEAP32)[(infoStruct + 56) >> 2] = info.subgroupMaxSize;
			var strs =
				info.vendor + info.architecture + info.device + info.description;
			var strPtr = stringToNewUTF8(strs);
			var vendorLen = lengthBytesUTF8(info.vendor);
			WebGPU.setStringView(infoStruct + 4, strPtr, vendorLen);
			strPtr += vendorLen;
			var architectureLen = lengthBytesUTF8(info.architecture);
			WebGPU.setStringView(infoStruct + 12, strPtr, architectureLen);
			strPtr += architectureLen;
			var deviceLen = lengthBytesUTF8(info.device);
			WebGPU.setStringView(infoStruct + 20, strPtr, deviceLen);
			strPtr += deviceLen;
			var descriptionLen = lengthBytesUTF8(info.description);
			WebGPU.setStringView(infoStruct + 28, strPtr, descriptionLen);
			strPtr += descriptionLen;
			(growMemViews(), HEAP32)[(infoStruct + 36) >> 2] = 2;
			var adapterType = info.isFallbackAdapter ? 3 : 4;
			(growMemViews(), HEAP32)[(infoStruct + 40) >> 2] = adapterType;
			(growMemViews(), HEAP32)[(infoStruct + 44) >> 2] = 0;
			(growMemViews(), HEAP32)[(infoStruct + 48) >> 2] = 0;
		},
		AddressMode: [, "clamp-to-edge", "repeat", "mirror-repeat"],
		BlendFactor: [
			,
			"zero",
			"one",
			"src",
			"one-minus-src",
			"src-alpha",
			"one-minus-src-alpha",
			"dst",
			"one-minus-dst",
			"dst-alpha",
			"one-minus-dst-alpha",
			"src-alpha-saturated",
			"constant",
			"one-minus-constant",
			"src1",
			"one-minus-src1",
			"src1-alpha",
			"one-minus-src1-alpha",
		],
		BlendOperation: [, "add", "subtract", "reverse-subtract", "min", "max"],
		BufferBindingType: [
			"binding-not-used",
			,
			"uniform",
			"storage",
			"read-only-storage",
		],
		BufferMapState: [, "unmapped", "pending", "mapped"],
		CompareFunction: [
			,
			"never",
			"less",
			"equal",
			"less-equal",
			"greater",
			"not-equal",
			"greater-equal",
			"always",
		],
		CompilationInfoRequestStatus: [, "success", "callback-cancelled"],
		CompositeAlphaMode: [
			,
			"opaque",
			"premultiplied",
			"unpremultiplied",
			"inherit",
		],
		CullMode: [, "none", "front", "back"],
		ErrorFilter: [, "validation", "out-of-memory", "internal"],
		FeatureLevel: [, "compatibility", "core"],
		FeatureName: {
			1: "core-features-and-limits",
			2: "depth-clip-control",
			3: "depth32float-stencil8",
			4: "texture-compression-bc",
			5: "texture-compression-bc-sliced-3d",
			6: "texture-compression-etc2",
			7: "texture-compression-astc",
			8: "texture-compression-astc-sliced-3d",
			9: "timestamp-query",
			10: "indirect-first-instance",
			11: "shader-f16",
			12: "rg11b10ufloat-renderable",
			13: "bgra8unorm-storage",
			14: "float32-filterable",
			15: "float32-blendable",
			16: "clip-distances",
			17: "dual-source-blending",
			18: "subgroups",
			19: "texture-formats-tier1",
			20: "texture-formats-tier2",
			21: "primitive-index",
			327692: "chromium-experimental-unorm16-texture-formats",
			327693: "chromium-experimental-snorm16-texture-formats",
			327732: "chromium-experimental-multi-draw-indirect",
		},
		FilterMode: [, "nearest", "linear"],
		FrontFace: [, "ccw", "cw"],
		IndexFormat: [, "uint16", "uint32"],
		InstanceFeatureName: [
			,
			"timed-wait-any",
			"shader-source-spirv",
			"multiple-devices-per-adapter",
		],
		LoadOp: [, "load", "clear"],
		MipmapFilterMode: [, "nearest", "linear"],
		OptionalBool: ["false", "true"],
		PowerPreference: [, "low-power", "high-performance"],
		PredefinedColorSpace: [, "srgb", "display-p3"],
		PrimitiveTopology: [
			,
			"point-list",
			"line-list",
			"line-strip",
			"triangle-list",
			"triangle-strip",
		],
		QueryType: [, "occlusion", "timestamp"],
		SamplerBindingType: [
			"binding-not-used",
			,
			"filtering",
			"non-filtering",
			"comparison",
		],
		Status: [, "success", "error"],
		StencilOperation: [
			,
			"keep",
			"zero",
			"replace",
			"invert",
			"increment-clamp",
			"decrement-clamp",
			"increment-wrap",
			"decrement-wrap",
		],
		StorageTextureAccess: [
			"binding-not-used",
			,
			"write-only",
			"read-only",
			"read-write",
		],
		StoreOp: [, "store", "discard"],
		SurfaceGetCurrentTextureStatus: [
			,
			"success-optimal",
			"success-suboptimal",
			"timeout",
			"outdated",
			"lost",
			"error",
		],
		TextureAspect: [, "all", "stencil-only", "depth-only"],
		TextureDimension: [, "1d", "2d", "3d"],
		TextureFormat: [
			,
			"r8unorm",
			"r8snorm",
			"r8uint",
			"r8sint",
			"r16unorm",
			"r16snorm",
			"r16uint",
			"r16sint",
			"r16float",
			"rg8unorm",
			"rg8snorm",
			"rg8uint",
			"rg8sint",
			"r32float",
			"r32uint",
			"r32sint",
			"rg16unorm",
			"rg16snorm",
			"rg16uint",
			"rg16sint",
			"rg16float",
			"rgba8unorm",
			"rgba8unorm-srgb",
			"rgba8snorm",
			"rgba8uint",
			"rgba8sint",
			"bgra8unorm",
			"bgra8unorm-srgb",
			"rgb10a2uint",
			"rgb10a2unorm",
			"rg11b10ufloat",
			"rgb9e5ufloat",
			"rg32float",
			"rg32uint",
			"rg32sint",
			"rgba16unorm",
			"rgba16snorm",
			"rgba16uint",
			"rgba16sint",
			"rgba16float",
			"rgba32float",
			"rgba32uint",
			"rgba32sint",
			"stencil8",
			"depth16unorm",
			"depth24plus",
			"depth24plus-stencil8",
			"depth32float",
			"depth32float-stencil8",
			"bc1-rgba-unorm",
			"bc1-rgba-unorm-srgb",
			"bc2-rgba-unorm",
			"bc2-rgba-unorm-srgb",
			"bc3-rgba-unorm",
			"bc3-rgba-unorm-srgb",
			"bc4-r-unorm",
			"bc4-r-snorm",
			"bc5-rg-unorm",
			"bc5-rg-snorm",
			"bc6h-rgb-ufloat",
			"bc6h-rgb-float",
			"bc7-rgba-unorm",
			"bc7-rgba-unorm-srgb",
			"etc2-rgb8unorm",
			"etc2-rgb8unorm-srgb",
			"etc2-rgb8a1unorm",
			"etc2-rgb8a1unorm-srgb",
			"etc2-rgba8unorm",
			"etc2-rgba8unorm-srgb",
			"eac-r11unorm",
			"eac-r11snorm",
			"eac-rg11unorm",
			"eac-rg11snorm",
			"astc-4x4-unorm",
			"astc-4x4-unorm-srgb",
			"astc-5x4-unorm",
			"astc-5x4-unorm-srgb",
			"astc-5x5-unorm",
			"astc-5x5-unorm-srgb",
			"astc-6x5-unorm",
			"astc-6x5-unorm-srgb",
			"astc-6x6-unorm",
			"astc-6x6-unorm-srgb",
			"astc-8x5-unorm",
			"astc-8x5-unorm-srgb",
			"astc-8x6-unorm",
			"astc-8x6-unorm-srgb",
			"astc-8x8-unorm",
			"astc-8x8-unorm-srgb",
			"astc-10x5-unorm",
			"astc-10x5-unorm-srgb",
			"astc-10x6-unorm",
			"astc-10x6-unorm-srgb",
			"astc-10x8-unorm",
			"astc-10x8-unorm-srgb",
			"astc-10x10-unorm",
			"astc-10x10-unorm-srgb",
			"astc-12x10-unorm",
			"astc-12x10-unorm-srgb",
			"astc-12x12-unorm",
			"astc-12x12-unorm-srgb",
		],
		TextureSampleType: [
			"binding-not-used",
			,
			"float",
			"unfilterable-float",
			"depth",
			"sint",
			"uint",
		],
		TextureViewDimension: [
			,
			"1d",
			"2d",
			"2d-array",
			"cube",
			"cube-array",
			"3d",
		],
		ToneMappingMode: [, "standard", "extended"],
		VertexFormat: [
			,
			"uint8",
			"uint8x2",
			"uint8x4",
			"sint8",
			"sint8x2",
			"sint8x4",
			"unorm8",
			"unorm8x2",
			"unorm8x4",
			"snorm8",
			"snorm8x2",
			"snorm8x4",
			"uint16",
			"uint16x2",
			"uint16x4",
			"sint16",
			"sint16x2",
			"sint16x4",
			"unorm16",
			"unorm16x2",
			"unorm16x4",
			"snorm16",
			"snorm16x2",
			"snorm16x4",
			"float16",
			"float16x2",
			"float16x4",
			"float32",
			"float32x2",
			"float32x3",
			"float32x4",
			"uint32",
			"uint32x2",
			"uint32x3",
			"uint32x4",
			"sint32",
			"sint32x2",
			"sint32x3",
			"sint32x4",
			"unorm10-10-10-2",
			"unorm8x4-bgra",
		],
		VertexStepMode: [, "vertex", "instance"],
		WGSLLanguageFeatureName: [
			,
			"readonly_and_readwrite_storage_textures",
			"packed_4x8_integer_dot_product",
			"unrestricted_pointer_parameters",
			"pointer_composite_access",
		],
	};
	var _emscripten_webgpu_get_device = () => {
		if (WebGPU.preinitializedDeviceId === undefined) {
			WebGPU.preinitializedDeviceId = WebGPU.importJsDevice(
				Module["preinitializedWebGPUDevice"],
			);
			_wgpuDeviceAddRef(WebGPU.preinitializedDeviceId);
		}
		_wgpuDeviceAddRef(WebGPU.preinitializedDeviceId);
		return WebGPU.preinitializedDeviceId;
	};
	var _emwgpuBufferDestroy = (bufferPtr) => {
		var buffer = WebGPU.getJsObject(bufferPtr);
		var onUnmap = WebGPU.Internals.bufferOnUnmaps[bufferPtr];
		if (onUnmap) {
			for (var i = 0; i < onUnmap.length; ++i) {
				onUnmap[i]();
			}
			delete WebGPU.Internals.bufferOnUnmaps[bufferPtr];
		}
		buffer.destroy();
	};
	var runtimeKeepalivePop = () => {
		runtimeKeepaliveCounter -= 1;
	};
	var _emwgpuBufferMapAsync = function (
		bufferPtr,
		futureId,
		mode,
		offset,
		size,
	) {
		futureId = bigintToI53Checked(futureId);
		mode = bigintToI53Checked(mode);
		var buffer = WebGPU.getJsObject(bufferPtr);
		WebGPU.Internals.bufferOnUnmaps[bufferPtr] = [];
		if (size == -1) size = undefined;
		runtimeKeepalivePush();
		WebGPU.Internals.futureInsert(
			futureId,
			buffer.mapAsync(mode, offset, size).then(
				() => {
					runtimeKeepalivePop();
					_emwgpuOnMapAsyncCompleted(futureId, 1, 0);
				},
				(ex) => {
					runtimeKeepalivePop();
					var sp = stackSave();
					var messagePtr = stringToUTF8OnStack(ex.message);
					var status =
						ex.name === "AbortError" ? 4 : ex.name === "OperationError" ? 3 : 0;
					_emwgpuOnMapAsyncCompleted(futureId, status, messagePtr);
					delete WebGPU.Internals.bufferOnUnmaps[bufferPtr];
				},
			),
		);
	};
	var _emwgpuBufferReadMappedRange = (bufferPtr, offset, data, size) => {
		var buffer = WebGPU.getJsObject(bufferPtr);
		var mapped;
		try {
			mapped = buffer.getMappedRange(offset, size);
		} catch (ex) {
			return 2;
		}
		(growMemViews(), HEAPU8).set(new Uint8Array(mapped), data);
		return 1;
	};
	var _emwgpuBufferUnmap = (bufferPtr) => {
		var buffer = WebGPU.getJsObject(bufferPtr);
		var onUnmap = WebGPU.Internals.bufferOnUnmaps[bufferPtr];
		if (!onUnmap) {
			return;
		}
		for (var i = 0; i < onUnmap.length; ++i) {
			onUnmap[i]();
		}
		delete WebGPU.Internals.bufferOnUnmaps[bufferPtr];
		buffer.unmap();
	};
	var _emwgpuDelete = (ptr) => {
		delete WebGPU.Internals.jsObjects[ptr >>> 0];
	};
	var _emwgpuDeviceCreateBuffer = (devicePtr, descriptor, bufferPtr) => {
		var mappedAtCreation = !!(growMemViews(), HEAPU32)[(descriptor + 32) >> 2];
		var desc = {
			label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
			usage: (growMemViews(), HEAPU32)[(descriptor + 16) >> 2],
			size:
				(growMemViews(), HEAPU32)[(descriptor + 4 + 24) >> 2] * 4294967296 +
				(growMemViews(), HEAPU32)[(descriptor + 24) >> 2],
			mappedAtCreation,
		};
		var device = WebGPU.getJsObject(devicePtr);
		var buffer;
		try {
			buffer = device.createBuffer(desc);
		} catch (ex) {
			return false;
		}
		WebGPU.Internals.jsObjectInsert(bufferPtr, buffer);
		if (mappedAtCreation) {
			WebGPU.Internals.bufferOnUnmaps[bufferPtr] = [];
		}
		return true;
	};
	var _emwgpuDeviceCreateShaderModule = (
		devicePtr,
		descriptor,
		shaderModulePtr,
	) => {
		var nextInChainPtr = (growMemViews(), HEAPU32)[descriptor >> 2];
		var sType = (growMemViews(), HEAPU32)[(nextInChainPtr + 4) >> 2];
		var desc = {
			label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
			code: "",
		};
		switch (sType) {
			case 2: {
				desc["code"] = WebGPU.makeStringFromStringView(nextInChainPtr + 8);
				break;
			}
		}
		var device = WebGPU.getJsObject(devicePtr);
		WebGPU.Internals.jsObjectInsert(
			shaderModulePtr,
			device.createShaderModule(desc),
		);
	};
	var _emwgpuDeviceDestroy = (devicePtr) => {
		const device = WebGPU.getJsObject(devicePtr);
		device.onuncapturederror = null;
		device.destroy();
	};
	var ENV = {};
	var getEnvStrings = () => {
		if (!getEnvStrings.strings) {
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
			for (var x in ENV) {
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
			return proxyToMainThread(8, 0, 1, __environ, environ_buf);
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
			return proxyToMainThread(9, 0, 1, penviron_count, penviron_buf_size);
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
		if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(10, 0, 1, fd);
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
		if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(11, 0, 1, fd, pbuf);
		try {
			var rightsBase = 0;
			var rightsInheriting = 0;
			var flags = 0;
			{
				var stream = SYSCALLS.getStreamFromFD(fd);
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
	var doReadv = (stream, iov, iovcnt, offset) => {
		var ret = 0;
		for (var i = 0; i < iovcnt; i++) {
			var ptr = (growMemViews(), HEAPU32)[iov >> 2];
			var len = (growMemViews(), HEAPU32)[(iov + 4) >> 2];
			iov += 8;
			var curr = FS.read(stream, (growMemViews(), HEAP8), ptr, len, offset);
			if (curr < 0) return -1;
			ret += curr;
			if (curr < len) break;
			if (typeof offset != "undefined") {
				offset += curr;
			}
		}
		return ret;
	};
	function _fd_read(fd, iov, iovcnt, pnum) {
		if (ENVIRONMENT_IS_PTHREAD)
			return proxyToMainThread(12, 0, 1, fd, iov, iovcnt, pnum);
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
			return proxyToMainThread(13, 0, 1, fd, offset, whence, newOffset);
		offset = bigintToI53Checked(offset);
		try {
			if (isNaN(offset)) return 22;
			var stream = SYSCALLS.getStreamFromFD(fd);
			FS.llseek(stream, offset, whence);
			(growMemViews(), HEAP64)[newOffset >> 3] = BigInt(stream.position);
			if (stream.getdents && offset === 0 && whence === 0)
				stream.getdents = null;
			return 0;
		} catch (e) {
			if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
			return e.errno;
		}
	}
	var doWritev = (stream, iov, iovcnt, offset) => {
		var ret = 0;
		for (var i = 0; i < iovcnt; i++) {
			var ptr = (growMemViews(), HEAPU32)[iov >> 2];
			var len = (growMemViews(), HEAPU32)[(iov + 4) >> 2];
			iov += 8;
			var curr = FS.write(stream, (growMemViews(), HEAP8), ptr, len, offset);
			if (curr < 0) return -1;
			ret += curr;
			if (curr < len) {
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
			return proxyToMainThread(14, 0, 1, fd, iov, iovcnt, pnum);
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
	function _gex_wgpu_jspi_signal() {
		var waiting = Module["__gexWgpuWaiting"];
		if (!waiting || !waiting.length) return;
		Module["__gexWgpuWaiting"] = [];
		for (var i = 0; i < waiting.length; ++i) waiting[i]();
	}
	function _gex_wgpu_jspi_wait() {
		return new Promise(function (resolve) {
			var waiting =
				Module["__gexWgpuWaiting"] || (Module["__gexWgpuWaiting"] = []);
			waiting.push(resolve);
		});
	}
	var _wgpuCommandEncoderBeginComputePass = (encoderPtr, descriptor) => {
		var desc;
		if (descriptor) {
			desc = {
				label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
				timestampWrites: WebGPU.makePassTimestampWrites(
					(growMemViews(), HEAPU32)[(descriptor + 12) >> 2],
				),
			};
		}
		var commandEncoder = WebGPU.getJsObject(encoderPtr);
		var ptr = _emwgpuCreateComputePassEncoder(0);
		WebGPU.Internals.jsObjectInsert(ptr, commandEncoder.beginComputePass(desc));
		return ptr;
	};
	var _wgpuCommandEncoderBeginRenderPass = (encoderPtr, descriptor) => {
		function makeColorAttachment(caPtr) {
			var viewPtr = (growMemViews(), HEAPU32)[(caPtr + 4) >> 2];
			if (viewPtr === 0) {
				return undefined;
			}
			var depthSlice = (growMemViews(), HEAP32)[(caPtr + 8) >> 2];
			if (depthSlice == -1) depthSlice = undefined;
			var loadOpInt = (growMemViews(), HEAPU32)[(caPtr + 16) >> 2];
			var storeOpInt = (growMemViews(), HEAPU32)[(caPtr + 20) >> 2];
			var clearValue = WebGPU.makeColor(caPtr + 24);
			return {
				view: WebGPU.getJsObject(viewPtr),
				depthSlice,
				resolveTarget: WebGPU.getJsObject(
					(growMemViews(), HEAPU32)[(caPtr + 12) >> 2],
				),
				clearValue,
				loadOp: WebGPU.LoadOp[loadOpInt],
				storeOp: WebGPU.StoreOp[storeOpInt],
			};
		}
		function makeColorAttachments(count, caPtr) {
			var attachments = [];
			for (var i = 0; i < count; ++i) {
				attachments.push(makeColorAttachment(caPtr + 56 * i));
			}
			return attachments;
		}
		function makeDepthStencilAttachment(dsaPtr) {
			if (dsaPtr === 0) return undefined;
			return {
				view: WebGPU.getJsObject((growMemViews(), HEAPU32)[(dsaPtr + 4) >> 2]),
				depthClearValue: ((value) => (Number.isNaN(value) ? undefined : value))(
					(growMemViews(), HEAPF32)[(dsaPtr + 16) >> 2],
				),
				depthLoadOp:
					WebGPU.LoadOp[(growMemViews(), HEAPU32)[(dsaPtr + 8) >> 2]],
				depthStoreOp:
					WebGPU.StoreOp[(growMemViews(), HEAPU32)[(dsaPtr + 12) >> 2]],
				depthReadOnly: !!(growMemViews(), HEAPU32)[(dsaPtr + 20) >> 2],
				stencilClearValue: (growMemViews(), HEAPU32)[(dsaPtr + 32) >> 2],
				stencilLoadOp:
					WebGPU.LoadOp[(growMemViews(), HEAPU32)[(dsaPtr + 24) >> 2]],
				stencilStoreOp:
					WebGPU.StoreOp[(growMemViews(), HEAPU32)[(dsaPtr + 28) >> 2]],
				stencilReadOnly: !!(growMemViews(), HEAPU32)[(dsaPtr + 36) >> 2],
			};
		}
		function makeRenderPassDescriptor(descriptor) {
			var nextInChainPtr = (growMemViews(), HEAPU32)[descriptor >> 2];
			var maxDrawCount = undefined;
			if (nextInChainPtr !== 0) {
				var sType = (growMemViews(), HEAPU32)[(nextInChainPtr + 4) >> 2];
				var renderPassMaxDrawCount = nextInChainPtr;
				maxDrawCount =
					(growMemViews(), HEAPU32)[(renderPassMaxDrawCount + 4 + 8) >> 2] *
						4294967296 +
					(growMemViews(), HEAPU32)[(renderPassMaxDrawCount + 8) >> 2];
			}
			var desc = {
				label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
				colorAttachments: makeColorAttachments(
					(growMemViews(), HEAPU32)[(descriptor + 12) >> 2],
					(growMemViews(), HEAPU32)[(descriptor + 16) >> 2],
				),
				depthStencilAttachment: makeDepthStencilAttachment(
					(growMemViews(), HEAPU32)[(descriptor + 20) >> 2],
				),
				occlusionQuerySet: WebGPU.getJsObject(
					(growMemViews(), HEAPU32)[(descriptor + 24) >> 2],
				),
				timestampWrites: WebGPU.makePassTimestampWrites(
					(growMemViews(), HEAPU32)[(descriptor + 28) >> 2],
				),
				maxDrawCount,
			};
			return desc;
		}
		var desc = makeRenderPassDescriptor(descriptor);
		var commandEncoder = WebGPU.getJsObject(encoderPtr);
		var ptr = _emwgpuCreateRenderPassEncoder(0);
		WebGPU.Internals.jsObjectInsert(ptr, commandEncoder.beginRenderPass(desc));
		return ptr;
	};
	function _wgpuCommandEncoderClearBuffer(encoderPtr, bufferPtr, offset, size) {
		offset = bigintToI53Checked(offset);
		size = bigintToI53Checked(size);
		var commandEncoder = WebGPU.getJsObject(encoderPtr);
		if (size == -1) size = undefined;
		var buffer = WebGPU.getJsObject(bufferPtr);
		commandEncoder.clearBuffer(buffer, offset, size);
	}
	function _wgpuCommandEncoderCopyBufferToBuffer(
		encoderPtr,
		srcPtr,
		srcOffset,
		dstPtr,
		dstOffset,
		size,
	) {
		srcOffset = bigintToI53Checked(srcOffset);
		dstOffset = bigintToI53Checked(dstOffset);
		size = bigintToI53Checked(size);
		var commandEncoder = WebGPU.getJsObject(encoderPtr);
		var src = WebGPU.getJsObject(srcPtr);
		var dst = WebGPU.getJsObject(dstPtr);
		commandEncoder.copyBufferToBuffer(src, srcOffset, dst, dstOffset, size);
	}
	var _wgpuCommandEncoderCopyBufferToTexture = (
		encoderPtr,
		srcPtr,
		dstPtr,
		copySizePtr,
	) => {
		var commandEncoder = WebGPU.getJsObject(encoderPtr);
		var copySize = WebGPU.makeExtent3D(copySizePtr);
		commandEncoder.copyBufferToTexture(
			WebGPU.makeTexelCopyBufferInfo(srcPtr),
			WebGPU.makeTexelCopyTextureInfo(dstPtr),
			copySize,
		);
	};
	var _wgpuCommandEncoderCopyTextureToBuffer = (
		encoderPtr,
		srcPtr,
		dstPtr,
		copySizePtr,
	) => {
		var commandEncoder = WebGPU.getJsObject(encoderPtr);
		var copySize = WebGPU.makeExtent3D(copySizePtr);
		commandEncoder.copyTextureToBuffer(
			WebGPU.makeTexelCopyTextureInfo(srcPtr),
			WebGPU.makeTexelCopyBufferInfo(dstPtr),
			copySize,
		);
	};
	var _wgpuCommandEncoderCopyTextureToTexture = (
		encoderPtr,
		srcPtr,
		dstPtr,
		copySizePtr,
	) => {
		var commandEncoder = WebGPU.getJsObject(encoderPtr);
		var copySize = WebGPU.makeExtent3D(copySizePtr);
		commandEncoder.copyTextureToTexture(
			WebGPU.makeTexelCopyTextureInfo(srcPtr),
			WebGPU.makeTexelCopyTextureInfo(dstPtr),
			copySize,
		);
	};
	var _wgpuCommandEncoderFinish = (encoderPtr, descriptor) => {
		var commandEncoder = WebGPU.getJsObject(encoderPtr);
		var ptr = _emwgpuCreateCommandBuffer(0);
		WebGPU.Internals.jsObjectInsert(ptr, commandEncoder.finish());
		return ptr;
	};
	function _wgpuCommandEncoderResolveQuerySet(
		encoderPtr,
		querySetPtr,
		firstQuery,
		queryCount,
		destinationPtr,
		destinationOffset,
	) {
		destinationOffset = bigintToI53Checked(destinationOffset);
		var commandEncoder = WebGPU.getJsObject(encoderPtr);
		var querySet = WebGPU.getJsObject(querySetPtr);
		var destination = WebGPU.getJsObject(destinationPtr);
		commandEncoder.resolveQuerySet(
			querySet,
			firstQuery,
			queryCount,
			destination,
			destinationOffset,
		);
	}
	var _wgpuComputePassEncoderDispatchWorkgroups = (passPtr, x, y, z) => {
		var pass = WebGPU.getJsObject(passPtr);
		pass.dispatchWorkgroups(x, y, z);
	};
	var _wgpuComputePassEncoderEnd = (passPtr) => {
		var pass = WebGPU.getJsObject(passPtr);
		pass.end();
	};
	var _wgpuComputePassEncoderSetBindGroup = (
		passPtr,
		groupIndex,
		groupPtr,
		dynamicOffsetCount,
		dynamicOffsetsPtr,
	) => {
		var pass = WebGPU.getJsObject(passPtr);
		var group = WebGPU.getJsObject(groupPtr);
		if (dynamicOffsetCount == 0) {
			pass.setBindGroup(groupIndex, group);
		} else {
			pass.setBindGroup(
				groupIndex,
				group,
				(growMemViews(), HEAPU32),
				dynamicOffsetsPtr >> 2,
				dynamicOffsetCount,
			);
		}
	};
	var _wgpuComputePassEncoderSetPipeline = (passPtr, pipelinePtr) => {
		var pass = WebGPU.getJsObject(passPtr);
		var pipeline = WebGPU.getJsObject(pipelinePtr);
		pass.setPipeline(pipeline);
	};
	var readI53FromI64 = (ptr) =>
		(growMemViews(), HEAPU32)[ptr >> 2] +
		(growMemViews(), HEAP32)[(ptr + 4) >> 2] * 4294967296;
	var _wgpuDeviceCreateBindGroup = (devicePtr, descriptor) => {
		function makeEntry(entryPtr) {
			var bufferPtr = (growMemViews(), HEAPU32)[(entryPtr + 8) >> 2];
			var samplerPtr = (growMemViews(), HEAPU32)[(entryPtr + 32) >> 2];
			var textureViewPtr = (growMemViews(), HEAPU32)[(entryPtr + 36) >> 2];
			var binding = (growMemViews(), HEAPU32)[(entryPtr + 4) >> 2];
			if (bufferPtr) {
				var size = readI53FromI64(entryPtr + 24);
				if (size == -1) size = undefined;
				return {
					binding,
					resource: {
						buffer: WebGPU.getJsObject(bufferPtr),
						offset:
							(growMemViews(), HEAPU32)[(entryPtr + 4 + 16) >> 2] * 4294967296 +
							(growMemViews(), HEAPU32)[(entryPtr + 16) >> 2],
						size,
					},
				};
			} else if (samplerPtr) {
				return { binding, resource: WebGPU.getJsObject(samplerPtr) };
			} else {
				return { binding, resource: WebGPU.getJsObject(textureViewPtr) };
			}
		}
		function makeEntries(count, entriesPtrs) {
			var entries = [];
			for (var i = 0; i < count; ++i) {
				entries.push(makeEntry(entriesPtrs + 40 * i));
			}
			return entries;
		}
		var desc = {
			label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
			layout: WebGPU.getJsObject(
				(growMemViews(), HEAPU32)[(descriptor + 12) >> 2],
			),
			entries: makeEntries(
				(growMemViews(), HEAPU32)[(descriptor + 16) >> 2],
				(growMemViews(), HEAPU32)[(descriptor + 20) >> 2],
			),
		};
		var device = WebGPU.getJsObject(devicePtr);
		var ptr = _emwgpuCreateBindGroup(0);
		WebGPU.Internals.jsObjectInsert(ptr, device.createBindGroup(desc));
		return ptr;
	};
	var _wgpuDeviceCreateBindGroupLayout = (devicePtr, descriptor) => {
		function makeBufferEntry(entryPtr) {
			var typeInt = (growMemViews(), HEAPU32)[(entryPtr + 4) >> 2];
			if (!typeInt) return undefined;
			return {
				type: WebGPU.BufferBindingType[typeInt],
				hasDynamicOffset: !!(growMemViews(), HEAPU32)[(entryPtr + 8) >> 2],
				minBindingSize:
					(growMemViews(), HEAPU32)[(entryPtr + 4 + 16) >> 2] * 4294967296 +
					(growMemViews(), HEAPU32)[(entryPtr + 16) >> 2],
			};
		}
		function makeSamplerEntry(entryPtr) {
			var typeInt = (growMemViews(), HEAPU32)[(entryPtr + 4) >> 2];
			if (!typeInt) return undefined;
			return { type: WebGPU.SamplerBindingType[typeInt] };
		}
		function makeTextureEntry(entryPtr) {
			var sampleTypeInt = (growMemViews(), HEAPU32)[(entryPtr + 4) >> 2];
			if (!sampleTypeInt) return undefined;
			return {
				sampleType: WebGPU.TextureSampleType[sampleTypeInt],
				viewDimension:
					WebGPU.TextureViewDimension[
						(growMemViews(), HEAPU32)[(entryPtr + 8) >> 2]
					],
				multisampled: !!(growMemViews(), HEAPU32)[(entryPtr + 12) >> 2],
			};
		}
		function makeStorageTextureEntry(entryPtr) {
			var accessInt = (growMemViews(), HEAPU32)[(entryPtr + 4) >> 2];
			if (!accessInt) return undefined;
			return {
				access: WebGPU.StorageTextureAccess[accessInt],
				format:
					WebGPU.TextureFormat[(growMemViews(), HEAPU32)[(entryPtr + 8) >> 2]],
				viewDimension:
					WebGPU.TextureViewDimension[
						(growMemViews(), HEAPU32)[(entryPtr + 12) >> 2]
					],
			};
		}
		function makeEntry(entryPtr) {
			return {
				binding: (growMemViews(), HEAPU32)[(entryPtr + 4) >> 2],
				visibility: (growMemViews(), HEAPU32)[(entryPtr + 8) >> 2],
				buffer: makeBufferEntry(entryPtr + 24),
				sampler: makeSamplerEntry(entryPtr + 48),
				texture: makeTextureEntry(entryPtr + 56),
				storageTexture: makeStorageTextureEntry(entryPtr + 72),
			};
		}
		function makeEntries(count, entriesPtrs) {
			var entries = [];
			for (var i = 0; i < count; ++i) {
				entries.push(makeEntry(entriesPtrs + 88 * i));
			}
			return entries;
		}
		var desc = {
			label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
			entries: makeEntries(
				(growMemViews(), HEAPU32)[(descriptor + 12) >> 2],
				(growMemViews(), HEAPU32)[(descriptor + 16) >> 2],
			),
		};
		var device = WebGPU.getJsObject(devicePtr);
		var ptr = _emwgpuCreateBindGroupLayout(0);
		WebGPU.Internals.jsObjectInsert(ptr, device.createBindGroupLayout(desc));
		return ptr;
	};
	var _wgpuDeviceCreateCommandEncoder = (devicePtr, descriptor) => {
		var desc;
		if (descriptor) {
			desc = { label: WebGPU.makeStringFromOptionalStringView(descriptor + 4) };
		}
		var device = WebGPU.getJsObject(devicePtr);
		var ptr = _emwgpuCreateCommandEncoder(0);
		WebGPU.Internals.jsObjectInsert(ptr, device.createCommandEncoder(desc));
		return ptr;
	};
	var _wgpuDeviceCreateComputePipeline = (devicePtr, descriptor) => {
		var desc = WebGPU.makeComputePipelineDesc(descriptor);
		var device = WebGPU.getJsObject(devicePtr);
		var ptr = _emwgpuCreateComputePipeline(0);
		WebGPU.Internals.jsObjectInsert(ptr, device.createComputePipeline(desc));
		return ptr;
	};
	var _wgpuDeviceCreatePipelineLayout = (devicePtr, descriptor) => {
		var bglCount = (growMemViews(), HEAPU32)[(descriptor + 12) >> 2];
		var bglPtr = (growMemViews(), HEAPU32)[(descriptor + 16) >> 2];
		var bgls = [];
		for (var i = 0; i < bglCount; ++i) {
			bgls.push(
				WebGPU.getJsObject((growMemViews(), HEAPU32)[(bglPtr + 4 * i) >> 2]),
			);
		}
		var desc = {
			label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
			bindGroupLayouts: bgls,
		};
		var device = WebGPU.getJsObject(devicePtr);
		var ptr = _emwgpuCreatePipelineLayout(0);
		WebGPU.Internals.jsObjectInsert(ptr, device.createPipelineLayout(desc));
		return ptr;
	};
	var _wgpuDeviceCreateQuerySet = (devicePtr, descriptor) => {
		var desc = {
			type: WebGPU.QueryType[(growMemViews(), HEAPU32)[(descriptor + 12) >> 2]],
			count: (growMemViews(), HEAPU32)[(descriptor + 16) >> 2],
		};
		var device = WebGPU.getJsObject(devicePtr);
		var ptr = _emwgpuCreateQuerySet(0);
		WebGPU.Internals.jsObjectInsert(ptr, device.createQuerySet(desc));
		return ptr;
	};
	var _wgpuDeviceCreateRenderPipeline = (devicePtr, descriptor) => {
		var desc = WebGPU.makeRenderPipelineDesc(descriptor);
		var device = WebGPU.getJsObject(devicePtr);
		var ptr = _emwgpuCreateRenderPipeline(0);
		WebGPU.Internals.jsObjectInsert(ptr, device.createRenderPipeline(desc));
		return ptr;
	};
	var _wgpuDeviceCreateSampler = (devicePtr, descriptor) => {
		var desc;
		if (descriptor) {
			desc = {
				label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
				addressModeU:
					WebGPU.AddressMode[(growMemViews(), HEAPU32)[(descriptor + 12) >> 2]],
				addressModeV:
					WebGPU.AddressMode[(growMemViews(), HEAPU32)[(descriptor + 16) >> 2]],
				addressModeW:
					WebGPU.AddressMode[(growMemViews(), HEAPU32)[(descriptor + 20) >> 2]],
				magFilter:
					WebGPU.FilterMode[(growMemViews(), HEAPU32)[(descriptor + 24) >> 2]],
				minFilter:
					WebGPU.FilterMode[(growMemViews(), HEAPU32)[(descriptor + 28) >> 2]],
				mipmapFilter:
					WebGPU.MipmapFilterMode[
						(growMemViews(), HEAPU32)[(descriptor + 32) >> 2]
					],
				lodMinClamp: (growMemViews(), HEAPF32)[(descriptor + 36) >> 2],
				lodMaxClamp: (growMemViews(), HEAPF32)[(descriptor + 40) >> 2],
				compare:
					WebGPU.CompareFunction[
						(growMemViews(), HEAPU32)[(descriptor + 44) >> 2]
					],
				maxAnisotropy: (growMemViews(), HEAPU16)[(descriptor + 48) >> 1],
			};
		}
		var device = WebGPU.getJsObject(devicePtr);
		var ptr = _emwgpuCreateSampler(0);
		WebGPU.Internals.jsObjectInsert(ptr, device.createSampler(desc));
		return ptr;
	};
	var _wgpuDeviceCreateTexture = (devicePtr, descriptor) => {
		var desc = {
			label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
			size: WebGPU.makeExtent3D(descriptor + 28),
			mipLevelCount: (growMemViews(), HEAPU32)[(descriptor + 44) >> 2],
			sampleCount: (growMemViews(), HEAPU32)[(descriptor + 48) >> 2],
			dimension:
				WebGPU.TextureDimension[
					(growMemViews(), HEAPU32)[(descriptor + 24) >> 2]
				],
			format:
				WebGPU.TextureFormat[(growMemViews(), HEAPU32)[(descriptor + 40) >> 2]],
			usage: (growMemViews(), HEAPU32)[(descriptor + 16) >> 2],
		};
		var viewFormatCount = (growMemViews(), HEAPU32)[(descriptor + 52) >> 2];
		if (viewFormatCount) {
			var viewFormatsPtr = (growMemViews(), HEAPU32)[(descriptor + 56) >> 2];
			desc["viewFormats"] = Array.from(
				(growMemViews(), HEAP32).subarray(
					viewFormatsPtr >> 2,
					(viewFormatsPtr + viewFormatCount * 4) >> 2,
				),
				(format) => WebGPU.TextureFormat[format],
			);
		}
		var device = WebGPU.getJsObject(devicePtr);
		var ptr = _emwgpuCreateTexture(0);
		WebGPU.Internals.jsObjectInsert(ptr, device.createTexture(desc));
		return ptr;
	};
	var _wgpuDeviceGetLimits = (devicePtr, limitsOutPtr) => {
		var device = WebGPU.getJsObject(devicePtr);
		WebGPU.fillLimitStruct(device.limits, limitsOutPtr);
		return 1;
	};
	var _wgpuDeviceHasFeature = (devicePtr, featureEnumValue) => {
		var device = WebGPU.getJsObject(devicePtr);
		return device.features.has(WebGPU.FeatureName[featureEnumValue]);
	};
	var _wgpuInstanceCreateSurface = (instancePtr, descriptor) => {
		var nextInChainPtr = (growMemViews(), HEAPU32)[descriptor >> 2];
		var sourceCanvasHTMLSelector = nextInChainPtr;
		var selectorPtr = (growMemViews(), HEAPU32)[
			(sourceCanvasHTMLSelector + 8) >> 2
		];
		var canvas = findCanvasEventTarget(selectorPtr);
		var context = canvas.getContext("webgpu");
		if (!context) return 0;
		context.surfaceLabelWebGPU = WebGPU.makeStringFromOptionalStringView(
			descriptor + 4,
		);
		var ptr = _emwgpuCreateSurface(0);
		WebGPU.Internals.jsObjectInsert(ptr, context);
		return ptr;
	};
	var _wgpuQuerySetDestroy = (querySetPtr) => {
		WebGPU.getJsObject(querySetPtr).destroy();
	};
	var _wgpuQueueSubmit = (queuePtr, commandCount, commands) => {
		var queue = WebGPU.getJsObject(queuePtr);
		var cmds = Array.from(
			(growMemViews(), HEAP32).subarray(
				commands >> 2,
				(commands + commandCount * 4) >> 2,
			),
			(id) => WebGPU.getJsObject(id),
		);
		queue.submit(cmds);
	};
	function _wgpuQueueWriteBuffer(
		queuePtr,
		bufferPtr,
		bufferOffset,
		data,
		size,
	) {
		bufferOffset = bigintToI53Checked(bufferOffset);
		var queue = WebGPU.getJsObject(queuePtr);
		var buffer = WebGPU.getJsObject(bufferPtr);
		var subarray = (growMemViews(), HEAPU8).subarray(data, data + size);
		queue.writeBuffer(buffer, bufferOffset, subarray, 0, size);
	}
	var _wgpuQueueWriteTexture = (
		queuePtr,
		destinationPtr,
		data,
		dataSize,
		dataLayoutPtr,
		writeSizePtr,
	) => {
		var queue = WebGPU.getJsObject(queuePtr);
		var destination = WebGPU.makeTexelCopyTextureInfo(destinationPtr);
		var dataLayout = WebGPU.makeTexelCopyBufferLayout(dataLayoutPtr);
		var writeSize = WebGPU.makeExtent3D(writeSizePtr);
		var subarray = (growMemViews(), HEAPU8).subarray(data, data + dataSize);
		queue.writeTexture(destination, subarray, dataLayout, writeSize);
	};
	var _wgpuRenderPassEncoderBeginOcclusionQuery = (passPtr, queryIndex) => {
		var pass = WebGPU.getJsObject(passPtr);
		pass.beginOcclusionQuery(queryIndex);
	};
	var _wgpuRenderPassEncoderDraw = (
		passPtr,
		vertexCount,
		instanceCount,
		firstVertex,
		firstInstance,
	) => {
		firstVertex >>>= 0;
		firstInstance >>>= 0;
		var pass = WebGPU.getJsObject(passPtr);
		pass.draw(vertexCount, instanceCount, firstVertex, firstInstance);
	};
	var _wgpuRenderPassEncoderDrawIndexed = (
		passPtr,
		indexCount,
		instanceCount,
		firstIndex,
		baseVertex,
		firstInstance,
	) => {
		firstIndex >>>= 0;
		firstInstance >>>= 0;
		var pass = WebGPU.getJsObject(passPtr);
		pass.drawIndexed(
			indexCount,
			instanceCount,
			firstIndex,
			baseVertex,
			firstInstance,
		);
	};
	var _wgpuRenderPassEncoderEnd = (encoderPtr) => {
		var encoder = WebGPU.getJsObject(encoderPtr);
		encoder.end();
	};
	var _wgpuRenderPassEncoderEndOcclusionQuery = (passPtr) => {
		var pass = WebGPU.getJsObject(passPtr);
		pass.endOcclusionQuery();
	};
	var _wgpuRenderPassEncoderSetBindGroup = (
		passPtr,
		groupIndex,
		groupPtr,
		dynamicOffsetCount,
		dynamicOffsetsPtr,
	) => {
		var pass = WebGPU.getJsObject(passPtr);
		var group = WebGPU.getJsObject(groupPtr);
		if (dynamicOffsetCount == 0) {
			pass.setBindGroup(groupIndex, group);
		} else {
			pass.setBindGroup(
				groupIndex,
				group,
				(growMemViews(), HEAPU32),
				dynamicOffsetsPtr >> 2,
				dynamicOffsetCount,
			);
		}
	};
	var _wgpuRenderPassEncoderSetBlendConstant = (passPtr, colorPtr) => {
		var pass = WebGPU.getJsObject(passPtr);
		var color = WebGPU.makeColor(colorPtr);
		pass.setBlendConstant(color);
	};
	function _wgpuRenderPassEncoderSetIndexBuffer(
		passPtr,
		bufferPtr,
		format,
		offset,
		size,
	) {
		offset = bigintToI53Checked(offset);
		size = bigintToI53Checked(size);
		var pass = WebGPU.getJsObject(passPtr);
		var buffer = WebGPU.getJsObject(bufferPtr);
		if (size == -1) size = undefined;
		pass.setIndexBuffer(buffer, WebGPU.IndexFormat[format], offset, size);
	}
	var _wgpuRenderPassEncoderSetPipeline = (passPtr, pipelinePtr) => {
		var pass = WebGPU.getJsObject(passPtr);
		var pipeline = WebGPU.getJsObject(pipelinePtr);
		pass.setPipeline(pipeline);
	};
	var _wgpuRenderPassEncoderSetScissorRect = (passPtr, x, y, w, h) => {
		var pass = WebGPU.getJsObject(passPtr);
		pass.setScissorRect(x, y, w, h);
	};
	var _wgpuRenderPassEncoderSetStencilReference = (passPtr, reference) => {
		reference >>>= 0;
		var pass = WebGPU.getJsObject(passPtr);
		pass.setStencilReference(reference);
	};
	function _wgpuRenderPassEncoderSetVertexBuffer(
		passPtr,
		slot,
		bufferPtr,
		offset,
		size,
	) {
		offset = bigintToI53Checked(offset);
		size = bigintToI53Checked(size);
		var pass = WebGPU.getJsObject(passPtr);
		var buffer = WebGPU.getJsObject(bufferPtr);
		if (size == -1) size = undefined;
		pass.setVertexBuffer(slot, buffer, offset, size);
	}
	var _wgpuRenderPassEncoderSetViewport = (
		passPtr,
		x,
		y,
		w,
		h,
		minDepth,
		maxDepth,
	) => {
		var pass = WebGPU.getJsObject(passPtr);
		pass.setViewport(x, y, w, h, minDepth, maxDepth);
	};
	var _wgpuRenderPipelineGetBindGroupLayout = (pipelinePtr, groupIndex) => {
		var pipeline = WebGPU.getJsObject(pipelinePtr);
		var ptr = _emwgpuCreateBindGroupLayout(0);
		WebGPU.Internals.jsObjectInsert(
			ptr,
			pipeline.getBindGroupLayout(groupIndex),
		);
		return ptr;
	};
	var _wgpuSurfaceConfigure = (surfacePtr, config) => {
		var devicePtr = (growMemViews(), HEAPU32)[(config + 4) >> 2];
		var context = WebGPU.getJsObject(surfacePtr);
		var canvasSize = [
			(growMemViews(), HEAPU32)[(config + 24) >> 2],
			(growMemViews(), HEAPU32)[(config + 28) >> 2],
		];
		if (canvasSize[0] !== 0) {
			context["canvas"]["width"] = canvasSize[0];
		}
		if (canvasSize[1] !== 0) {
			context["canvas"]["height"] = canvasSize[1];
		}
		var configuration = {
			device: WebGPU.getJsObject(devicePtr),
			format:
				WebGPU.TextureFormat[(growMemViews(), HEAPU32)[(config + 8) >> 2]],
			usage: (growMemViews(), HEAPU32)[(config + 16) >> 2],
			alphaMode:
				WebGPU.CompositeAlphaMode[
					(growMemViews(), HEAPU32)[(config + 40) >> 2]
				],
		};
		var viewFormatCount = (growMemViews(), HEAPU32)[(config + 32) >> 2];
		if (viewFormatCount) {
			var viewFormatsPtr = (growMemViews(), HEAPU32)[(config + 36) >> 2];
			configuration["viewFormats"] = Array.from(
				(growMemViews(), HEAP32).subarray(
					viewFormatsPtr >> 2,
					(viewFormatsPtr + viewFormatCount * 4) >> 2,
				),
				(format) => WebGPU.TextureFormat[format],
			);
		}
		{
			var nextInChainPtr = (growMemViews(), HEAPU32)[config >> 2];
			if (nextInChainPtr !== 0) {
				var sType = (growMemViews(), HEAPU32)[(nextInChainPtr + 4) >> 2];
				var surfaceColorManagement = nextInChainPtr;
				configuration.colorSpace =
					WebGPU.PredefinedColorSpace[
						(growMemViews(), HEAPU32)[(surfaceColorManagement + 8) >> 2]
					];
				configuration.toneMapping = {
					mode: WebGPU.ToneMappingMode[
						(growMemViews(), HEAPU32)[(surfaceColorManagement + 12) >> 2]
					],
				};
			}
		}
		context.configure(configuration);
	};
	var _wgpuSurfaceGetCurrentTexture = (surfacePtr, surfaceTexturePtr) => {
		var context = WebGPU.getJsObject(surfacePtr);
		try {
			var texturePtr = _emwgpuCreateTexture(0);
			WebGPU.Internals.jsObjectInsert(texturePtr, context.getCurrentTexture());
			(growMemViews(), HEAPU32)[(surfaceTexturePtr + 4) >> 2] = texturePtr;
			(growMemViews(), HEAP32)[(surfaceTexturePtr + 8) >> 2] = 1;
		} catch (ex) {
			(growMemViews(), HEAPU32)[(surfaceTexturePtr + 4) >> 2] = 0;
			(growMemViews(), HEAP32)[(surfaceTexturePtr + 8) >> 2] = 6;
		}
	};
	var _wgpuTextureCreateView = (texturePtr, descriptor) => {
		var desc;
		if (descriptor) {
			var mipLevelCount = (growMemViews(), HEAPU32)[(descriptor + 24) >> 2];
			var arrayLayerCount = (growMemViews(), HEAPU32)[(descriptor + 32) >> 2];
			desc = {
				label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
				format:
					WebGPU.TextureFormat[
						(growMemViews(), HEAPU32)[(descriptor + 12) >> 2]
					],
				dimension:
					WebGPU.TextureViewDimension[
						(growMemViews(), HEAPU32)[(descriptor + 16) >> 2]
					],
				baseMipLevel: (growMemViews(), HEAPU32)[(descriptor + 20) >> 2],
				mipLevelCount: mipLevelCount === 4294967295 ? undefined : mipLevelCount,
				baseArrayLayer: (growMemViews(), HEAPU32)[(descriptor + 28) >> 2],
				arrayLayerCount:
					arrayLayerCount === 4294967295 ? undefined : arrayLayerCount,
				aspect:
					WebGPU.TextureAspect[
						(growMemViews(), HEAPU32)[(descriptor + 36) >> 2]
					],
			};
		}
		var texture = WebGPU.getJsObject(texturePtr);
		var ptr = _emwgpuCreateTextureView(0);
		WebGPU.Internals.jsObjectInsert(ptr, texture.createView(desc));
		return ptr;
	};
	var _wgpuTextureDestroy = (texturePtr) => {
		WebGPU.getJsObject(texturePtr).destroy();
	};
	var _wgpuTextureGetDepthOrArrayLayers = (texturePtr) => {
		var texture = WebGPU.getJsObject(texturePtr);
		return texture.depthOrArrayLayers;
	};
	var _wgpuTextureGetDimension = (texturePtr) => {
		var texture = WebGPU.getJsObject(texturePtr);
		return WebGPU.TextureDimension.indexOf(texture.dimension);
	};
	var _wgpuTextureGetHeight = (texturePtr) => {
		var texture = WebGPU.getJsObject(texturePtr);
		return texture.height;
	};
	var _wgpuTextureGetWidth = (texturePtr) => {
		var texture = WebGPU.getJsObject(texturePtr);
		return texture.width;
	};
	PThread.init();
	FS.createPreloadedFile = FS_createPreloadedFile;
	FS.preloadFile = FS_preloadFile;
	FS.staticInit();
	_gex_wgpu_jspi_wait = new WebAssembly.Suspending(_gex_wgpu_jspi_wait);
	addOnPostRun(function () {
		if (wasmExports["gex_wgpu_smoke"])
			Module["gexWgpuRaw"] = wasmExports["gex_wgpu_smoke"];
		if (wasmExports["hb"]) Module["gexGlSubmitRaw"] = wasmExports["hb"];
		if (wasmExports["gex_d3d_submit"])
			Module["gexD3dSubmitRaw"] = wasmExports["gex_d3d_submit"];
		if (wasmExports["__write_profile"])
			gexReportProfile(wasmExports["__write_profile"]);
	});
	function gexReportProfile(write) {
		var last = -1;
		var dump = function () {
			var need = write(0, 0);
			var at = _malloc(need);
			write(at, need);
			var n = (need - 8) >> 2,
				bits = new Uint8Array((n + 7) >> 3),
				hits = 0;
			if (typeof growMemViews == "function") growMemViews();
			var words = new Uint32Array(
				(growMemViews(), HEAPU8).slice(at + 8, at + 8 + n * 4).buffer,
			);
			_free(at);
			for (var i = 0; i < n; i++)
				if (words[i]) {
					bits[i >> 3] |= 1 << (i & 7);
					hits++;
				}
			if (hits === last) return;
			last = hits;
			for (var at0 = 0; at0 < bits.length; at0 += 2048) {
				var bin = "";
				for (var j = at0; j < Math.min(bits.length, at0 + 2048); j++)
					bin += String.fromCharCode(bits[j]);
				console.warn(
					"[gex-wgpu] mesa-profile " +
						n +
						" " +
						hits +
						" @" +
						at0 +
						" " +
						btoa(bin),
				);
			}
		};
		setInterval(dump, 2e3);
		Module["gexDumpProfile"] = dump;
	}
	{
		initMemory();
		if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
		if (Module["preloadPlugins"]) preloadPlugins = Module["preloadPlugins"];
		if (Module["print"]) out = Module["print"];
		if (Module["printErr"]) err = Module["printErr"];
		if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
		if (Module["loadSplitModule"]) loadSplitModule = Module["loadSplitModule"];
		if (Module["arguments"]) programArgs = Module["arguments"];
		if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
		if (Module["preInit"]) {
			if (typeof Module["preInit"] == "function")
				Module["preInit"] = [Module["preInit"]];
			while (Module["preInit"].length > 0) {
				Module["preInit"].shift()();
			}
		}
	}
	var proxiedFunctionTable = [
		_proc_exit,
		exitOnMainThread,
		pthreadCreateProxied,
		___syscall_fcntl64,
		___syscall_ioctl,
		___syscall_openat,
		__setitimer_js,
		setCanvasElementSizeMainThread,
		_environ_get,
		_environ_sizes_get,
		_fd_close,
		_fd_fdstat_get,
		_fd_read,
		_fd_seek,
		_fd_write,
	];
	var _gex_gl_set_api,
		_gex_gl_init,
		_gex_gl_submit,
		_gex_gl_setenv,
		_gex_gl_reply_len,
		_gex_gl_reply_data,
		_gex_gl_display,
		_gex_gl_surface_count,
		_gex_gl_surface_kind,
		_gex_gl_surface_id,
		_gex_gl_surface_token,
		_gex_gl_surface_client,
		_gex_gl_surface_frame,
		_gex_gl_surface_width,
		_gex_gl_surface_height,
		_gex_gl_surface_generation,
		_gex_gl_forget_client,
		_gex_gl_external_frame,
		_gex_gl_reject_op,
		_gex_gl_reject_why,
		_gex_gl_reject_payload,
		_gex_gl_reject_client,
		_gex_gl_attached_kind,
		_gex_gl_attached_id,
		_gex_gl_attached_token,
		_gex_gl_attached_generation,
		_gex_gl_presented,
		_gex_gl_surface_canvas,
		_gex_gl_produced,
		_emwgpuCreateBindGroup,
		_emwgpuCreateBindGroupLayout,
		_emwgpuCreateCommandBuffer,
		_emwgpuCreateCommandEncoder,
		_emwgpuCreateComputePassEncoder,
		_emwgpuCreateComputePipeline,
		_emwgpuCreatePipelineLayout,
		_emwgpuCreateQuerySet,
		_emwgpuCreateRenderBundle,
		_emwgpuCreateRenderBundleEncoder,
		_emwgpuCreateRenderPassEncoder,
		_emwgpuCreateRenderPipeline,
		_emwgpuCreateSampler,
		_emwgpuCreateSurface,
		_emwgpuCreateTexture,
		_emwgpuCreateTextureView,
		_emwgpuCreateAdapter,
		_emwgpuCreateBuffer,
		_emwgpuCreateDevice,
		_emwgpuCreateQueue,
		_emwgpuCreateShaderModule,
		_emwgpuOnMapAsyncCompleted,
		_wgpuDeviceAddRef,
		_free,
		_malloc,
		_pthread_self,
		_gex_wgsl_cache_load,
		_gex_wgsl_cache_budget,
		_gex_wgsl_cache_dump,
		_gex_wgsl_cache_stats,
		_gex_wgsl_cache_stats2,
		_emscripten_stack_set_limits,
		__emscripten_tls_init,
		__emscripten_thread_init,
		___set_thread_state,
		__emscripten_thread_crashed,
		__emscripten_run_js_on_main_thread_done,
		__emscripten_run_js_on_main_thread,
		__emscripten_thread_free_data,
		__emscripten_thread_exit,
		__emscripten_timeout,
		__emscripten_check_mailbox,
		_setThrew,
		__emscripten_stack_restore,
		__emscripten_stack_alloc,
		_emscripten_stack_get_current,
		__indirect_function_table,
		wasmTable;
	function assignWasmExports(wasmExports) {
		_gex_gl_set_api = Module["_gex_gl_set_api"] = wasmExports["fb"];
		_gex_gl_init = Module["_gex_gl_init"] = wasmExports["gb"];
		_gex_gl_submit = Module["_gex_gl_submit"] = wasmExports["hb"];
		_gex_gl_setenv = Module["_gex_gl_setenv"] = wasmExports["ib"];
		_gex_gl_reply_len = Module["_gex_gl_reply_len"] = wasmExports["jb"];
		_gex_gl_reply_data = Module["_gex_gl_reply_data"] = wasmExports["kb"];
		_gex_gl_display = Module["_gex_gl_display"] = wasmExports["lb"];
		_gex_gl_surface_count = Module["_gex_gl_surface_count"] = wasmExports["mb"];
		_gex_gl_surface_kind = Module["_gex_gl_surface_kind"] = wasmExports["nb"];
		_gex_gl_surface_id = Module["_gex_gl_surface_id"] = wasmExports["ob"];
		_gex_gl_surface_token = Module["_gex_gl_surface_token"] = wasmExports["pb"];
		_gex_gl_surface_client = Module["_gex_gl_surface_client"] =
			wasmExports["qb"];
		_gex_gl_surface_frame = Module["_gex_gl_surface_frame"] = wasmExports["rb"];
		_gex_gl_surface_width = Module["_gex_gl_surface_width"] = wasmExports["sb"];
		_gex_gl_surface_height = Module["_gex_gl_surface_height"] =
			wasmExports["tb"];
		_gex_gl_surface_generation = Module["_gex_gl_surface_generation"] =
			wasmExports["ub"];
		_gex_gl_forget_client = Module["_gex_gl_forget_client"] = wasmExports["vb"];
		_gex_gl_external_frame = Module["_gex_gl_external_frame"] =
			wasmExports["wb"];
		_gex_gl_reject_op = Module["_gex_gl_reject_op"] = wasmExports["xb"];
		_gex_gl_reject_why = Module["_gex_gl_reject_why"] = wasmExports["yb"];
		_gex_gl_reject_payload = Module["_gex_gl_reject_payload"] =
			wasmExports["zb"];
		_gex_gl_reject_client = Module["_gex_gl_reject_client"] = wasmExports["Ab"];
		_gex_gl_attached_kind = Module["_gex_gl_attached_kind"] = wasmExports["Bb"];
		_gex_gl_attached_id = Module["_gex_gl_attached_id"] = wasmExports["Cb"];
		_gex_gl_attached_token = Module["_gex_gl_attached_token"] =
			wasmExports["Db"];
		_gex_gl_attached_generation = Module["_gex_gl_attached_generation"] =
			wasmExports["Eb"];
		_gex_gl_presented = Module["_gex_gl_presented"] = wasmExports["Fb"];
		_gex_gl_surface_canvas = Module["_gex_gl_surface_canvas"] =
			wasmExports["Gb"];
		_gex_gl_produced = Module["_gex_gl_produced"] = wasmExports["Hb"];
		_emwgpuCreateBindGroup = wasmExports["Ib"];
		_emwgpuCreateBindGroupLayout = wasmExports["Jb"];
		_emwgpuCreateCommandBuffer = wasmExports["Kb"];
		_emwgpuCreateCommandEncoder = wasmExports["Lb"];
		_emwgpuCreateComputePassEncoder = wasmExports["Mb"];
		_emwgpuCreateComputePipeline = wasmExports["Nb"];
		_emwgpuCreatePipelineLayout = wasmExports["Ob"];
		_emwgpuCreateQuerySet = wasmExports["Pb"];
		_emwgpuCreateRenderBundle = wasmExports["Qb"];
		_emwgpuCreateRenderBundleEncoder = wasmExports["Rb"];
		_emwgpuCreateRenderPassEncoder = wasmExports["Sb"];
		_emwgpuCreateRenderPipeline = wasmExports["Tb"];
		_emwgpuCreateSampler = wasmExports["Ub"];
		_emwgpuCreateSurface = wasmExports["Vb"];
		_emwgpuCreateTexture = wasmExports["Wb"];
		_emwgpuCreateTextureView = wasmExports["Xb"];
		_emwgpuCreateAdapter = wasmExports["Yb"];
		_emwgpuCreateBuffer = wasmExports["Zb"];
		_emwgpuCreateDevice = wasmExports["_b"];
		_emwgpuCreateQueue = wasmExports["$b"];
		_emwgpuCreateShaderModule = wasmExports["ac"];
		_emwgpuOnMapAsyncCompleted = wasmExports["bc"];
		_wgpuDeviceAddRef = wasmExports["cc"];
		_free = Module["_free"] = wasmExports["dc"];
		_malloc = Module["_malloc"] = wasmExports["ec"];
		_pthread_self = wasmExports["fc"];
		_gex_wgsl_cache_load = Module["_gex_wgsl_cache_load"] = wasmExports["gc"];
		_gex_wgsl_cache_budget = Module["_gex_wgsl_cache_budget"] =
			wasmExports["hc"];
		_gex_wgsl_cache_dump = Module["_gex_wgsl_cache_dump"] = wasmExports["ic"];
		_gex_wgsl_cache_stats = Module["_gex_wgsl_cache_stats"] = wasmExports["jc"];
		_gex_wgsl_cache_stats2 = Module["_gex_wgsl_cache_stats2"] =
			wasmExports["kc"];
		_emscripten_stack_set_limits = wasmExports["lc"];
		__emscripten_tls_init = wasmExports["nc"];
		__emscripten_thread_init = wasmExports["oc"];
		___set_thread_state = wasmExports["pc"];
		__emscripten_thread_crashed = wasmExports["qc"];
		__emscripten_run_js_on_main_thread_done = wasmExports["rc"];
		__emscripten_run_js_on_main_thread = wasmExports["sc"];
		__emscripten_thread_free_data = wasmExports["tc"];
		__emscripten_thread_exit = wasmExports["uc"];
		__emscripten_timeout = wasmExports["vc"];
		__emscripten_check_mailbox = wasmExports["wc"];
		_setThrew = wasmExports["xc"];
		__emscripten_stack_restore = wasmExports["yc"];
		__emscripten_stack_alloc = wasmExports["zc"];
		_emscripten_stack_get_current = wasmExports["Ac"];
		__indirect_function_table = wasmTable = wasmExports["mc"];
	}
	var wasmImports;
	function assignWasmImports() {
		wasmImports = {
			db: ___call_sighandler,
			_: ___cxa_throw,
			cb: ___pthread_create_js,
			oa: ___syscall_fcntl64,
			bb: ___syscall_ioctl,
			na: ___syscall_openat,
			Va: __abort_js,
			Ua: __emscripten_get_progname,
			Ta: __emscripten_init_main_thread_js,
			Sa: __emscripten_log_formatted,
			Ra: __emscripten_notify_mailbox_postmessage,
			la: __emscripten_receive_on_main_thread_js,
			Qa: __emscripten_runtime_keepalive_clear,
			ka: __emscripten_thread_cleanup,
			Pa: __emscripten_thread_mailbox_await,
			Oa: __emscripten_thread_set_strongref,
			Na: __emscripten_throw_longjmp,
			Ma: __setitimer_js,
			La: __tzset_js,
			ab: _clock_time_get,
			ja: _emscripten_check_blocking_allowed,
			Ka: _emscripten_exit_with_live_runtime,
			c: _emscripten_get_now,
			Ja: _emscripten_resize_heap,
			ia: _emscripten_set_canvas_element_size,
			Y: _emscripten_webgpu_get_device,
			i: _emwgpuBufferDestroy,
			Ia: _emwgpuBufferMapAsync,
			u: _emwgpuBufferReadMappedRange,
			D: _emwgpuBufferUnmap,
			b: _emwgpuDelete,
			f: _emwgpuDeviceCreateBuffer,
			J: _emwgpuDeviceCreateShaderModule,
			Ha: _emwgpuDeviceDestroy,
			$a: _environ_get,
			_a: _environ_sizes_get,
			ha: _exit,
			Z: _fd_close,
			Za: _fd_fdstat_get,
			Ya: _fd_read,
			Xa: _fd_seek,
			ma: _fd_write,
			Ga: _gex_wgpu_jspi_signal,
			C: _gex_wgpu_jspi_wait,
			p: invoke_ii,
			I: invoke_iii,
			e: invoke_iiii,
			A: invoke_iiiii,
			ga: invoke_iiiiii,
			Fa: invoke_iiiiiii,
			Ea: invoke_iiiiiiii,
			o: invoke_jii,
			H: invoke_vi,
			t: invoke_vii,
			P: invoke_viii,
			Da: invoke_viiii,
			d: invoke_viiiii,
			a: wasmMemory,
			Wa: _proc_exit,
			fa: _stackRestore,
			Ca: _stackSave,
			X: _wgpuCommandEncoderBeginComputePass,
			y: _wgpuCommandEncoderBeginRenderPass,
			Ba: _wgpuCommandEncoderClearBuffer,
			l: _wgpuCommandEncoderCopyBufferToBuffer,
			O: _wgpuCommandEncoderCopyBufferToTexture,
			x: _wgpuCommandEncoderCopyTextureToBuffer,
			W: _wgpuCommandEncoderCopyTextureToTexture,
			h: _wgpuCommandEncoderFinish,
			Aa: _wgpuCommandEncoderResolveQuerySet,
			V: _wgpuComputePassEncoderDispatchWorkgroups,
			U: _wgpuComputePassEncoderEnd,
			G: _wgpuComputePassEncoderSetBindGroup,
			T: _wgpuComputePassEncoderSetPipeline,
			q: _wgpuDeviceCreateBindGroup,
			s: _wgpuDeviceCreateBindGroupLayout,
			j: _wgpuDeviceCreateCommandEncoder,
			N: _wgpuDeviceCreateComputePipeline,
			w: _wgpuDeviceCreatePipelineLayout,
			za: _wgpuDeviceCreateQuerySet,
			z: _wgpuDeviceCreateRenderPipeline,
			S: _wgpuDeviceCreateSampler,
			r: _wgpuDeviceCreateTexture,
			ya: _wgpuDeviceGetLimits,
			n: _wgpuDeviceHasFeature,
			ea: _wgpuInstanceCreateSurface,
			xa: _wgpuQuerySetDestroy,
			da: _wgpuQueueSubmit,
			k: _wgpuQueueWriteBuffer,
			R: _wgpuQueueWriteTexture,
			wa: _wgpuRenderPassEncoderBeginOcclusionQuery,
			B: _wgpuRenderPassEncoderDraw,
			M: _wgpuRenderPassEncoderDrawIndexed,
			m: _wgpuRenderPassEncoderEnd,
			va: _wgpuRenderPassEncoderEndOcclusionQuery,
			F: _wgpuRenderPassEncoderSetBindGroup,
			ua: _wgpuRenderPassEncoderSetBlendConstant,
			ta: _wgpuRenderPassEncoderSetIndexBuffer,
			E: _wgpuRenderPassEncoderSetPipeline,
			sa: _wgpuRenderPassEncoderSetScissorRect,
			ra: _wgpuRenderPassEncoderSetStencilReference,
			Q: _wgpuRenderPassEncoderSetVertexBuffer,
			ca: _wgpuRenderPassEncoderSetViewport,
			qa: _wgpuRenderPipelineGetBindGroupLayout,
			ba: _wgpuSurfaceConfigure,
			pa: _wgpuSurfaceGetCurrentTexture,
			g: _wgpuTextureCreateView,
			v: _wgpuTextureDestroy,
			aa: _wgpuTextureGetDepthOrArrayLayers,
			$: _wgpuTextureGetDimension,
			L: _wgpuTextureGetHeight,
			K: _wgpuTextureGetWidth,
		};
	}
	function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
		var sp = stackSave();
		try {
			return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
		} catch (e) {
			stackRestore(sp);
			if (!(e instanceof EmscriptenEH)) throw e;
			_setThrew(1, 0);
		}
	}
	function invoke_iiiii(index, a1, a2, a3, a4) {
		var sp = stackSave();
		try {
			return getWasmTableEntry(index)(a1, a2, a3, a4);
		} catch (e) {
			stackRestore(sp);
			if (!(e instanceof EmscriptenEH)) throw e;
			_setThrew(1, 0);
		}
	}
	function invoke_vi(index, a1) {
		var sp = stackSave();
		try {
			getWasmTableEntry(index)(a1);
		} catch (e) {
			stackRestore(sp);
			if (!(e instanceof EmscriptenEH)) throw e;
			_setThrew(1, 0);
		}
	}
	function invoke_iii(index, a1, a2) {
		var sp = stackSave();
		try {
			return getWasmTableEntry(index)(a1, a2);
		} catch (e) {
			stackRestore(sp);
			if (!(e instanceof EmscriptenEH)) throw e;
			_setThrew(1, 0);
		}
	}
	function invoke_ii(index, a1) {
		var sp = stackSave();
		try {
			return getWasmTableEntry(index)(a1);
		} catch (e) {
			stackRestore(sp);
			if (!(e instanceof EmscriptenEH)) throw e;
			_setThrew(1, 0);
		}
	}
	function invoke_viii(index, a1, a2, a3) {
		var sp = stackSave();
		try {
			getWasmTableEntry(index)(a1, a2, a3);
		} catch (e) {
			stackRestore(sp);
			if (!(e instanceof EmscriptenEH)) throw e;
			_setThrew(1, 0);
		}
	}
	function invoke_viiiii(index, a1, a2, a3, a4, a5) {
		var sp = stackSave();
		try {
			getWasmTableEntry(index)(a1, a2, a3, a4, a5);
		} catch (e) {
			stackRestore(sp);
			if (!(e instanceof EmscriptenEH)) throw e;
			_setThrew(1, 0);
		}
	}
	function invoke_iiii(index, a1, a2, a3) {
		var sp = stackSave();
		try {
			return getWasmTableEntry(index)(a1, a2, a3);
		} catch (e) {
			stackRestore(sp);
			if (!(e instanceof EmscriptenEH)) throw e;
			_setThrew(1, 0);
		}
	}
	function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
		var sp = stackSave();
		try {
			return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
		} catch (e) {
			stackRestore(sp);
			if (!(e instanceof EmscriptenEH)) throw e;
			_setThrew(1, 0);
		}
	}
	function invoke_jii(index, a1, a2) {
		var sp = stackSave();
		try {
			return getWasmTableEntry(index)(a1, a2);
		} catch (e) {
			stackRestore(sp);
			if (!(e instanceof EmscriptenEH)) throw e;
			_setThrew(1, 0);
			return 0n;
		}
	}
	function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
		var sp = stackSave();
		try {
			return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
		} catch (e) {
			stackRestore(sp);
			if (!(e instanceof EmscriptenEH)) throw e;
			_setThrew(1, 0);
		}
	}
	function invoke_vii(index, a1, a2) {
		var sp = stackSave();
		try {
			getWasmTableEntry(index)(a1, a2);
		} catch (e) {
			stackRestore(sp);
			if (!(e instanceof EmscriptenEH)) throw e;
			_setThrew(1, 0);
		}
	}
	function invoke_viiii(index, a1, a2, a3, a4) {
		var sp = stackSave();
		try {
			getWasmTableEntry(index)(a1, a2, a3, a4);
		} catch (e) {
			stackRestore(sp);
			if (!(e instanceof EmscriptenEH)) throw e;
			_setThrew(1, 0);
		}
	}
	async function run() {
		if (ENVIRONMENT_IS_PTHREAD) {
			initRuntime();
			return;
		}
		preRun();
		if (runDependencies > 0) {
			await new Promise((resolve) => (dependenciesFulfilled = resolve));
		}
		var setStatus = Module["setStatus"];
		if (setStatus) {
			setStatus("Running...");
			await new Promise((resolve) => setTimeout(resolve, 1));
			setTimeout(setStatus, 1, "");
		}
		if (ABORT) return;
		initRuntime();
		Module["onRuntimeInitialized"]?.();
		postRun();
	}
	var wasmExports;
	var wasmRawExports;
	if (!ENVIRONMENT_IS_PTHREAD) {
		wasmExports = await createWasm();
		await run();
	}
	return Module;
}
export default createGexWgpuReplay;
var isPthread = globalThis.name == "em-pthread";
isPthread && createGexWgpuReplay();
