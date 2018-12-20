// Modules
const path = require('path');
const formidable = require('formidable');
const http = require('http');
const fs = require('fs');

// Libraries
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files
const caching = require(path.join(process.cwd(), 'api', 'caching', 'caching.js')); // Functions for caching tracks data 

// Functions
const handlersConstructor = function(config) {
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

						console.log('=> Data:');
						console.dir(data);
						
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

				console.log('=> Data:');
				console.dir(data);
				
				res.end(data);
			}
		},
		uploadFiles: function(req, res) { // Upload new files request handler
			res.header('StatusCode', '200');
			res.header('Content-Type', 'text/plain; charset=utf-8');

			const form = formidable.IncomingForm(); // Create incoming formidable form
			form.uploadDir = path.join(process.cwd(), 'files'); // Upload directory for files
			form.keepExtensions = true; // Keep files extensions
			form.maxFieldsSize = 10 * 1024 * 1024; // Max fields size except files - 10 MB 
			form.multiples = true; // Allow to upload multiple files
			form.hash = false; // Don't create hash
			form.maxFileSize = 50 * 1024 * 1024; // Max file size - 50 MB

			form.on('error', function(error) { // Upload error occured
				logging.error(`Error: ${error.message}`);
				res.end(`Error: files can't be uploaded`);
			});

			form.on('fileBegin', function(name, file) { // New file detected in the upload stream
				file.path = path.join(form.uploadDir, file.name);
			});

			form.on('file', function(name, file) { // New file was received
				console.dir({
					size: file.size,
					path: file.path,
					name: file.name,
					type: file.type
				});
			});

			form.on('end', function() { // Upload was finished
				logging.log(`Files were successfully received`);
				res.end('Files were received');
			});

			form.parse(req);
		}
	}
	return handlers;
};

// Exports
module.exports = handlersConstructor;


