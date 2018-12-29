// Modules
const path = require('path');
const request = require('request');

// Libraries
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files
const caching = require(path.join(process.cwd(), 'api', 'caching', 'caching.js')); // Functions for caching tracks data 

// Functions
const handlersConstructor = function(config) {
	// Constants
	const GETURL = `http://${config.fileServer.host}:${config.fileServer.port}/tracks/get`;
	const PLAYURL = `http://${config.fileServer.host}:${config.fileServer.port}/tracks/play/`;
	const FINDURL = `http://${config.fileServer.host}:${config.fileServer.port}/tracks/find/`;
	
	const handlers = {
		sendMain: function(req, res) { // Send main page request handler
			res.header('StatusCode', '200');
			res.header('Content-Type', 'text/html; charset=utf-8');
			res.header('X-Content-Type-Options', 'nosniff'); // Prevent browser from defining the MIME-type

			res.render(path.join(process.cwd(), 'public/html/main.hbs'), {});
		},
		getTracks: function(req, res) { // Get list of files request handler
			res.header('StatusCode', '200');
			res.header('Content-Type', 'application/json; charset=utf-8');
			res.header('X-Content-Type-Options', 'nosniff'); // Prevent browser from defining the MIME-type

			let cache = caching.get();
			let timeDiff = Date.now() - cache.updated;
			logging.log(`Data was cached ${timeDiff / 1e3} seconds ago`);

			if (cache.empty || timeDiff > config.cache.maxAge) { // If cache is empty or outdated - make a request
				// Options for a request to the file server
				const options = {
					url: GETURL,
					encoding: 'utf8',
					method: 'GET',
					headers: {
						accept: 'application/json, text/plain'
					}
				};
				// Sending request to the file server
				request(options, function(error, response, data) {
					if (error) {
						logging.error(`Error: ${error.message}, ${error.fileName} at ${error.lineNumber}`);
					} else {
						caching.insert(JSON.parse(data));
						
						console.log('=> Data:');
						console.dir(data);
						
						res.end(data);
					}
				});
			} else { // Cache has fresh data
				logging.log('=> Take files from cache');
				const data = JSON.stringify(caching.get().data);
				
				res.end(data);
			}
		},
		findTrack: function(req, res) { // Find track request handler
			res.header('StatusCode', '200');
			res.header('Content-Type', 'application/json; charset=utf-8');
			res.header('X-Content-Type-Options', 'nosniff'); // Prevent browser from defining the MIME-type

			let cache = caching.get();
			let timeDiff = Date.now() - cache.updated;
			logging.log(`Data was cached ${timeDiff / 1e3} seconds ago`);

			if (cache.empty || timeDiff > config.cache.maxAge) { // If cache is empty or outdated - make a request
				// Options for a request to the file server
				const options = {
					url: GETURL,
					encoding: 'utf8',
					method: 'GET',
					headers: {
						accept: 'application/json, text/plain'
					}
				};
				// Sending request to the file server
				request(options, function(error, response, data) {
					if (error) {
						logging.error(`Error: ${error.message}, ${error.fileName} at ${error.lineNumber}`);
					} else {
						data = JSON.parse(data);
						caching.insert(data);
						
						const tracksFound = data.items.filter(function(item) {
							if (item.name.toLowerCase().indexOf(req.params.track.toLowerCase()) > -1) {
								return item;
							}
						});

						data = JSON.stringify({
							items: tracksFound
						});

						res.end(data);
					}
				});
			} else { // Cache has fresh data
				logging.log('=> Take files from cache');
				let data = caching.get().data;

				const tracksFound = data.items.filter(function(item) {
					if (item.name.toLowerCase().indexOf(req.params.track.toLowerCase()) > -1) {
						return item;
					}
				});
				
				data = JSON.stringify({
					items: tracksFound
				});

				res.end(data);
			}
		},
		playTrack: function(req, res) { // Play track request handler
			request.get(PLAYURL + encodeURIComponent(req.params.track)).pipe(res); // Request to file server
		},
		uploadTracks: function(req, res) { // Upload new tracks request handler
			req.pipe(request.post(UPLOADURL)).pipe(res); // Piping request to the file server
			caching.outdate();
		}
	}
	return handlers;
};

// Exports
module.exports = handlersConstructor;


