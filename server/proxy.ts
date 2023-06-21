/**
 * Dependencies
 */
var net = require("net");
var mes = require("./message");

class Proxy {
  /**
   *
   * @param {import('ws').WebSocket} ws
   */
  constructor(ws) {
    // console.log(ws)
    this._tcp;
    this._from = ws.upgradeReq.connection.remoteAddress;
    this._to = ws.upgradeReq.url.substr(1);
    this._ws = ws;

    // Bind data
    this._ws.on("message", this.clientData.bind(this));
    this._ws.on("close", this.close.bind(this));
    this._ws.on("error", this.close.bind(this));

    // Initialize proxy
    var args = this._to.split(":");

    // Connect to server
    mes.info(
      "Requested connection from '%s' to '%s' [ACCEPTED].",
      this._from,
      this._to
    );
    this._tcp = net.connect(args[1], args[0]);

    // Disable nagle algorithm
    this._tcp.setTimeout(0);
    this._tcp.setNoDelay(true);

    this._tcp.on("data", this.serverData.bind(this));
    this._tcp.on("close", this.close.bind(this));
    this._tcp.on("error", function (error) {
      console.log(error);
    });

    this._tcp.on("connect", this.connectAccept.bind(this));
  }

  /**
   * OnClientData
   * Client -> Server
   */
  clientData(data) {
    if (!this._tcp) {
      // wth ? Not initialized yet ?
      return;
    }

    try {
      this._tcp.write(data);
    } catch (e) {}
  }

  /**
   * OnServerData
   * Server -> Client
   */
  serverData(data) {
    this._ws.send(data, function (error) {
      /*
		if (error !== null) {
			OnClose();
		}
		*/
    });
  }

  /**
   * OnClose
   * Clean up events/sockets
   */
  close() {
    if (this._tcp) {
      mes.info("Connection closed from '%s'.", this._to);

      this._tcp.removeListener("close", this.close.bind(this));
      this._tcp.removeListener("error", this.close.bind(this));
      this._tcp.removeListener("data", this.serverData.bind(this));
      this._tcp.end();
    }

    if (this._ws) {
      mes.info("Connection closed from '%s'.", this._from);

      this._ws.removeListener("close", this.close.bind(this));
      this._ws.removeListener("error", this.close.bind(this));
      this._ws.removeListener("message", this.clientData.bind(this));
      this._ws.close();
    }
  }
  /**
   * On server accepts connection
   */
  connectAccept() {
    mes.status("Connection accepted from '%s'.", this._to);
  }
}

module.exports = Proxy;
