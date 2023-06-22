import express, { Request, Response } from "express";
import { createBareServer } from '@tomphttp/bare-server-node';

import read from "fs-readdir-recursive";
import path from "path"

import { spawn } from "child_process";

import Proxy, { FakeWebSocket } from "./proxy";
import WebSocket from "ws";

// spawn("node", ["index.js"], {
//   cwd: "../wsproxy/",try {
//   let websocketproxy = new Docker({ socketPath: '/var/run/docker.sock' });
//   websocketproxy.run('bellenottelling/websockproxy', [], process.stdout, {
//     name: 'relay',
//     HostConfig: {
//       Privileged: true,
//       PortBindings: {
//         "80/tcp": [
//           {
//             "HostPort": "8001"
//           }
//         ]
//       }
//     }
//   })
// } catch(err) {
//   console.log(err)
// }
//   env: {
//     "PORT": "8001"
//   },
//   stdio: [process.stdout, process.stderr]
// })


// try {
//   let websocketproxy = new Docker({ socketPath: '/var/run/docker.sock' });
//   websocketproxy.run('bellenottelling/websockproxy', [], process.stdout, {
//     name: 'relay',
//     HostConfig: {
//       Privileged: true,
//       PortBindings: {
//         "80/tcp": [
//           {
//             "HostPort": "8001"
//           }
//         ]
//       }
//     }
//   })
// } catch(err) {
//   console.log(err)
// }

spawn("docker rm relay; docker run --privileged -p 8001:80 --name relay bellenottelling/websockproxy:latest", [], {
  shell: true,
  stdio: [process.stdout, null, process.stderr],
})

let files = read('public');

const app = express();
const port = 8000;
const bare = createBareServer('/bare/');

__dirname = path.join(process.cwd(), '..');

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
})

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

console.log("Starting wsProxy")
var WebSocketServer = new WebSocket.Server({ noServer: true })
WebSocketServer.on('connection', ws => {
  try {
    new Proxy(ws as FakeWebSocket);
  } catch (e) {
    console.error(e)
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
    console.log("websocket connection detected")
    WebSocketServer.handleUpgrade(request, socket, head, (websocket) => {
      let fakeWebsocket = websocket as FakeWebSocket;
      fakeWebsocket.upgradeReq = request;
      WebSocketServer.emit("connection", fakeWebsocket, request);
    })
  }
});
