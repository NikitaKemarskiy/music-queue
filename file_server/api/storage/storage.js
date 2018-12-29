// Modules
const path = require('path');
const fs = require('fs');

// Constants
const STORAGEPATH = path.join(process.cwd(), 'storage'); // Constant value for storage folder
const DATAPATH = path.join(process.cwd(), 'api', 'storage', 'data.json'); // Constant value for the path to data.json

// Libraries
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files

// Functions
const storage = function() {
	const self = this;	
	let data = {};
	let lastUpdate;

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
	this.addTrack = function(name, type, size) {
		data.items.push({
			name,
			type,
			size,
			plays: 0
		});
	}

	// Function that returns one track data
	this.getTrackData = function(track) {
		logging.log(`Looking for this track: ${track}`);
		for (let i = 0; i < data.items.length; i++) {
			logging.dir(data.items[i].name);
			if (data.items[i].name === track) {
				return data.items[i];
			}
		}
		return null;
	}

	// Function that returns tracks data object
	this.getTracksData = function() {
		return new Promise(function(resolve, reject) {
			if ((Date.now() - lastUpdate) > 60 * 1e3) {
				self.saveTracksData().then(function(result) {
					logging.log(result);
					resolve(data);
				}).catch(function(error) {
					logging.error(`Error: ${error.message}`);
					resolve(data);
				});
			} else {
				resolve(data);
			}
		});
	}

	// Function that reads tracks data from data.json file
	this.readTracksData = function() {
		return new Promise(function(resolve, reject) {
			fs.readFile(DATAPATH, 'utf8', function(error, buffer) {
				if (error) {
					logging.error(`Error: ${error.message}`);
					reject(error);
				} else {
					resolve(JSON.parse(buffer));
				}
			});
		});
	}

	// Function that saves tracks data to data.json file
	this.saveTracksData = function() {
		return new Promise(function(resolve, reject) {
			const dataJSON = JSON.stringify(data);
			fs.writeFile(DATAPATH, dataJSON, 'utf8', function(error) {
				if (error) {
					logging.error(`Error: ${error.message}`);
					reject(error);
				} else {
					lastUpdate = Date.now();
					resolve('Data.json was written');
				}
			});
		});
	}

	// Function that initializes new storage item
	this.initialize = function() {
		return new Promise(function(resolve, reject) {
			self.readTracksData().then(function(obj) {
				data = obj;
				if (!data.hasOwnProperty('items')) {
					data.items = [];
				}
				lastUpdate = Date.now();
				logging.log('=============');
				logging.dir(data);
				logging.log('=============');
				resolve('Storage was initialized');
			}).catch(function(error) {
				reject(error);
			});
		});
	}

	this.playTrack = function(track, res) {
		const readStream = fs.createReadStream(path.join(STORAGEPATH, track));
		readStream.pipe(res);
		readStream.on('end', function() {
			logging.log(`The ${track} was sent for playing`);
		});
	}
}

// Exports
module.exports = storage;


