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
const router_init = function(config) {
	const handlers = handlersConstructor(config);
	// Routes
	router.get('/', handlers.sendMain);
	router.get('/files/get', handlers.getFiles);
	router.post('/files/upload', handlers.uploadFiles);

	return router;
}

// Exports
module.exports = router_init;