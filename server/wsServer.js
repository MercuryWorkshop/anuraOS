/**
 * Dependencies
 */
var http    = require('http');
var https   = require('https');
var fs      = require('fs');
var ws      = require('ws');
var modules = require('./modules');
var mes     = require('./message');


/**
 * Proxy constructor
 */
var Proxy = require('./proxy');



function startWsProxy(httpServer) {
	

	var opts = {
		clientTracking: false,
		verifyClient:   onRequestConnect,
	}


	

	mes.status("Starting wsProxy on port %s...", config.port)
	

	var WebSocketServer = new ws.Server(opts)

	WebSocketServer.on('connection', onConnection);
}





/**
 * Exports
 */
module.exports = {
	startWsProxy
}