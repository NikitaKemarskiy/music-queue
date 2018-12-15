// Modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Libraries
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files
const caching = require(path.join(process.cwd(), 'api', 'caching', 'caching.js')); // Function for caching tracks data 

// Initialization
const router = express.Router();

// Routing initialization function
const router_init = function(config) {
	// Functions
	const handlers = {
		sendMain: function(req, res) { // Send main page request handler
			res.header('StatusCode', '200');
			res.header('Content-Type', 'text/html; charset=utf-8');

			res.render(path.join(process.cwd(), 'public/html/main.hbs'), {});
		},
		getFiles: function(req, res) { // Get list of files request handler
			res.header('StatusCode', '200');
			res.header('Content-Type', 'application/json; charset=utf-8');

			let cache = caching.get();
			let timeDiff = Date.now() - cache.updated;
			logging.log(`Data was cached ${timeDiff / 1e3} seconds ago`);

			if (cache.empty || timeDiff > config.cache.maxAge) {
				// Variables for a request to the file server
				let data = '';
				const options = {
					host: config.fileServer.host,
					port: config.fileServer.port,
					path: '/files/get',
					method: 'GET',
					headers: {
						accept: 'application/json, text/plain'
					}
				};

				// Sending request to the file server
				const reqt = http.request(options, function(resp) {
					// TCP-connection was created
					logging.log('=> Connected to file server, getting files');
					resp.setEncoding('utf8');
					// Chuck of data was received
					resp.on('data', function(chunk) {
						data += chunk;
					});
					// End of data
					resp.on('end', function() {
						logging.log('No more data in response.');
						caching.insert(JSON.parse(data));
						res.end(data);
					});
				});

				reqt.on('error', function(error) {
					logging.error(`Error: ${error.message}`);
				});
				// Ending TCP-connection
				reqt.end();
			} else {
				logging.log('=> Take files from cache');
				let data = JSON.stringify(caching.get().data);
				res.end(data);
			}
		},
		uploadFiles: function(req, res) { // Upload new files request handler
			res.header('StatusCode', '200');
			res.header('Content-Type', 'text/plain; charset=utf-8');

			console.log('=========================');
			console.dir(req);
			console.log('=========================');
			/*let data = '';
			const options = {
				host: config.fileServer.host,
				port: config.fileServer.port,
				path: '/files/upload',
				method: 'POST',
				headers: {
					accept: 'text/plain'
				}
			};

			// Sending request to the file server
			const reqt = http.request(options, function(resp) {
				// TCP-connection was created
				logging.log('=> Connected to file server, sending files');
				resp.setEncoding('utf8');
				// Chuck of data was received
				resp.on('data', function(chunk) {
					data += chunk;
				});
				// End of data
				resp.on('end', function() {
					logging.log('No more data in response.');
					res.end(data);
				});
			});

			reqt.on('error', function(error) {
				logging.error(`Error: ${error.message}`);
			});
			// Ending TCP-connection
			reqt.end();*/

			res.end('Files were received');
		}
	};

	// Routes
	router.get('/', handlers.sendMain);
	router.get('/files/get', handlers.getFiles);
	router.post('/files/upload', handlers.uploadFiles);

	return router;
}

// Exports
module.exports = router_init;