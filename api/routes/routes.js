// Modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Libraries
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files

// Constants
//...

// Initialization
const router = express.Router();

// Functions
//...

// Routing initialization function
const router_init = function(database, config) {
	// Functions
	const handlers = {
		sendMain: function(req, res) {
			res.header('StatusCode', '200');
			res.header('Content-Type', 'text/html; charset=utf-8');

			res.render(path.join(process.cwd(), 'public/html/main.hbs'), {});
		},
		getFiles: function(req, res) {
			res.header('StatusCode', '200');
			res.header('Content-Type', 'application/json; charset=utf-8');

			let data = '';
			const options = {
				host: config.fileServer.host,
				port: config.fileServer.port,
				path: '/files/get',
				method: 'GET'
				/*headers: {
					accept: 'application/json'
				}*/
			};

			const reqt = http.request(options, function(resp) {
				logging.log('Connected to file server => getting files');
				resp.setEncoding('utf8');
				resp.on('data', function(chunk) {
					data += chunk;
				});
				resp.on('end', function() {
					logging.log('No more data in response.');
					console.log(data);
					res.end('EMPTY STRING');
				});
			});
			reqt.on('error', function(error) {
				logging.error(`Error: ${error.message}`);
			});

			reqt.end();
		},
		uploadFiles: function(req, res) {
			res.header('StatusCode', '200');
			res.header('Content-Type', 'text/plain; charset=utf-8');

			res.end('Files were received');
		}
	};

	// Routes
	router.get('/', handlers.sendMain);
	router.get('/files/get', handlers.getFiles);
	router.post('/files/upload', handlers.uploadFiles);


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