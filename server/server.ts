import express from "express";
import { createBareServer } from "@tomphttp/bare-server-node";

import read from "fs-readdir-recursive";
import path from "path";

import { spawn, spawnSync } from "child_process";

import Proxy, { FakeWebSocket } from "./proxy";
import WebSocket from "ws";
import basicAuth from "express-basic-auth";

import { readFileSync } from "fs";

import * as crypto from "crypto";

const useAuth = process.argv.includes("--auth");
const useParanoidAuth = process.argv.includes("--paranoid-auth");
// paranoid auth requests the user to send the server a passkey instead of a password, it's recommended to generate this passkey
// using a secure method such as /dev/random.

spawn(
    "docker rm relay; docker run --privileged -p 8001:80 --name relay bellenottelling/websockproxy:latest",
    [],
    {
        shell: true,
        stdio: [process.stdout, null, process.stderr],
    },
);

function cryptoRandom() {
    const typedArray = new Uint8Array(1);
    const randomValue = crypto.getRandomValues(typedArray)[0];
    const randomFloat = randomValue / Math.pow(2, 8);
    return randomFloat;
}

function shutdown() {
    console.log();
    // https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html
    server.close();
    console.log("Stopped server");
    // send KILL so it's faster
    spawnSync("docker container stop relay --signal KILL", {
        shell: true,
        stdio: [process.stdout, null, process.stderr],
    });
    console.log("Stopped relay");
    spawnSync("docker rm relay", {
        shell: true,
        stdio: [process.stdout, null, process.stderr],
    });
    console.log("Removed relay");
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const files = read("public");

const app = express();
const port = 8000;
const bare = createBareServer("/bare/");

__dirname = path.join(process.cwd(), "..");

app.get("/", (req, res) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    res.header("Cross-Origin-Resource-Policy", "same-site");
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/anura-filestocache", (req, res) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    res.header("Cross-Origin-Resource-Policy", "same-site");

    res.contentType("application/json");
    res.send(JSON.stringify(files));
});

app.use(async (req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    res.header("Cross-Origin-Resource-Policy", "same-site");

    if (bare.shouldRoute(req)) {
        bare.routeRequest(req, res);
        return;
    }
    next();
});

// AUTHENTICATION
if (useAuth) {
    const password = sessionPassword(64);
    console.log("The password for this session is: " + password);
    app.use(
        basicAuth({
            users: {
                demouser: password,
            },
            challenge: true,
        }),
    );
}

if (useParanoidAuth) {
    const passkey = readFileSync("passkey", "utf8");
    console.log("Using paranoid authentication for this session.");
    app.use(
        basicAuth({
            users: {
                demouser: passkey,
            },
            challenge: true,
        }),
    );
}

app.use(async (req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    res.header("Cross-Origin-Resource-Policy", "same-site");

    if (req.path.startsWith(__dirname + "/public")) {
        res.sendFile(req.path);
        return;
    }

    next();
});

app.use(async (req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    res.header("Cross-Origin-Resource-Policy", "same-site");

    if (req.path.startsWith(__dirname + "/aboutproxy/static")) {
        res.sendFile(req.path);
        return;
    }

    next();
});

console.log("Starting wsProxy");
const wss = new WebSocket.Server({ noServer: true });
wss.on("connection", (ws) => {
    try {
        new Proxy(ws as FakeWebSocket);
    } catch (e) {
        console.error(e);
    }
});

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/build"));
app.use("/apps", express.static(__dirname + "/apps"));
app.use(express.static(__dirname + "/aboutproxy/static"));

const server = app.listen(port, () => console.log("Listening on port: ", port));

server.on("upgrade", (request, socket, head) => {
    if (bare.shouldRoute(request)) {
        bare.routeUpgrade(request, socket, head);
    } else {
        console.log("websocket connection detected");
        wss.handleUpgrade(request, socket, head, (websocket) => {
            const fakeWebsocket = websocket as FakeWebSocket;
            fakeWebsocket.upgradeReq = request;
            wss.emit("connection", fakeWebsocket, request);
        });
    }
});

function sessionPassword(length: number) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(cryptoRandom() * charactersLength),
        );
        counter += 1;
    }
    console.log("The username for this session is: demouser");
    return result;
}
