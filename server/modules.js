/**
 * Modules manager
 */
var Modules = {}


/**
 * Modules method stack
 * Array of functions to execute before by each method
 */
Modules.stack = {
	verify:  [], //executes before connect
	connect: [] //executes once passed through connect
}
	
	
/**
 * Register new module
 */
Modules.load = function registerModule(folder) {
	var module = require('./modules/' + folder);
	
	for(var method in this.stack) {
		if(typeof module[method] === 'function') {
			this.stack[method].push( module[method] );
		}
	}
}


/**
 * Run a module
 */
Modules.run = function runModule(method, index, _arguments, next) {
	
	if(Modules.stack[method].length <= index) { //No more modules to execute
		next();
		return;
	}
	
	_arguments.push(next); //Push next function
	
	Modules.stack[method][index].apply(null, _arguments);
	
}


/**
 * Modules method's
 */
Modules.method = {}


/**
 * Run through verify modules 
 * They should all return true, if one returns false, we will break
 */
Modules.method.verify = function Verify(info, callback) {
	var next = 0;

	var fnc = function() {
		Modules.run('verify', next, [info], function(bool) {
			// Check if it returned false, stop here if it did
			if(bool === false) {
				callback(false);
				return;
			}
			// If next < moduleStack, then we passed through all verify modules without an single return false
			if(next >= Modules.stack['verify'].length) {
				callback(true);
				return;
			}
			
			next++;
			fnc();
		});
	}

	fnc();	
}


/**
 * Give this to any module that wants it, then return after all modules have processed it
 */
Modules.method.connect = function Connect(ws, callback) {
	var next = 0;

	var fnc = function() {
		Modules.run('connect', next, [ws], function() {
			// Finished stack, lets return
			if(next >= Modules.stack['connect'].length) {
				callback();
				return;
			}
			
			next++;
			fnc();
		});
	}

	fnc();	
}


/**
 * Exports
 */
module.exports = Modules;
