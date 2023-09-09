(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.createBareClient = factory());
})(this, (function () { 'use strict';

	// The user likely has overwritten all networking functions after importing bare-client
	// It is our responsibility to make sure components of Bare-Client are using native networking functions
	// These exports are provided to plugins by @rollup/plugin-inject
	const fetch = globalThis.fetch;
	const WebSocket = globalThis.WebSocket;
	const Request = globalThis.Request;
	const Response = globalThis.Response;

	const statusEmpty = [101, 204, 205, 304];
	const statusRedirect = [301, 302, 303, 307, 308];
	class BareError extends Error {
	    status;
	    body;
	    constructor(status, body) {
	        super(body.message || body.code);
	        this.status = status;
	        this.body = body;
	    }
	}
	class Client {
	    base;
	    /**
	     *
	     * @param version Version provided by extension
	     * @param server Bare Server URL provided by BareClient
	     */
	    constructor(version, server) {
	        this.base = new URL(`./v${version}/`, server);
	    }
	}

	const validChars = "!#$%&'*+-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ^_`abcdefghijklmnopqrstuvwxyz|~";
	const reserveChar = '%';
	function validProtocol(protocol) {
	    for (let i = 0; i < protocol.length; i++) {
	        const char = protocol[i];
	        if (!validChars.includes(char)) {
	            return false;
	        }
	    }
	    return true;
	}
	function encodeProtocol(protocol) {
	    let result = '';
	    for (let i = 0; i < protocol.length; i++) {
	        const char = protocol[i];
	        if (validChars.includes(char) && char !== reserveChar) {
	            result += char;
	        }
	        else {
	            const code = char.charCodeAt(0);
	            result += reserveChar + code.toString(16).padStart(2, '0');
	        }
	    }
	    return result;
	}

	class ClientV1 extends Client {
	    ws;
	    http;
	    newMeta;
	    getMeta;
	    constructor(server) {
	        super(1, server);
	        this.ws = new URL(this.base);
	        this.http = new URL(this.base);
	        this.newMeta = new URL('ws-new-meta', this.base);
	        this.getMeta = new URL('ws-meta', this.base);
	        if (this.ws.protocol === 'https:') {
	            this.ws.protocol = 'wss:';
	        }
	        else {
	            this.ws.protocol = 'ws:';
	        }
	    }
	    async connect(requestHeaders, protocol, host, port, path) {
	        const assignMeta = await fetch(this.newMeta, { method: 'GET' });
	        if (!assignMeta.ok) {
	            throw new BareError(assignMeta.status, await assignMeta.json());
	        }
	        const id = await assignMeta.text();
	        const socket = new WebSocket(this.ws, [
	            'bare',
	            encodeProtocol(JSON.stringify({
	                remote: {
	                    protocol,
	                    host,
	                    port,
	                    path,
	                },
	                headers: requestHeaders,
	                forward_headers: [
	                    'accept-encoding',
	                    'accept-language',
	                    'sec-websocket-extensions',
	                    'sec-websocket-key',
	                    'sec-websocket-version',
	                ],
	                id,
	            })),
	        ]);
	        socket.meta = new Promise((resolve, reject) => {
	            socket.addEventListener('open', async () => {
	                const outgoing = await fetch(this.getMeta, {
	                    headers: {
	                        'x-bare-id': id,
	                    },
	                    method: 'GET',
	                });
	                if (!outgoing.ok) {
	                    reject(new BareError(outgoing.status, await outgoing.json()));
	                }
	                resolve(await outgoing.json());
	            });
	            socket.addEventListener('error', reject);
	        });
	        return socket;
	    }
	    async request(method, requestHeaders, body, protocol, host, port, path, cache, signal) {
	        if (protocol.startsWith('blob:')) {
	            const response = await fetch(`blob:${location.origin}${path}`);
	            const result = new Response(response.body, response);
	            result.rawHeaders = Object.fromEntries(response.headers);
	            result.rawResponse = response;
	            return result;
	        }
	        const bareHeaders = {};
	        if (requestHeaders instanceof Headers) {
	            for (const [header, value] of requestHeaders) {
	                bareHeaders[header] = value;
	            }
	        }
	        else {
	            for (const header in requestHeaders) {
	                bareHeaders[header] = requestHeaders[header];
	            }
	        }
	        const forwardHeaders = ['accept-encoding', 'accept-language'];
	        const options = {
	            credentials: 'omit',
	            method: method,
	            signal,
	        };
	        if (body !== undefined) {
	            options.body = body;
	        }
	        // bare can be an absolute path containing no origin, it becomes relative to the script
	        const request = new Request(this.http, options);
	        this.writeBareRequest(request, protocol, host, path, port, bareHeaders, forwardHeaders);
	        const response = await fetch(request);
	        const readResponse = await this.readBareResponse(response);
	        const result = new Response(statusEmpty.includes(readResponse.status) ? undefined : response.body, {
	            status: readResponse.status,
	            statusText: readResponse.statusText ?? undefined,
	            headers: readResponse.headers,
	        });
	        result.rawHeaders = readResponse.rawHeaders;
	        result.rawResponse = response;
	        return result;
	    }
	    async readBareResponse(response) {
	        if (!response.ok) {
	            throw new BareError(response.status, await response.json());
	        }
	        const requiredHeaders = [
	            'x-bare-status',
	            'x-bare-status-text',
	            'x-bare-headers',
	        ];
	        for (const header of requiredHeaders) {
	            if (!response.headers.has(header)) {
	                throw new BareError(500, {
	                    code: 'IMPL_MISSING_BARE_HEADER',
	                    id: `response.headers.${header}`,
	                });
	            }
	        }
	        const status = parseInt(response.headers.get('x-bare-status'));
	        const statusText = response.headers.get('x-bare-status-text');
	        const rawHeaders = JSON.parse(response.headers.get('x-bare-headers'));
	        const headers = new Headers(rawHeaders);
	        return {
	            status,
	            statusText,
	            rawHeaders,
	            headers,
	        };
	    }
	    writeBareRequest(request, protocol, host, path, port, bareHeaders, forwardHeaders) {
	        request.headers.set('x-bare-protocol', protocol);
	        request.headers.set('x-bare-host', host);
	        request.headers.set('x-bare-path', path);
	        request.headers.set('x-bare-port', port.toString());
	        request.headers.set('x-bare-headers', JSON.stringify(bareHeaders));
	        request.headers.set('x-bare-forward-headers', JSON.stringify(forwardHeaders));
	    }
	}

	/*
	 * JavaScript MD5
	 * Adopted from https://github.com/blueimp/JavaScript-MD5
	 *
	 * Copyright 2011, Sebastian Tschan
	 * https://blueimp.net
	 *
	 * Licensed under the MIT license:
	 * https://opensource.org/licenses/MIT
	 *
	 * Based on
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */
	/**
	 * Add integers, wrapping at 2^32.
	 * This uses 16-bit operations internally to work around bugs in interpreters.
	 *
	 * @param x First integer
	 * @param y Second integer
	 * @returns Sum
	 */
	function safeAdd(x, y) {
	    const lsw = (x & 0xffff) + (y & 0xffff);
	    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	    return (msw << 16) | (lsw & 0xffff);
	}
	/**
	 * Bitwise rotate a 32-bit number to the left.
	 *
	 * @param num 32-bit number
	 * @param cnt Rotation count
	 * @returns  Rotated number
	 */
	function bitRotateLeft(num, cnt) {
	    return (num << cnt) | (num >>> (32 - cnt));
	}
	/**
	 * Basic operation the algorithm uses.
	 *
	 * @param q q
	 * @param a a
	 * @param b b
	 * @param x x
	 * @param s s
	 * @param t t
	 * @returns Result
	 */
	function md5cmn(q, a, b, x, s, t) {
	    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
	}
	/**
	 * Basic operation the algorithm uses.
	 *
	 * @param a a
	 * @param b b
	 * @param c c
	 * @param d d
	 * @param x x
	 * @param s s
	 * @param t t
	 * @returns Result
	 */
	function md5ff(a, b, c, d, x, s, t) {
	    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
	}
	/**
	 * Basic operation the algorithm uses.
	 *
	 * @param a a
	 * @param b b
	 * @param c c
	 * @param d d
	 * @param x x
	 * @param s s
	 * @param t t
	 * @returns Result
	 */
	function md5gg(a, b, c, d, x, s, t) {
	    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
	}
	/**
	 * Basic operation the algorithm uses.
	 *
	 * @param a a
	 * @param b b
	 * @param c c
	 * @param d d
	 * @param x x
	 * @param s s
	 * @param t t
	 * @returns Result
	 */
	function md5hh(a, b, c, d, x, s, t) {
	    return md5cmn(b ^ c ^ d, a, b, x, s, t);
	}
	/**
	 * Basic operation the algorithm uses.
	 *
	 * @param a a
	 * @param b b
	 * @param c c
	 * @param d d
	 * @param x x
	 * @param s s
	 * @param t t
	 * @returns Result
	 */
	function md5ii(a, b, c, d, x, s, t) {
	    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
	}
	/**
	 * Calculate the MD5 of an array of little-endian words, and a bit length.
	 *
	 * @param x Array of little-endian words
	 * @param len Bit length
	 * @returns MD5 Array
	 */
	function binlMD5(x, len) {
	    /* append padding */
	    x[len >> 5] |= 0x80 << len % 32;
	    x[(((len + 64) >>> 9) << 4) + 14] = len;
	    let a = 1732584193;
	    let b = -271733879;
	    let c = -1732584194;
	    let d = 271733878;
	    for (let i = 0; i < x.length; i += 16) {
	        const olda = a;
	        const oldb = b;
	        const oldc = c;
	        const oldd = d;
	        a = md5ff(a, b, c, d, x[i], 7, -680876936);
	        d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
	        c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
	        b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
	        a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
	        d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
	        c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
	        b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
	        a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
	        d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
	        c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
	        b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
	        a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
	        d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
	        c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
	        b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
	        a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
	        d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
	        c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
	        b = md5gg(b, c, d, a, x[i], 20, -373897302);
	        a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
	        d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
	        c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
	        b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
	        a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
	        d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
	        c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
	        b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
	        a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
	        d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
	        c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
	        b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
	        a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
	        d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
	        c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
	        b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
	        a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
	        d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
	        c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
	        b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
	        a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
	        d = md5hh(d, a, b, c, x[i], 11, -358537222);
	        c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
	        b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
	        a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
	        d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
	        c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
	        b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
	        a = md5ii(a, b, c, d, x[i], 6, -198630844);
	        d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
	        c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
	        b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
	        a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
	        d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
	        c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
	        b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
	        a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
	        d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
	        c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
	        b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
	        a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
	        d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
	        c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
	        b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
	        a = safeAdd(a, olda);
	        b = safeAdd(b, oldb);
	        c = safeAdd(c, oldc);
	        d = safeAdd(d, oldd);
	    }
	    return [a, b, c, d];
	}
	/**
	 * Convert an array of little-endian words to a string
	 *
	 * @param input MD5 Array
	 * @returns MD5 string
	 */
	function binl2rstr(input) {
	    let output = '';
	    const length32 = input.length * 32;
	    for (let i = 0; i < length32; i += 8) {
	        output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff);
	    }
	    return output;
	}
	/**
	 * Convert a raw string to an array of little-endian words
	 * Characters >255 have their high-byte silently ignored.
	 *
	 * @param input Raw input string
	 * @returns Array of little-endian words
	 */
	function rstr2binl(input) {
	    const output = [];
	    const outputLen = input.length >> 2;
	    for (let i = 0; i < outputLen; i += 1) {
	        output[i] = 0;
	    }
	    const length8 = input.length * 8;
	    for (let i = 0; i < length8; i += 8) {
	        output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32;
	    }
	    return output;
	}
	/**
	 * Calculate the MD5 of a raw string
	 *
	 * @param s Input string
	 * @returns Raw MD5 string
	 */
	function rstrMD5(s) {
	    return binl2rstr(binlMD5(rstr2binl(s), s.length * 8));
	}
	/**
	 * Calculates the HMAC-MD5 of a key and some data (raw strings)
	 *
	 * @param key HMAC key
	 * @param data Raw input string
	 * @returns Raw MD5 string
	 */
	function rstrHMACMD5(key, data) {
	    let bkey = rstr2binl(key);
	    const ipad = [];
	    const opad = [];
	    if (bkey.length > 16) {
	        bkey = binlMD5(bkey, key.length * 8);
	    }
	    for (let i = 0; i < 16; i += 1) {
	        ipad[i] = bkey[i] ^ 0x36363636;
	        opad[i] = bkey[i] ^ 0x5c5c5c5c;
	    }
	    const hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
	    return binl2rstr(binlMD5(opad.concat(hash), 512 + 128));
	}
	/**
	 * Convert a raw string to a hex string
	 *
	 * @param input Raw input string
	 * @returns Hex encoded string
	 */
	function rstr2hex(input) {
	    const hexTab = '0123456789abcdef';
	    let output = '';
	    for (let i = 0; i < input.length; i += 1) {
	        const x = input.charCodeAt(i);
	        output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
	    }
	    return output;
	}
	/**
	 * Encode a string as UTF-8
	 *
	 * @param input Input string
	 * @returns UTF8 string
	 */
	function str2rstrUTF8(input) {
	    return unescape(encodeURIComponent(input));
	}
	/**
	 * Encodes input string as raw MD5 string
	 *
	 * @param s Input string
	 * @returns Raw MD5 string
	 */
	function rawMD5(s) {
	    return rstrMD5(str2rstrUTF8(s));
	}
	/**
	 * Encodes input string as Hex encoded string
	 *
	 * @param s Input string
	 * @returns Hex encoded string
	 */
	function hexMD5(s) {
	    return rstr2hex(rawMD5(s));
	}
	/**
	 * Calculates the raw HMAC-MD5 for the given key and data
	 *
	 * @param k HMAC key
	 * @param d Input string
	 * @returns Raw MD5 string
	 */
	function rawHMACMD5(k, d) {
	    return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d));
	}
	/**
	 * Calculates the Hex encoded HMAC-MD5 for the given key and data
	 *
	 * @param k HMAC key
	 * @param d Input string
	 * @returns Raw MD5 string
	 */
	function hexHMACMD5(k, d) {
	    return rstr2hex(rawHMACMD5(k, d));
	}
	/**
	 * Calculates MD5 value for a given string.
	 * If a key is provided, calculates the HMAC-MD5 value.
	 * Returns a Hex encoded string unless the raw argument is given.
	 *
	 * @param string Input string
	 * @param key HMAC key
	 * @param raw Raw output switch
	 * @returns MD5 output
	 */
	function md5(string, key, raw) {
	    if (!key) {
	        if (!raw) {
	            return hexMD5(string);
	        }
	        return rawMD5(string);
	    }
	    if (!raw) {
	        return hexHMACMD5(key, string);
	    }
	    return rawHMACMD5(key, string);
	}

	const MAX_HEADER_VALUE = 3072;
	/**
	 *
	 * Splits headers according to spec
	 * @param headers
	 * @returns Split headers
	 */
	function splitHeaders(headers) {
	    const output = new Headers(headers);
	    if (headers.has('x-bare-headers')) {
	        const value = headers.get('x-bare-headers');
	        if (value.length > MAX_HEADER_VALUE) {
	            output.delete('x-bare-headers');
	            let split = 0;
	            for (let i = 0; i < value.length; i += MAX_HEADER_VALUE) {
	                const part = value.slice(i, i + MAX_HEADER_VALUE);
	                const id = split++;
	                output.set(`x-bare-headers-${id}`, `;${part}`);
	            }
	        }
	    }
	    return output;
	}
	/**
	 * Joins headers according to spec
	 * @param headers
	 * @returns Joined headers
	 */
	function joinHeaders(headers) {
	    const output = new Headers(headers);
	    const prefix = 'x-bare-headers';
	    if (headers.has(`${prefix}-0`)) {
	        const join = [];
	        for (const [header, value] of headers) {
	            if (!header.startsWith(prefix)) {
	                continue;
	            }
	            if (!value.startsWith(';')) {
	                throw new BareError(400, {
	                    code: 'INVALID_BARE_HEADER',
	                    id: `request.headers.${header}`,
	                    message: `Value didn't begin with semi-colon.`,
	                });
	            }
	            const id = parseInt(header.slice(prefix.length + 1));
	            join[id] = value.slice(1);
	            output.delete(header);
	        }
	        output.set(prefix, join.join(''));
	    }
	    return output;
	}

	class ClientV2 extends Client {
	    ws;
	    http;
	    newMeta;
	    getMeta;
	    constructor(server) {
	        super(2, server);
	        this.ws = new URL(this.base);
	        this.http = new URL(this.base);
	        this.newMeta = new URL('./ws-new-meta', this.base);
	        this.getMeta = new URL(`./ws-meta`, this.base);
	        if (this.ws.protocol === 'https:') {
	            this.ws.protocol = 'wss:';
	        }
	        else {
	            this.ws.protocol = 'ws:';
	        }
	    }
	    async connect(requestHeaders, protocol, host, port, path) {
	        const request = new Request(this.newMeta, {
	            headers: this.createBareHeaders(protocol, host, path, port, requestHeaders),
	        });
	        const assign_meta = await fetch(request);
	        if (!assign_meta.ok) {
	            throw new BareError(assign_meta.status, await assign_meta.json());
	        }
	        const id = await assign_meta.text();
	        const socket = new WebSocket(this.ws, [
	            id,
	        ]);
	        socket.meta = new Promise((resolve, reject) => {
	            socket.addEventListener('open', async () => {
	                const outgoing = await fetch(this.getMeta, {
	                    headers: {
	                        'x-bare-id': id,
	                    },
	                    method: 'GET',
	                });
	                resolve(await await this.readBareResponse(outgoing));
	            });
	            socket.addEventListener('error', reject);
	        });
	        return socket;
	    }
	    async request(method, requestHeaders, body, protocol, host, port, path, cache, signal) {
	        if (protocol.startsWith('blob:')) {
	            const response = await fetch(`blob:${location.origin}${path}`);
	            const result = new Response(response.body, response);
	            result.rawHeaders = Object.fromEntries(response.headers);
	            result.rawResponse = response;
	            return result;
	        }
	        const bareHeaders = {};
	        if (requestHeaders instanceof Headers) {
	            for (const [header, value] of requestHeaders) {
	                bareHeaders[header] = value;
	            }
	        }
	        else {
	            for (const header in requestHeaders) {
	                bareHeaders[header] = requestHeaders[header];
	            }
	        }
	        const options = {
	            credentials: 'omit',
	            method: method,
	            signal,
	        };
	        if (cache !== 'only-if-cached') {
	            options.cache = cache;
	        }
	        if (body !== undefined) {
	            options.body = body;
	        }
	        options.headers = this.createBareHeaders(protocol, host, path, port, bareHeaders);
	        const request = new Request(this.http + '?cache=' + md5(`${protocol}${host}${port}${path}`), options);
	        const response = await fetch(request);
	        const readResponse = await this.readBareResponse(response);
	        const result = new Response(statusEmpty.includes(readResponse.status) ? undefined : response.body, {
	            status: readResponse.status,
	            statusText: readResponse.statusText ?? undefined,
	            headers: readResponse.headers,
	        });
	        result.rawHeaders = readResponse.rawHeaders;
	        result.rawResponse = response;
	        return result;
	    }
	    async readBareResponse(response) {
	        if (!response.ok) {
	            throw new BareError(response.status, await response.json());
	        }
	        const responseHeaders = joinHeaders(response.headers);
	        const result = {};
	        if (responseHeaders.has('x-bare-status')) {
	            result.status = parseInt(responseHeaders.get('x-bare-status'));
	        }
	        if (responseHeaders.has('x-bare-status-text')) {
	            result.statusText = responseHeaders.get('x-bare-status-text');
	        }
	        if (responseHeaders.has('x-bare-headers')) {
	            result.rawHeaders = JSON.parse(responseHeaders.get('x-bare-headers'));
	            result.headers = new Headers(result.rawHeaders);
	        }
	        return result;
	    }
	    createBareHeaders(protocol, host, path, port, bareHeaders, forwardHeaders = [], passHeaders = [], passStatus = []) {
	        const headers = new Headers();
	        headers.set('x-bare-protocol', protocol);
	        headers.set('x-bare-host', host);
	        headers.set('x-bare-path', path);
	        headers.set('x-bare-port', port.toString());
	        headers.set('x-bare-headers', JSON.stringify(bareHeaders));
	        for (const header of forwardHeaders) {
	            headers.append('x-bare-forward-headers', header);
	        }
	        for (const header of passHeaders) {
	            headers.append('x-bare-pass-headers', header);
	        }
	        for (const status of passStatus) {
	            headers.append('x-bare-pass-status', status.toString());
	        }
	        splitHeaders(headers);
	        return headers;
	    }
	}

	const clientCtors = [
	    ['v2', ClientV2],
	    ['v1', ClientV1],
	];
	const maxRedirects = 20;
	async function fetchManifest(server, signal) {
	    const outgoing = await fetch(server, { signal });
	    if (!outgoing.ok) {
	        throw new Error(`Unable to fetch Bare meta: ${outgoing.status} ${await outgoing.text()}`);
	    }
	    return await outgoing.json();
	}
	class BareClient {
	    /**
	     * @depricated Use .manifest instead.
	     */
	    get data() {
	        return this.manfiest;
	    }
	    manfiest;
	    client;
	    server;
	    working;
	    onDemand;
	    onDemandSignal;
	    constructor(server, _) {
	        this.server = new URL(server);
	        if (!_ || _ instanceof AbortSignal) {
	            this.onDemand = true;
	            this.onDemandSignal = _;
	        }
	        else {
	            this.onDemand = false;
	            this.manfiest = _;
	            this.getClient();
	        }
	    }
	    demand() {
	        if (!this.onDemand)
	            return;
	        if (!this.working)
	            this.working = fetchManifest(this.server, this.onDemandSignal).then((manfiest) => {
	                this.manfiest = manfiest;
	                this.getClient();
	            });
	        return this.working;
	    }
	    getClient() {
	        // newest-oldest
	        for (const [version, ctor] of clientCtors) {
	            if (this.data.versions.includes(version)) {
	                this.client = new ctor(this.server);
	                return;
	            }
	        }
	        throw new Error(`Unable to find compatible client version.`);
	    }
	    async request(method, requestHeaders, body, protocol, host, port, path, cache, signal) {
	        await this.demand();
	        return await this.client.request(method, requestHeaders, body, protocol, host, port, path, cache, signal);
	    }
	    async connect(requestHeaders, protocol, host, port, path) {
	        await this.demand();
	        return this.client.connect(requestHeaders, protocol, host, port, path);
	    }
	    /**
	     *
	     * @param url
	     * @param headers
	     * @param protocols
	     * @returns
	     */
	    createWebSocket(url, headers = {}, protocols = []) {
	        const requestHeaders = headers instanceof Headers ? Object.fromEntries(headers) : headers;
	        url = new URL(url);
	        // user is expected to specify user-agent and origin
	        // both are in spec
	        requestHeaders['Host'] = url.host;
	        // requestHeaders['Origin'] = origin;
	        requestHeaders['Pragma'] = 'no-cache';
	        requestHeaders['Cache-Control'] = 'no-cache';
	        requestHeaders['Upgrade'] = 'websocket';
	        // requestHeaders['User-Agent'] = navigator.userAgent;
	        requestHeaders['Connection'] = 'Upgrade';
	        if (typeof protocols === 'string') {
	            protocols = [protocols];
	        }
	        for (const proto of protocols) {
	            if (!validProtocol(proto)) {
	                throw new DOMException(`Failed to construct 'WebSocket': The subprotocol '${proto}' is invalid.`);
	            }
	        }
	        if (protocols.length) {
	            headers['Sec-Websocket-Protocol'] = protocols.join(', ');
	        }
	        return this.connect(headers, url.protocol, url.hostname, url.port, url.pathname + url.search);
	    }
	    async fetch(url, init = {}) {
	        if (url instanceof Request) {
	            // behave similar to the browser when fetch is called with (Request, Init)
	            if (init) {
	                url = new URL(url.url);
	            }
	            else {
	                init = url;
	                url = new URL(url.url);
	            }
	        }
	        else {
	            url = new URL(url);
	        }
	        let method;
	        if (typeof init.method === 'string') {
	            method = init.method;
	        }
	        else {
	            method = 'GET';
	        }
	        let body;
	        if (init.body !== undefined && init.body !== null) {
	            body = init.body;
	        }
	        let headers;
	        if (typeof init.headers === 'object' && init.headers !== null) {
	            if (init.headers instanceof Headers) {
	                headers = Object.fromEntries(init.headers);
	            }
	            else {
	                headers = init.headers;
	            }
	        }
	        else {
	            headers = {};
	        }
	        let cache;
	        if (typeof init.cache === 'string') {
	            cache = init.cache;
	        }
	        else {
	            cache = 'default';
	        }
	        let signal;
	        if (init.signal instanceof AbortSignal) {
	            signal = init.signal;
	        }
	        for (let i = 0;; i++) {
	            let port;
	            if (url.port === '') {
	                if (url.protocol === 'https:') {
	                    port = '443';
	                }
	                else {
	                    port = '80';
	                }
	            }
	            else {
	                port = url.port;
	            }
	            headers.host = url.host;
	            const response = await this.request(method, headers, body, url.protocol, url.hostname, port, url.pathname + url.search, cache, signal);
	            response.finalURL = url.toString();
	            if (statusRedirect.includes(response.status)) {
	                switch (init.redirect) {
	                    default:
	                    case 'follow':
	                        if (maxRedirects > i && response.headers.has('location')) {
	                            url = new URL(response.headers.get('location'), url);
	                            continue;
	                        }
	                        else {
	                            throw new TypeError('Failed to fetch');
	                        }
	                    case 'error':
	                        throw new TypeError('Failed to fetch');
	                    case 'manual':
	                        return response;
	                }
	            }
	            else {
	                return response;
	            }
	        }
	    }
	}
	/**
	 *
	 * Facilitates fetching the Bare server and constructing a BareClient.
	 * @param server Bare server
	 * @param signal Abort signal when fetching the manifest
	 */
	async function createBareClient(server, signal) {
	    const manfiest = await fetchManifest(server, signal);
	    return new BareClient(server, manfiest);
	}

	return createBareClient;

}));
//# sourceMappingURL=BareClient.cjs.map
