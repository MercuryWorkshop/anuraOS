import express, { Request, Response } from "express";
import createServer from '@tomphttp/bare-server-node';
import fs from "fs/promises";

const app = express();
const port = 8000;
const bare = createServer('/bare/');



app.get("/", (req: Request, res: Response) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  res.sendFile(__dirname + "/public/index.html");
});
app.use(async (req: Request, res: Response, next: Function) => {


  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Resource-Policy", "same-site");
  if (req.path.endsWith("index.list")) {
    let g = await fs.readdir(__dirname + "/rootfs" + req.path.slice(0, -"index.list".length));
    res.send(g.join("\n"));
    return;
  }
  if (bare.shouldRoute(req)) {

    bare.routeRequest(req, res);
    return;
  }
  next();
})

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/rootfs"));
app.use(express.static(__dirname + "/aboutproxy/static"));


app.listen(port, () => console.log(port));
