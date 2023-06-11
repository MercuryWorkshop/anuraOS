/**
 * Dependencies
 */
var util = require('util');
var format = util.format;


/**
 * Exports
 */
var Mes = module.exports = {};


/**
 * Info
 */
Mes.info = function Info()
{
	var mes = format.apply(null, this.wrap(arguments));
	
	console.log('\x1b[1;37m[%s]:\x1b[0m %s', 'Info', mes);
}


/**
 * Status
 */
Mes.status = function Status()
{
	var mes = format.apply(null, this.wrap(arguments));
	
	console.log('\x1b[1;32m[%s]:\x1b[0m %s', 'Status', mes);
}


/**
 * Error
 */
Mes.error = function Error()
{
	var mes = format.apply(null, this.wrap(arguments));
	
	console.log('\x1b[1;31m[%s]:\x1b[0m %s', 'Error', mes);
}


/**
 * Warning
 */
Mes.warn = function Warning()
{
	var mes = format.apply(null, this.wrap(arguments));
	
	console.log('\x1b[1;33m[%s]:\x1b[0m %s', 'Warn', mes);
}


/**
 * Wrap arguments in a cool white color :)
 */
Mes.wrap = function Wrap()
{
	var args = [];
	
	args.push( arguments[0][0] );
	for(var i = 1; i < arguments[0].length; i++) { //Start at index 1, index 1 doesnt need to be modified;
		args.push( '\x1b[1;37m' + arguments[0][i] + '\x1b[0m' ); 
	}

	return args;
}
