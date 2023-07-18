/**
 * Dependencies
 */
import { format } from "util";

/**
 * Info
 */
export function info(...args: any[]) {
    const mes = format(...wrap(args));

    console.log("\x1b[1;37m[%s]:\x1b[0m %s", "Info", mes);
}
/**
 * Status
 */
export function status(...args: any[]) {
    const mes = format(...wrap(args));

    console.log("\x1b[1;32m[%s]:\x1b[0m %s", "Status", mes);
}

/**
 * Error
 */
function error(...args: any[]) {
    const mes = format(...wrap(args));

    console.log("\x1b[1;31m[%s]:\x1b[0m %s", "Error", mes);
}

/**
 * Warning
 */
function warn(...args: any[]) {
    const mes = format(...wrap(args));

    console.log("\x1b[1;33m[%s]:\x1b[0m %s", "Warn", mes);
}

/**
 * Wrap arguments in a cool white color :)
 */
function wrap(args: any[]) {
    const newArgs: any[] = [];

    newArgs.push(args[0]);
    //Start at index 1, index 1 doesnt need to be modified;
    for (let i = 1; i < args.length; i++)
        newArgs.push("\x1b[1;37m" + args[i] + "\x1b[0m");

    return newArgs;
}

exports.info = info;
exports.status = status;
exports.error = error;
exports.warn = warn;
exports.wrap = wrap;
