// Modules
const path = require('path');

// Functions
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files

// Database constructor
const caching = function() {
	// Cache
	const cache = {
		empty: true,
		updated: Date.now(),
		data: {}
	};

	// Insert new data into the cache
	this.insert = function(data) {
		logging.log(`Data was cached: ${data}`);
		if (cache.empty) {
			cache.empty = false;
		}
		cache.data = data;
		cache.updated = Date.now();
	}

	// Get data from the cache
	this.get = function() {
		return cache;
	}

	// Make cache outdated
	this.outdate = function() {
		cache.updated -= 24 * 60 * 60e3;
	}
};

// Exports
module.exports = new caching();