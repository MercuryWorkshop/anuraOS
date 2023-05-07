import express, { Request, Response } from "express";
import createServer from '@tomphttp/bare-server-node';
import fs from "fs/promises";

const app = express();
const port = 8000;
const bare = createServer('/bare/');

__dirname = process.cwd()

app.get("/", (req: Request, res: Response) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  res.sendFile(__dirname + "/public/index.html");
});
app.use(async (req: Request, res: Response, next: Function) => {


  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Resource-Policy", "same-site");
  
  if (bare.shouldRoute(req)) {

    bare.routeRequest(req, res);
    return;
  }
  next();
})

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/build"));
app.use("/apps",express.static(__dirname + "/apps"));
app.use(express.static(__dirname + "/aboutproxy/static"));


app.listen(port, () => console.log(port));
