// Modules
const path = require('path');
const fs = require('fs');

// Constants
const LOGSPATH = path.join(process.cwd(), 'logs'); // Constant value for storage folder
const LOGSFILE = 'logs.txt';
const ERRORFILE = 'error.txt';

let logStream = null;
let errorStream = null;

const startLogging = function() {
	let logPath = path.join(LOGSPATH, LOGSFILE);
	let errorPath = path.join(LOGSPATH, ERRORFILE);
	logStream = fs.createWriteStream(logPath);
	errorStream = fs.createWriteStream(errorPath);
}

const endLogging = function() {
	logStream.end();
	errorStream.end();
}

const log = function(str) {
	console.log(str);
	str = str.toString();
	str = str.concat('\n');
	logStream.write(str, 'utf8');
}

const dir = function(str) {
	console.dir(str);
	str = str.toString();
	str = str.concat('\n');
	logStream.write(str, 'utf8');
}

const error = function(str) {
	console.error(str);
	str = str.toString();
	str = str.concat('\n');
	errorStream.write(str, 'utf8');
}

// Exports
module.exports = {
	startLogging,
	endLogging,
	log,
	dir,
	error
};