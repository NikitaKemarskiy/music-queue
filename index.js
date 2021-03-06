// Modules
const express = require('express');
const http = require('http');
const path = require('path');
const hbs = require('express-handlebars');
const session = require('express-session');

// Libraries
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files

// Configuration
const configConstructor = require(path.join(process.cwd(), 'config', 'config.js')); // We use constructor to pass session module
const config = new configConstructor(session);

// Initialization
const server = express(); // Server
logging.startLogging(); // Open writable streams for logging

// Process listeners
process.on('exit', function(code) { // Exit the program listener
	logging.log(`Closing the program... Status code: ${code}`);
	logging.endLogging();
});

process.on('uncaughtException', function(error) { // Uncaught error listener
	logging.error(`Error: ${error.message}, ${error.fileName} at ${error.lineNumber}`);
	process.exit(1); // Exit the program with a status code 1 (error)
});

process.on('SIGTERM', () => { // SIGTERM Linux signal listener
	logging.log('SIGTERM signal received.');
	process.exit(0); // Exit the program with a status code 0 (success)
});

process.on('SIGINT', () => { // SIGINT Linux signal listener
	logging.log('SIGINT signal received.');
	process.exit(0); // Exit the program with a status code 0 (success)
});

// Middleware
server.engine('hbs', hbs({ extname: 'hbs' })); // Templating ("Handlebars") 
server.set('view engine', 'hbs');
server.set('views', __dirname);
server.use(session(config.session)); // Session
server.use(express.static(path.join(process.cwd(), 'public'))); // Static files

// Routes
const routes = require('./api/routes/routes.js')(config); // Routing file
server.use('/', routes); // Routing

server.use(function(req, res, next) { // Error 404
	res.status(404).send("Error 404: page not found");
});

// Express.js
server.listen(config.server.port, config.server.host, function(error) {
	if (error) {
		logging.error(`Server error: ${error.message}, ${error.fileName} at ${error.lineNumber}`);
	} else {
		logging.log(`Server is listening at ${config.server.host}:${config.server.port}`);
	}
});