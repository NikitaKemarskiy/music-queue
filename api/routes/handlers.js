// Modules
const path = require('path');
const request = require('request');

// Libraries
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files
const caching = require(path.join(process.cwd(), 'api', 'caching', 'caching.js')); // Functions for caching tracks data 

// Constants
const UPLOADURL = 'http://localhost:1488/files/upload';
const PLAYURL = 'http://localhost:1488/track/play/';

// Functions
const handlersConstructor = function(config) {
	const handlers = {
		sendMain: function(req, res) { // Send main page request handler
			res.header('StatusCode', '200');
			res.header('Content-Type', 'text/html; charset=utf-8');

			res.render(path.join(process.cwd(), 'public/html/main.hbs'), {});
		},
		getTracks: function(req, res) { // Get list of files request handler
			res.header('StatusCode', '200');
			res.header('Content-Type', 'application/json; charset=utf-8');

			let cache = caching.get();
			let timeDiff = Date.now() - cache.updated;
			logging.log(`Data was cached ${timeDiff / 1e3} seconds ago`);

			if (cache.empty || timeDiff > config.cache.maxAge) { // If cache is empty or outdated - make a request
				// Options for a request to the file server
				const options = {
					url: `http://${config.fileServer.host}:${config.fileServer.port}/files/get`,
					encoding: 'utf8',
					method: 'GET',
					headers: {
						accept: 'application/json, text/plain'
					}
				};
				// Sending request to the file server
				request(options, function(error, response, data) {
					if (error) {
						logging.error(`Error: ${error.message}`);
					} else {
						logging.log('No more data in response.');
						caching.insert(JSON.parse(data));
						
						console.log('=> Data:');
						console.dir(data);
						
						res.end(data);
					}
				});
			} else { // Cache has fresh data
				logging.log('=> Take files from cache');
				let data = JSON.stringify(caching.get().data);

				console.log('=> Data:');
				console.dir(data);
				
				res.end(data);
			}
		},
		playTrack: function(req, res) { // Play the track request handler
			res.header('StatusCode', '200');
			res.header('Content-Type', 'text/plain; charset=utf-8');

			request.get(PLAYURL + req.params.track).pipe(res); // Request to the file server
			logging.log(`Playing the track: ${req.params.track}`);
		},
		uploadTracks: function(req, res) { // Upload new tracks request handler
			res.header('StatusCode', '200');
			res.header('Content-Type', 'text/plain; charset=utf-8');

			req.pipe(request.post(UPLOADURL)).pipe(res); // Piping request to the file server
		}
	}
	return handlers;
};

// Exports
module.exports = handlersConstructor;


