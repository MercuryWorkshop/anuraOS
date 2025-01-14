import express from "express";
import path from "path";
import wisp from "wisp-server-node";
import { Socket } from "node:net";

const __dirname = path.join(process.cwd(), "..");

const app = express();
const port = process.env.PORT || 8000;

app.use((req, res, next) => {
	// cors
	res.header("Cross-Origin-Embedder-Policy", "require-corp");
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Cross-Origin-Opener-Policy", "same-origin");
	res.header("Cross-Origin-Resource-Policy", "same-site");
	next();
});

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/build"));
app.use("/apps", express.static(__dirname + "/apps"));
app.use(express.static(__dirname + "/aboutproxy/static"));

const server = app.listen(port, () => console.log("Listening on port: ", port));

server.on("upgrade", (request, socket, head) => {
	wisp.routeRequest(request, socket, head);
});
