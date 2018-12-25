// Modules
const express = require('express');
const path = require('path');
const formidable = require('formidable');
const fs = require('fs');

// Logging
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files

// Constants
const STORAGEPATH = path.join(process.cwd(), 'storage'); // Constant value for storage folder
const fileTypes = [	// Audio files types
	'.3gp', '.aa', '.aac', '.aax', '.act',
	'.aiff', '.amr', '.ape', '.au', '.awb',
	'.dct', '.dss', '.dvf', '.flac', '.gsm',
	'.iklax', '.ivs', '.m4a', '.m4b', '.m4p',
	'.mmf', '.mp3', '.mpc', '.msv', '.nsf',
	'.ogg', '.oga', '.mogg', '.opus', '.ra',
	'.rm', '.raw', '.sln', '.tta', '.vox',
	'.wav', '.wma', '.wv', '.webm', '.8svx'
];

// Configuration
const config = require(path.join(process.cwd(), 'config', 'config.js'));

// Initialization
const server = express(); // Server
logging.startLogging(); // Open writable streams for logging

// Libraries
const storageConstructor = require(path.join(process.cwd(), 'api', 'storage', 'storage.js')); // Functions for work with storage
const storage = new storageConstructor();

// Process listeners
process.on('exit', function(code) { // Exit the program listener
	logging.log(`Closing the program... Status code: ${code}`);
	logging.endLogging();
});

process.on('uncaughtException', function(error) { // Uncaught error listener
	logging.error(`Error: ${error.message}`);
	storage.saveTracksData().then(function() {
		process.exit(1); // Exit the program with a status code 1 (error)
	}).catch(function(error) {
		logging.error(`Error: ${error.message}`);
		process.exit(1); // Exit the program with a status code 1 (error)
	});
});

process.on('SIGTERM', () => { // SIGTERM Linux signal listener
	logging.log('SIGTERM signal received.');
	storage.saveTracksData().then(function() {
		process.exit(0); // Exit the program with a status code 0 (success)
	}).catch(function(error) {
		logging.error(`Error: ${error.message}`);
		process.exit(0); // Exit the program with a status code 0 (success)
	});
});

process.on('SIGINT', () => { // SIGINT Linux signal listener
	logging.log('SIGINT signal received.');
	storage.saveTracksData().then(function() {
		process.exit(0); // Exit the program with a status code 0 (success)
	}).catch(function(error) {
		logging.error(`Error: ${error.message}`);
		process.exit(0); // Exit the program with a status code 0 (success)
	});
});

// Routes
server.get('/files/get', function(req, res) { // Get files get request handler
	storage.getTracksData().then(function(items) {
		res.header('StatusCode', '200'); // Success code
		res.header('Content-Type', 'application/json; charset=utf-8');

		res.end(JSON.stringify(items));
	});
});

server.get('/track/play/:fileName', function(req, res) { // Play track get request handler
	storage.playTrack(req.params.fileName, res);
});

server.post('/files/upload', function(req, res) { // Upload files post request handler
	const form = formidable.IncomingForm(); // Create incoming formidable form
	form.uploadDir = STORAGEPATH; // Upload directory for files
	form.keepExtensions = true; // Keep files extensions
	form.maxFieldsSize = 10 * 1024 * 1024; // Max fields size except files - 10 MB 
	form.multiples = true; // Allow to upload multiple files
	form.hash = false; // Don't create hash
	form.maxFileSize = 50 * 1024 * 1024; // Max track size - 50 MB

	form.on('error', function(error) { // Upload error occured
		logging.error(`Error: ${error.message}`);
		res.end(`Error: files can't be uploaded`);
	});

	form.on('fileBegin', function(name, track) { // New track detected in the upload stream
		track.path = path.join(form.uploadDir, track.name);
	});

	form.on('file', function(name, track) { // New track was received
		const type = '.' + track.type.substring(track.type.indexOf('/') + 1); // Get file extension from track.type
		if (fileTypes.includes(type)) { // Uploaded file extension is allowed
			console.dir({
				size: track.size,
				path: track.path,
				name: track.name,
				type: track.type
			});
			storage.addTrack(track.name); // Add uploaded track to the storage data object
		} else { // Uploaded file extension isn't allowed
			fs.unlink(track.path, function(error) {
				if (error) {
					logging.error(`Error: ${error.message}`);
				} else {
					logging.log(`File ${track.name} has a forbidden extension`);
				}
			});
		}		
	});

	form.on('end', function() { // Upload was finished
		logging.log(`Files were successfully received`);
		res.end('Files were received');
	});

	form.parse(req); // Parse upload form
});

// Express.js
storage.initialize().then(function(result) {
	logging.log(result);
	server.listen(config.server.port, config.server.host, function(error) {
		if (error) {
			logging.error(`File server error: ${error.message}`);
		} else {
			logging.log(`File server is listening at ${config.server.host}:${config.server.port}`);
		}
	});
}).catch(function(error) {
	throw new Error(error);
});