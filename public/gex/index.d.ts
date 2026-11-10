// @gex/runtime: the System and the programs it runs. README.md says what
// each does; these are its shapes.

export type Env = Record<string, string> | string[];
export type Bytes = Uint8Array;
/** What the runtime takes as a file's or a tar's contents. */
export type Source =
	| Uint8Array
	| ArrayBuffer
	| ArrayBufferView
	| Blob
	| Response
	| ReadableStream<Uint8Array>
	| URL
	| string;
export type SignalName = keyof typeof SIGNALS | string;

export declare const SIGNALS: Readonly<{
	SIGHUP: 1;
	SIGINT: 2;
	SIGQUIT: 3;
	SIGILL: 4;
	SIGTRAP: 5;
	SIGABRT: 6;
	SIGBUS: 7;
	SIGFPE: 8;
	SIGKILL: 9;
	SIGUSR1: 10;
	SIGSEGV: 11;
	SIGUSR2: 12;
	SIGPIPE: 13;
	SIGALRM: 14;
	SIGTERM: 15;
	SIGCHLD: 17;
	SIGCONT: 18;
	SIGSTOP: 19;
	SIGTSTP: 20;
	SIGTTIN: 21;
	SIGTTOU: 22;
	SIGWINCH: 28;
}>;

export interface SystemOptions {
	/** The directory that holds `gex/` (default: beside the modules). */
	baseUrl?: string;
	/** Compiled function-tier units for the tree's images (`gexc cgen-image`'s
	 *  cache): a URL, or `{ url, require }`, where `require` fails an image
	 *  that has none. */
	units?: string | URL | { url: string | URL; require?: boolean };
	/** Keep translated code across loads (the origin's private file system). */
	xcache?: boolean;
	/** Switches for debugging (`{ strace: 1 }`, `{ console: true }`, `{ log: '1' }`
	 *  for the runtime's default lines); not a stable API. */
	debug?: Record<string, unknown>;
}

export interface SpawnOptions {
	/** A terminal; without one, three pipes. */
	pty?: { cols?: number; rows?: number; encoding?: string };
	/** The whole environment: nothing is inherited. */
	env?: Env;
	cwd?: string;
	uid?: number;
	gid?: number;
	/** No terminal and no pipes: output goes nowhere. */
	detached?: boolean;
}

export interface RunOptions extends Omit<SpawnOptions, "pty" | "detached"> {
	/** Written to the program's standard input, which is then closed. */
	input?: string | Uint8Array;
	/** Default 'utf-8'; null for bytes. */
	encoding?: string | null;
}

export interface RunResult<T = string> {
	code: number;
	signal: string | null;
	stdout: T;
	stderr: T;
}

export type Phase = "new" | "booting" | "running" | "stopped" | "failed";

export interface SystemState {
	phase: Phase;
	error: string | null;
	/** What the runtime said. */
	console: string;
	/** How the init ended, which stopped the system. */
	init?: { code: number; signal: string | null } | { error: string };
}

export interface HostCalls {
	/** `fn(value)` for a guest's call NAME on /dev/gex-host; returns a function that unregisters it. */
	register(name: string, fn: (value: unknown) => unknown): () => void;
	unregister(name: string): void;
	names(): string[];
}

export interface GuestConnection extends EventTarget {
	readable: ReadableStream<Uint8Array>;
	writable: WritableStream<Uint8Array>;
	close(): void;
}

export declare class System extends EventTarget {
	constructor(options?: SystemOptions);
	get state(): SystemState;
	/** With arguments (`spawn`'s), the program that is pid 1; without, pid 1 is the kernel's own. */
	boot(argv?: string[], options?: SpawnOptions): Promise<void>;
	/** Throws when the system has an init. */
	spawn(argv: string[], options?: SpawnOptions): Process;
	/** The init's Process, or null without one. */
	get init(): Process | null;
	run(
		argv: string[],
		options?: RunOptions & { encoding?: string },
	): Promise<RunResult<string>>;
	run(
		argv: string[],
		options: RunOptions & { encoding: null },
	): Promise<RunResult<Uint8Array>>;
	get hostCalls(): HostCalls;
	get net(): {
		connectGuest(
			port: number,
			options?: { host?: string },
		): Promise<GuestConnection>;
	};
	describe(): {
		phase: Phase;
		arch: string | null;
		processes: { pid: number | null; argv: string[] }[];
		pids: number[];
		threads: number;
		memory: { kernel: number };
	};
	shutdown(): Promise<void>;
}

export declare class DataEvent extends Event {
	readonly data: string | Uint8Array;
}

export declare class Pty extends EventTarget {
	/** A string or bytes, any size. */
	write(data: string | Uint8Array): void;
	/** The program hears SIGWINCH. */
	resize(cols: number, rows: number): void;
}

export declare class Process extends EventTarget {
	readonly argv: string[];
	/** Its pid, once it runs. */
	get pid(): number | null;
	/** Resolves with the pid; rejects when the program could not start (with `errno`). */
	readonly started: Promise<number>;
	readonly exited: Promise<{ code: number; signal: string | null }>;
	/** With a terminal. */
	readonly pty: Pty | null;
	/** Without a terminal. */
	readonly stdin: WritableStream<Uint8Array> | null;
	readonly stdout: ReadableStream<Uint8Array> | null;
	readonly stderr: ReadableStream<Uint8Array> | null;
	kill(signal?: SignalName | number): void;
	/** Its windows, with HostWindows. */
	windows(): import("./windows-host").GuestWindow[];
}
