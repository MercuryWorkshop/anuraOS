interface LibURIHandler {
	tag: "lib";
	pkg: string;
	version?: string;
	import: string;
}

type SplitArgMethod = {
	tag: "split";
	separator: RegExp | string;
};

type SingleArgMethod = {
	tag: "single";
};

interface AppURIHandler {
	tag: "app";
	pkg: string;
	method: SplitArgMethod | SingleArgMethod;
}

interface URIHandlerOptions {
	handler: LibURIHandler | AppURIHandler;
	prefix?: string;
}

/**
 * Public API for Anura's URI handler. Lets you register custom protocol
 * handlers and dispatch URIs to the registered handler.
 *
 * Available globally as `anura.uri`.
 */
class URIHandlerAPI {
	/**
	 * Handle a URI like `"protocol:something/etc"` by dispatching it to the
	 * handler registered for the URI's protocol.
	 *
	 * @param uri - The URI to be opened. The portion before the first `:` is
	 *   used as the protocol; everything after is passed to the handler.
	 *
	 * @throws If no handler has been registered for the URI's protocol.
	 *
	 * @example
	 * ```js
	 * anura.uri.handle("https://google.com"); // opens google.com in the default browser
	 * ```
	 */
	async handle(uri: string): Promise<void> {
		// const url = new URL(uri);
		// const protocol = url.protocol.slice(0, -1);
		const [protocol, ...path] = uri.split(":");
		const pathname = path.join(":");
		const handlers = anura.settings.get("URIHandlers") || {};
		const handler = handlers[protocol as string];
		if (!handler) {
			throw new Error(`No handler for URI protocol ${protocol}`);
		}
		if (handler.handler.tag === "lib") {
			let lib;
			if (handler.handler.version) {
				lib = await anura.import(
					handler.handler.pkg + "@" + handler.handler.version,
				);
			} else {
				lib = await anura.import(handler.handler.pkg);
			}
			await lib[handler.handler.import]((handler.prefix || "") + pathname);
		} else if (handler.handler.tag === "app") {
			const app = handler.handler;
			if (app.method.tag === "split") {
				const args = pathname.split(app.method.separator);
				await anura.apps[app.pkg].open(
					handler.prefix ? [handler.prefix, ...args] : args,
				);
			} else {
				await anura.apps[app.pkg].open((handler.prefix || "") + pathname);
			}
		}
	}

	/**
	 * Register a handler for a URI protocol.
	 *
	 * @param protocol - The protocol to register a handler for (e.g. `"https"`).
	 * @param options - The handler configuration. See {@link URIHandlerOptions}.
	 *
	 * @example
	 * ```js
	 * anura.uri.set("https", {
	 *     handler: {
	 *         // Specifies that the handler is a library
	 *         tag: "lib",
	 *         // The package name of the library
	 *         pkg: "anura.browser",
	 *         // The (optional) version of the library
	 *         version: "1.0.0",
	 *         // The function to call in the library
	 *         import: "openTab",
	 *     },
	 *     // The (optional) prefix to be prepended to the URI
	 *     prefix: "https:",
	 * });
	 * ```
	 */
	set(protocol: string, options: URIHandlerOptions): void {
		const handlers = anura.settings.get("URIHandlers") || {};
		handlers[protocol] = options;
		anura.settings.set("URIHandlers", handlers);
	}

	/**
	 * Remove the handler registered for a URI protocol.
	 *
	 * @param protocol - The protocol whose handler should be removed.
	 *
	 * @example
	 * ```js
	 * anura.uri.remove("https");
	 * ```
	 */
	remove(protocol: string): void {
		const handlers = anura.settings.get("URIHandlers") || {};
		delete handlers[protocol];
		anura.settings.set("URIHandlers", handlers);
	}

	/**
	 * Determine whether a handler has been registered for a URI protocol.
	 *
	 * @param protocol - The protocol to test for.
	 * @returns `true` if a handler is registered, otherwise `false`.
	 *
	 * @example
	 * ```js
	 * // Should always return true because the browser registers itself
	 * // as the handler for https automatically.
	 * anura.uri.has("https");
	 * ```
	 */
	has(protocol: string): boolean {
		const handlers = anura.settings.get("URIHandlers") || {};
		return !!handlers[protocol];
	}
}
