// Config constructor
const config = function(session) {
	
	// Store for sessions
	const MongoStore = require('connect-mongo')(session);

	// Config
	this.database = {
		host: 'localhost', // Database host
		port: '3306', // Database port
		user: 'root', // Database user
		password: 'nikita12', // Database password
		database: 'music_queue', // Database name
	};
	this.server = {
		host: 'localhost', // Server host
		port: '1337' // Server port
	};
	this.session = {
		name: 'session_id', // Name of session id value
		secret: 'musicServiiceSecretKey', // Secret key for encrypting
		resave: true,
		saveUninitialized: true,
		cookie: {
			path: '/',
			maxAge: 6.048e8, // Session expires in a week
			httpOnly: true // Cookie isn't visible for client-side javascript
		},
		store: new MongoStore({
	      	url: 'mongodb://localhost/music_service_sessions'
	    })
	};
}

module.exports = config;

// 77.47.209.52
