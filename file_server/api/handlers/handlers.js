// Modules
const path = require('path');
const formidable = require('formidable');
const fs = require('fs');

// Libraries
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files

// Constants
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
const STORAGEPATH = path.join(process.cwd(), 'storage'); // Constant value for storage folder

// Functions
const handlersConstructor = function(storage) {

		this.getTracks = function(req, res) {
			storage.getTracksData().then(function(items) {
				res.header('StatusCode', '200'); // Success code
				res.header('Content-Type', 'application/json; charset=utf-8');

				res.end(JSON.stringify(items));
			});
		}
		
		this.playTrack = function(req, res) {
			const data = storage.getTrackData(req.params.track);
			console.log('--------------------');
			console.dir(data);
			if (!data) {
				res.header('StatusCode', '500'); // Server error code
				res.end(`Error: can't play this track`);
			} else {
				res.header('StatusCode', '200'); // Success code
				res.header('Accept-Ranges', 'bytes'); // Accept ranges header
				res.header('Content-Type', data.type); // Content type header
				res.header('Content-Length', data.size); // Content length header
				res.header('Content-Range', `0-${data.size}/${data.size}`); // Content range header
				res.header('X-Content-Type-Options', 'nosniff'); // Prevent browser from defining the MIME-type

				storage.playTrack(req.params.track, res);
			}
		}

		this.uploadFiles = function(req, res) {
			res.header('StatusCode', '200'); // Success code
			res.header('Content-Type', 'text/plain; charset=utf-8');
			res.header('X-Content-Type-Options', 'nosniff'); // Prevent browser from defining the MIME-type

			const form = formidable.IncomingForm(); // Create incoming formidable form
			form.uploadDir = STORAGEPATH; // Upload directory for files
			form.keepExtensions = true; // Keep files extensions
			form.maxFieldsSize = 10 * 1024 * 1024; // Max fields size except files - 10 MB 
			form.multiples = true; // Allow to upload multiple files
			form.hash = false; // Don't create hash
			form.maxFileSize = 50 * 1024 * 1024; // Max track size - 50 MB

			form.on('error', function(error) { // Upload error occured
				logging.error(`Error: ${error.message}`);
				res.end(`Error: files can't be uploaded`);
			});

			form.on('fileBegin', function(name, track) { // New track detected in the upload stream
				track.path = path.join(form.uploadDir, track.name);
			});

			form.on('file', function(name, track) { // New track was received
				const type = '.' + track.type.substring(track.type.indexOf('/') + 1); // Get file extension from track.type
				
				if (fileTypes.includes(type)) { // Uploaded file extension is allowed	
					console.dir({
						size: track.size,
						path: track.path,
						name: track.name,
						type: track.type
					});
					
					storage.addTrack(track.name, track.type, track.size); // Add uploaded track to the storage data object
					res.end();
				} else { // Uploaded file extension isn't allowed
					fs.unlink(track.path, function(error) {
						if (error) {
							logging.error(`Error: ${error.message}`);
						} else {
							logging.log(`File ${track.name} has a forbidden extension`);
						}
					});
				}		
			});

			form.on('end', function() { // Upload was finished
				logging.log(`Files were successfully received`);
				res.end('Files were received');
			});

			form.parse(req); // Parse upload form
		}
}

// Exports
module.exports = handlersConstructor;