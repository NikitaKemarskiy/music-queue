// Modules
const express = require('express');
const path = require('path');

// Libraries
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files

// Functions
const handlersConstructor = require(path.join(process.cwd(), 'api', 'routes', 'handlers.js')); // Functions for handling http requests

// Initialization
const router = express.Router();

// Routing initialization function
const routerInit = function(config) {
	const handlers = handlersConstructor(config);
	// Routes
	router.get('/', handlers.sendMain);
	router.get('/tracks/get', handlers.getTracks);
	router.get('/tracks/get/:track', handlers.findTrack);
	router.get('/tracks/play/:track', handlers.playTrack);
	router.post('/tracks/upload', handlers.uploadTracks);

	return router;
}

// Exports
module.exports = routerInit;