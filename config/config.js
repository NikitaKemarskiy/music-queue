// Config constructor
const config = function(session) {
	
	// Store for sessions
	const MongoStore = require('connect-mongo')(session);

	// Config
	this.server = {
		host: 'localhost', // Server host
		port: 1337 // Server port
	};
	this.fileServer = {
		host: 'localhost', // FileServer host
		port: 1488 // FileServer port
	};
	this.cache = {
		maxAge: /*20 **/ 60e3 // Cache data max age time (20 minutes)
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
