// Modules
const express = require('express');
const path = require('path');
const formidable = require('formidable');

// Logging
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files

// Configuration
const config = require(path.join(process.cwd(), 'config', 'config.js'));

// Initialization
const server = express(); // Server
logging.startLogging(); // Open writable streams for logging

// Libraries
const storageConstructor = require(path.join(process.cwd(), 'api', 'storage', 'storage.js')); // Functions for work with storage
const storage = new storageConstructor();

// Functions
const handlersConstructor = require(path.join(process.cwd(), 'api', 'handlers', 'handlers.js')); // Handlers for routes
const handlers = new handlersConstructor(storage);

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
server.get('/files/get', handlers.getTracks); // Get files get request handler
server.get('/track/play/:track', handlers.playTrack); // Play track get request handler
server.post('/files/upload', handlers.uploadFiles); // Upload files post request handler

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