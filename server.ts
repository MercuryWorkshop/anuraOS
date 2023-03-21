import express, { Request, Response } from "express";
import fs from "fs/promises";
const app = express();
const port = 8000;



app.use(async (req: Request, res: Response, next: Function) => {


  res.header("Access-Control-Allow-Origin", "*")
  res.header("Cross-Origin-Opener-Policy", "same-origin")
  res.header("Cross-Origin-Embedder-Policy", "require-corp")

  if (req.path.endsWith("index.list")) {
    let g = await fs.readdir(__dirname + "/rootfs" + req.path.slice(0, -"index.list".length));
    res.send(g.join("\n"));
    return;
  }
  next();
})

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/rootfs"));

app.get("/", (req: Request, res: Response) => {
  res.sendFile(__dirname + "public/index.html");
});

app.get("*/index.list")

app.listen(port, () => console.log(port));