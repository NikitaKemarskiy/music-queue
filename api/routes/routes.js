// Modules
const express = require('express');
const path = require('path');
const fs = require('fs');

// Libraries
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files

// Constants
//...

// Initialization
const router = express.Router();

// Functions
//...

// Routing initialization function
const router_init = function(database) {
	// Functions
	const sendMain = function(req, res) {
		res.header('StatusCode', '200');
		res.header('Content-Type', 'text/html; charset=utf-8');

		res.render(path.join(process.cwd(), 'public/html/main.hbs'), {});
	}

	// Routes
	router.get('/', sendMain);

	// Routes for loading the content of page
	/*router.get('/getdata', function(req, res) {
		res.header('StatusCode', '200');
		res.header('Content-Type', 'text/html; charset=utf-8');

		res.render(path.join(process.cwd(), 'public/html/main.hbs'), {});
	});*/

	return router;
}

// Exports
module.exports = router_init;