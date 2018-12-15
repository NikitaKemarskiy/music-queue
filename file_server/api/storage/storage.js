// Modules
const path = require('path');
const fs = require('fs');

// Constants
const STORAGEPATH = path.join(process.cwd(), 'storage'); // Constant value for storage folder
const DATAPATH = path.join(process.cwd(), 'api', 'storage', 'data.json'); // Constant value for data.json

// Libraries
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files

// Functions
const functions = {
	readDataJSON: function() {
		try {
			let data = fs.readFileSync(DATAPATH, 'utf8');
			return JSON.parse(data);
		} catch(error) {
			logging.error(`Error: ${error.message}`);
		}
	},
	writeDataJSON: function(data) {
		return new Promise(function(resolve, reject) {
			let dataJSON = JSON.stringify(data);
			fs.writeFile(DATAPATH, dataJSON, 'utf8', function(error) {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	}
};

// Storage
const storage = function() {
	
	// Read tracks data from data.json file, write it into object to use it
	let data = functions.readDataJSON();

	// Function that increments plays counter of a special track
	this.addPlay = function(track) {
		for (let i = 0; i < data.items.length; i++) {
			if (data.items[i].name === track) {
				data.items[i].plays++;
				break;
			}
		}
	}

	// Function that adds track to tracks data object
	this.addTrack = function(track) {
		data.items.push({
			name: track,
			plays: 0
		});
	}

	// Function that returns tracks data object
	this.getTracksData = function() {
		return data;
	}

	// Function that saves tracks data to data.json file
	this.saveTracksData = function() {
		return new Promise(function(resolve, reject) {
			writeDataJSON(data).then(function() {
				resolve();
			}).catch(function(error) {
				reject(error);
			});
		});
	}

	// Interval for saving tracks data to data.json file once in 30 minutes
	setInterval(this.saveTracksData, 30 * 60 * 1e3);
}

// Exports
module.exports = new storage();


