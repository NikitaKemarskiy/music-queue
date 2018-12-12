// Modules
const path = require('path');
const mysql = require('mysql');

// MySQL queries
const query = require('./query.json');

// Functions
const logging = require(path.join(process.cwd(), 'api', 'logging', 'logging.js')); // Functions for logging in logs files

// Database constructor
const database = function(config) {

	const db = mysql.createConnection({
		host: config.host,
		port: config.port,
		user: config.user,
		password: config.password,
		database: config.database
	});

	this.connect = function() {
		return new Promise(function(resolve, reject) {
			db.connect(function(error) {
				if (error) {
			  	console.error(`Error: ${error.message}`);
			  } else {
			  	resolve(`MySQL database was connected at ${config.host}:${config.port}`);
			  }
			});
		});
	}

	this.destroy = function() {
		return new Promise(function(resolve, reject) {
			db.end(function(error) {
				if (error) {
			  	console.error(`Error: ${error.message}`);
			  } else {
			  	resolve(`MySQL database connection was closed`);
			  }
			});
		});
	}
}

module.exports = database;


