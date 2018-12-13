// Modules
const path = require('path');
const fs = require('fs');

// Constants
const STORAGEPATH = path.join(process.cwd(), 'storage'); // Constant value for storage folder

// Libraries
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files

// Functions
const storage = {
	getFilesJSON: function() {
		return new Promise(function(resolve, reject) {
			fs.readdir(STORAGEPATH, 'utf8', function(error, items) {
				if (error) {
					reject(error);
				} else {
					resolve(items);
				}
			});
		});
	}
}

module.exports = storage;


