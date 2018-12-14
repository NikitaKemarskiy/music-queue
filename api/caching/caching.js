// Modules
const path = require('path');

// Functions
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files

// Database constructor
const caching = function() {
	const cache = {
		empty: true,
		updated: Date.now(),
		data: {}
	};

	this.insert = function(data) {
		logging.log(`Data was cached: ${data}`);
		if (cache.empty) {
			cache.empty = false;
		}
		cache.data = data;
		cache.updated = Date.now();
	}

	this.get = function() {
		return cache;
	}

	this.getUpdateTime = function() {
		return cache.updated;
	}
};

// Exports
module.exports = new caching();