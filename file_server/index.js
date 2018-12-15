// Modules
const express = require('express');
const path = require('path');
const multer = require('multer');

// Logging
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files

// Constants
const STORAGEPATH = path.join(process.cwd(), 'storage'); // Constant value for storage folder
const fileTypes = [	// Audio files types
	'.3gp', '.aa', '.aac', '.aax', '.act',
	'.aiff', '.amr', '.ape', '.au', '.awb',
	'.dct', '.dss', '.dvf', '.flac', '.gsm',
	'.iklax', '.ivs', '.m4a', '.m4b', '.m4p',
	'.mmf', '.mp3', '.mpc', '.msv', '.nsf',
	'.ogg', '.oga', '.mogg', '.opus', '.ra',
	'.rm', '.raw', '.sln', '.tta', '.vox',
	'.wav', '.wma', '.wv', '.webm', '.8svx'
];

// Configuration
const config = require(path.join(process.cwd(), 'config', 'config.js'));

// Initialization
const server = express(); // Server
logging.startLogging(); // Open writable streams for logging
const uploadStorage = multer.diskStorage({
	destination: function (req, file, callback) { // Function which sets the folder for uploading files
		let uploadPath = path.join(STORAGE_PATH, req.body.email, req.body.path); // Path for uploading files
		callback(null, uploadPath);
	},
	filename: function (req, file, callback) { // Functions which sets uploaded file name
		callback(null, file.originalname);
	}
});
const upload = multer({ 
	storage: uploadStorage,
	limits: {
		fileSize: 1024 * 1024 * 1024 // 1GB limit 
	}
}).array('files');

// Libraries
const storage = require(path.join(process.cwd(), 'api', 'storage', 'storage.js')); // Functions for work with storage

// Process listeners
process.on('exit', function(code) { // Exit the program listener
	logging.log(`Closing the program... Status code: ${code}`);
	logging.endLogging();
});

process.on('uncaughtException', function(error) { // Uncaught error listener
	logging.error(`Error: ${error.message}`);
	storage.saveTracksData().then(function() {
		process.exit(1); // Exit the program with a status code 1 (error)
	}).catch(function(error) {
		logging.error(`Error: ${error.message}`);
		process.exit(1); // Exit the program with a status code 1 (error)
	});
});

process.on('SIGTERM', () => { // SIGTERM Linux signal listener
	logging.log('SIGTERM signal received.');
	storage.saveTracksData().then(function() {
		process.exit(0); // Exit the program with a status code 0 (success)
	}).catch(function(error) {
		logging.error(`Error: ${error.message}`);
		process.exit(0); // Exit the program with a status code 0 (success)
	});
});

process.on('SIGINT', () => { // SIGINT Linux signal listener
	logging.log('SIGINT signal received.');
	storage.saveTracksData().then(function() {
		process.exit(0); // Exit the program with a status code 0 (success)
	}).catch(function(error) {
		logging.error(`Error: ${error.message}`);
		process.exit(0); // Exit the program with a status code 0 (success)
	});
});

// Routes
server.get('/files/get', function(req, res) { // Get files get request handler
	try {
		const items = storage.getTracksData();
		res.header('StatusCode', '200'); // Success code
		res.header('Content-Type', 'application/json; charset=utf-8');

		res.end(JSON.stringify(items));
	} catch(error) {
		res.header('StatusCode', '500'); // Internal server error code
		res.header('Content-Type', 'text/plain; charset=utf-8');

		res.end(`Error: ${error.message}`);
		logging.error(`Error: ${error.message}`);
	}
});

server.post('/files/upload', function(req, res) { // Upload files post request handler

	upload(req, res, function(error) { // Calling function for files upload
		if (error instanceof multer.MulterError) { // Error (invalid files)
	    	logging.error(`Error: ${error.message}`);
	    	res.header('StatusCode', '400');
	    	res.end('Error uploading files');
	    } else if (error) { // Unhandled error in code
	    	logging.error(`Error: ${error.message}`);
	    	res.header('StatusCode', '400');	
	    	res.end('Error uploading files');
	    } else { // Everything is ok
	    	logging.dir(req.files);
	    	
	    	res.header('StatusCode', '200');	
	    	res.end('Files were uploaded');
		}
	});
});

// Express.js
server.listen(config.server.port, config.server.host, function(error) {
	if (error) {
		logging.error(`File server error: ${error.message}`);
	} else {
		logging.log(`File server is listening at ${config.server.host}:${config.server.port}`);
	}
});