import express, { Request, Response } from "express";
import createServer from '@tomphttp/bare-server-node';

const read = require('fs-readdir-recursive');

let files = read('public'); 

const app = express();
const port = 8000;
const bare = createServer('/bare/');


app.get("/", (req: Request, res: Response) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/anura-filestocache", (req: Request, res: Response) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cross-Origin-Opener-Policy", "same-origin");

  res.contentType("application/json");
  res.send(JSON.stringify(files));
});

app.use(async (req: Request, res: Response, next: Function) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cross-Origin-Opener-Policy", "same-origin");

  if(bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
    return;
  }
  next();
})

app.use(async (req: Request, res: Response, next: Function) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cross-Origin-Opener-Policy", "same-origin");

  if(req.path.startsWith(__dirname + "/public")) {
    res.sendFile(req.path);
    return;
  }

  next();
});

app.use(async (req: Request, res: Response, next: Function) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cross-Origin-Opener-Policy", "same-origin");

  if(req.path.startsWith(__dirname + "/aboutproxy/static")) {
    res.sendFile(req.path);
    return;
  }

  next();
});

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/aboutproxy/static"));


app.listen(port, () => console.log("Listening on port: ", port));
