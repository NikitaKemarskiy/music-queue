// Modules
const path = require('path');
const fs = require('fs');

// Libraries
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files

// Constants
const DATAPATH = path.join(process.cwd(), 'api', 'tracks_data', 'data.json');

// Functions
const tracksData = function() {
	let data = {};

	// Function that returns tracks data
	const getTracksData = function() {
		//...
	}

	// Function that updates tracks data
	const updateTracksData = function(data) {
		//...
	}

	// Function that writes tracks data to disk
	const writeTracksData = function() {
		//...
	}

	// Function that reads tracks data from disk
	const readTracksData = function() {
		//...
	}
};

// Exports
module.exports = tracksData;