// Constants
const FILESLISTURL = '/tracks/get';
const PLAYURL = '/tracks/play/';
const UPLOADURL = '/tracks/upload';

// Variables
const cacheMap = new Map(); // Cache for tracks
let tracks = Object.create({}); // Object for tracks
let audio; // Variable for current audio instance

// Functions for processing some data
const processing = {
	
	// Function that creates form data with files to upload
	createUploadFormData: function(files) {
		
		let formData = new FormData(); // New form data, that will contain info for uploading and files

		for (let i = 0; i < files.length; i++) { // Adding files to upload
			formData.append('files', files[i]);
		}

		return formData;
	},

	// Function that prevent click event for parental elements
	preventClickForParentalElement: function(event) {

		if (!event) { // Prevent click event for parental li element (storage item)
			event = window.event;
		}
    	event.cancelBubble = true;
    	if (event.stopPropagation) event.stopPropagation();
	}
};

// Functions for generating page content
const generating = {

	// Function that gets list of files in storage
	getFilesList: function() {
		return new Promise(function(resolve, reject) {
			let xhttp = new XMLHttpRequest();
				
			// AJAX request finished
			xhttp.onreadystatechange = function() {
				if (this.readyState === 4 && this.status === 200) {
					let files = JSON.parse(this.responseText);
					files = [...files.items];
					resolve(files);
				}
			};
			
			xhttp.open('GET', FILESLISTURL, true);
			xhttp.send();
		});
	},

	// Function that clears track list
	clearTrackList: function(trackList) {
		while (trackList.firstChild) {
		    trackList.removeChild(trackList.firstChild);
		}
	},

	// Function that fills track list
	fillTrackList: function(trackList, handler) {
		tracks = Object.create({});
		generating.getFilesList().then(function(files) {
			files.forEach(function(track, index) {
				// List item DOM element
				let trackItem = document.createElement('li');
				trackItem.className = 'track-item';
				
				// Items inside list item
				let trackItemBtn = document.createElement('div');
				trackItemBtn.className = 'btn';
				trackItemBtn.onclick = handler;
				let trackItemName = document.createElement('p');
				let trackItemNameText = document.createTextNode(track.name);
				trackItemName.className = 'track-name';
				let trackItemInfo = document.createElement('div');
				trackItemInfo.className = 'info';
				let trackItemInfoParagraph = document.createElement('p');
				let trackItemInfoParagraphText = document.createTextNode(`${track.plays} plays`);

				// Appending childs
				trackItemName.appendChild(trackItemNameText);
				trackItemInfoParagraph.appendChild(trackItemInfoParagraphText);
				trackItemInfo.appendChild(trackItemInfoParagraph);
				trackItem.appendChild(trackItemBtn);
				trackItem.appendChild(trackItemName);
				trackItem.appendChild(trackItemInfo);

				// Appending track item inside list
				trackList.appendChild(trackItem);

				// Add track to track object
				tracks[track.name] = index;
			});
		});
	}
};

// Functions for uploading new files to server
const upload = {

	// Function that sends new files to server
	sendNewFiles: function(files) {

		// Creating form data with files to upload
		let formData = processing.createUploadFormData(files); 
		// Creating new instance of XMLHttpRequest for sending AJAX-requests
		let xhttp = new XMLHttpRequest();
		
		// AJAX request finished
		xhttp.onreadystatechange = function() {
			if (this.readyState === 4 && this.status === 200) {
				console.log('===================');
				console.log(this.response.toString());
				console.log('===================');
			}
		};
		
		xhttp.open('POST', UPLOADURL, true);
		xhttp.send(formData);
	}
};

// Functions for caching
const caching = {

	// Function that checks cache size and clears it necessary
	checkCacheSize: function() {
		if (cacheMap.size > 15) { // There're more that 15 tracks in cache
			const keys = [...cacheMap.keys()];
			console.dir(keys);
			for (let i = 0; i < 3; i++) { // Delete 3 tracks from it
				cacheMap.delete(keys[i]);
			}
		}
	},

	cacheTrack: function(track) {
		if (!cacheMap.has(track)) { // Track is not in the cache
			cacheMap.set(track, new Audio(PLAYURL + track)); // Cache current track
			caching.checkCacheSize(); // Check current cache size
		}
	},

	// Function that gets track duration
	getDuration: function (track, callback) {
		if (!track.duration || track.duration === Infinity) {
			track.addEventListener("durationchange", function (e) {
				if (this.duration !== Infinity) {
					track.remove();
					track.currentTime = 0;
					track.volume = 1;
					callback(this.duration);
				};
			}, false);
			track.currentTime = 24*60*60; //fake big time
			track.volume = 0;
			track.play();
		} else {
			callback(track.duration);
		}
	}
};


// Class for track list
const trackList = function(list) {
	const listItems = list.children;
	let currentButton; // Variable for current play button
	
	this.updatePlayStatus = function(track) {
		if (track) { // Track is specified
			index = tracks[track]; 
			const playButton = listItems[index].children[0];

			if (currentButton === playButton) { // Play/pause current track
				if (audio.paused) { // Audio isn't playing
					this.changeStyles.play();
				} else { // Audio is playing
					this.changeStyles.pause();
				}
			} else { // Play another track
				if (!!currentButton) { // Current button is specified
					this.changeStyles.pause(); // Pause previous track
				}
				currentButton = playButton;
				this.changeStyles.play();
			}
		} else if (!track && !!audio) { // Track isn't specified and audio is specified -> play/pause current track
			if (audio.paused) { // Audio isn't playing
				this.changeStyles.play();
			} else { // Audio is playing
				this.changeStyles.pause();
			}
		}
	}

	this.changeStyles = {
		play: function() {
			currentButton.style.backgroundImage = `url('/img/pauseTrack.svg')`;
			currentButton.style.backgroundSize = `60% 60%`;
		},
		pause: function() {
			currentButton.style.backgroundImage = `url('/img/playTrack.svg')`;
			currentButton.style.backgroundSize = `70% 70%`;
		}
	};
}

// Class for player
const player = function(playerItems) {

	let currentTrack; // Variable for current track name
	let shuffle = false; // Is playing shuffled
	let repeat = false; // Is playing repeated

	// Handler for time update event
	const updateTime = function() {
		console.log(`=> current time: ${audio.currentTime}, duration: ${audio.duration}`);
		if (audio.ended) {
			// play next track
		}
	}

	// Method that updates current play status
	this.updatePlayStatus = function(track) {
		if (!!track) {
			if (!audio) { // Audio isn't specified
				this.play(track);
				this.changeStyles.play(track);
			} else if (track === currentTrack) { // Play/pause current track
				if (audio.paused) { // Audio is paused
					this.play();
					this.changeStyles.play();
				} else { // Audio is playing
					this.pause();
					this.changeStyles.pause();
				}
			} else { // Play another track
				this.play(track);
				this.changeStyles.play(track);
			}
		} else if (!!audio) { // Track isn't specified and audio is specified
			if (audio.paused) { // Audio is paused
				this.play();
				this.changeStyles.play();
			} else { // Audio is playing
				this.pause();
				this.changeStyles.pause();
			}
		}
	}

	// Method that starts playing
	this.play = function(track) {
		if (!track && !!audio) { // Track isn't specified and current audio is specified
			audio.play(); // Play current track
		} else if (!!track && !!audio) { // Track and current audio are specified  

			if (track === currentTrack) { // Play current track
				audio.play();
			} else { // Play another track
				if (!audio.paused) { // Audio is playing
					audio.pause(); // Pause it
				}
				audio.removeEventListener('timeupdate', updateTime); // Remove timeupdate event listener
				caching.cacheTrack(track); // Caching this track
				audio = cacheMap.get(track); // Get this track from cache
				caching.getDuration(audio, function(duration) { // Get the audio duration
					console.log(`Got the duration: ${duration}`);
					audio.addEventListener('timeupdate', updateTime); // Add timeupdate event listener
					audio.currentTime = 0; // Play from the beginning
					currentTrack = track; // Save track name inside the current track variable
					audio.play();
				});
			}

		} else if (!!track && !audio) { // Track is specified and current audio isn't specified
			
			caching.cacheTrack(track); // Caching this track
			audio = cacheMap.get(track); // Get this track from cache
			caching.getDuration(audio, function(duration) {
				console.log(`Got the duration: ${duration}`);
				audio.addEventListener('timeupdate', updateTime); // Add timeupdate event listener
				currentTrack = track; // Save track name inside the current track variable
				audio.play();
			});
		}
	}

	// Method that pauses playing
	this.pause = function() {
		if (!!audio) {
			audio.pause();
		}
	}

	// Methods for changing styles
	this.changeStyles = {
		play: function(track) {
			playerItems.buttons.play.style.background = `url('/img/pause.svg') no-repeat 55% center`;
		},
		pause: function() {
			playerItems.buttons.play.style.background = `url('/img/play.svg') no-repeat 55% center`;
		},
		shuffle: function() {
			if (shuffle) {
				playerItems.buttons.shuffle.style.background = "url('/img/shuffleActive.svg') no-repeat 55% center";
			} else {
				playerItems.buttons.shuffle.style.background = "url('/img/shuffle.svg') no-repeat 55% center";
			}
		},
		repeat: function() {
			if (repeat) {
				playerItems.buttons.repeat.style.background = "url('/img/repeatActive.svg') no-repeat 55% center";
			} else {
				playerItems.buttons.repeat.style.background = "url('/img/repeat.svg') no-repeat 55% center";
			}
		}
	};
}

















/*const play = { // Functions for playing tracks

	// Function that sends request for playing the track
	load: function(trackName, playButton, playerInstance) {
		playerInstance.updatePlay(trackName, playButton); // Update play on the player
	},

	// Function that plays current track
	play: function() {
		currentButton.style.backgroundImage = `url('/img/pauseTrack.svg')`;
		currentButton.style.backgroundSize = `60% 60%`;
		console.log(`Playing the track: ${currentTrack}`);
	},

	// Function that pauses current track
	pause: function() {
		currentButton.style.backgroundImage = `url('/img/playTrack.svg')`;
		currentButton.style.backgroundSize = `70% 70%`;

		console.log(`Track was paused: ${currentTrack}`);
	},

	// Function that starts playing the next track
	next: function(playerInstance, repeat) {
		if (!!currentTrack) {
			if (!repeat) {
				const trackList = document.querySelector('div.content div.music div.tracks ul');
				const listItems = trackList.children;
				let index = 0;
				for (let i = 0; i < listItems.length - 1; i++) {
					if (listItems[i].children[1].textContent === currentTrack) {
						index = i + 1;
					}
				}
				play.load(listItems[index].children[1].textContent, listItems[index].children[0], playerInstance);
			} else {
				play.load(currentTrack, currentButton, playerInstance);
			}
		}
	},

	// Function that starts playing the previous track
	prev: function(playerInstance) {
		if (!!currentTrack) {
			const trackList = document.querySelector('div.content div.music div.tracks ul');
			const listItems = trackList.children;
			let index = listItems.length - 1;
			for (let i = 1; i < listItems.length; i++) {
				if (listItems[i].children[1].textContent === currentTrack) {
					index = i - 1;
				}
			}
			play.load(listItems[index].children[1].textContent, listItems[index].children[0], playerInstance);
		}
	},

	// Function that changes current play button
	changeButton: function(playButton) {
		if (currentButton !== playButton) { // New play button and current play button aren't the same buttons
			currentButton = playButton;	// Change current play button
		}
	}
}

const player = function(playerItems) { // Class for player

	const self = this; // Link on this for inner methods
	let repeat = false; // Is playing reversed

	// Method that updates player status
	this.updatePlay = function(trackName, playButton) {
		if (!!playButton) { // Play button is specified
			if (currentTrack === trackName) { // Play/pause current track
				if (!audio.paused) { // Current track is playing
					this.pause(); // Pause current track on the player
					play.pause(); // Pause current track in the track list
				} else { // Current track is paused
					this.play(); // Play current track on the player
					play.play(); // Play current track in the track list
				}
			} else { // Play another track
				if (!!audio && !audio.paused) { // Track is already playing
					this.pause(); // Pause current track on the player
					play.pause(); // Pause current track in the track list
				}
				if (!tracks.has(trackName)) { // Track is not in the cache
					tracks.set(trackName, new Audio(PLAYURL + trackName)); // Cache current track
					cache.checkCacheSize(); // Check current cache size
				}
				play.changeButton(playButton); // Change play button
				currentTrack = trackName; // Change current track name
				if (!!audio) { // Audio is not undefined
					audio.removeEventListener('timeupdate', this.updateTime); // Remove timeupdate event listener
				}
				audio = tracks.get(trackName); // Write track from cache into audio variable
				audio.currentTime = 163; // Play from the beginning
				audio.addEventListener('timeupdate', this.updateTime); // Add timeupdate event listener

				playerItems.info.name.textContent = trackName; // Set track name at the player
				
				this.play(); // Play current track on player
				play.play(); // Play current track in the track list
			}
		} else if (!!currentTrack) { // Play button is not specified, current track is specified
			if (currentTrack === trackName) { // Play/pause current track
				if (!audio.paused) { // Current track is playing
					this.pause(); // Pause current track on the player
					play.pause(); // Pause current track in the track list
				} else { // Current track is paused
					this.play(); // Play current track on the player
					play.play(); // Play current track in the track list
				}
			}
		}
	}

	// Method that starts playing with player
	this.play = function() {
		audio.play(); // Start playing
		playerItems.buttons.play.style.background = `url('/img/pause.svg') no-repeat 55% center`;
	}

	// Method that pauses playing with player
	this.pause = function() {
		audio.pause(); // Pause playing
		playerItems.buttons.play.style.background = `url('/img/play.svg') no-repeat 55% center`;
	}

	// Function that shuffles the playing
	this.shuffle = function() {
		if (!shuffle) {
			shuffle = true;
			playerItems.buttons.shuffle.style.background = "url('/img/shuffleActive.svg') no-repeat 55% center";
		} else {
			shuffle = false;
			playerItems.buttons.shuffle.style.background = "url('/img/shuffle.svg') no-repeat 55% center";
		}
	}

	// Function that repeats the playing
	this.repeat = function() {
		if (!repeat) {
			repeat = true;
			playerItems.buttons.repeat.style.background = "url('/img/repeatActive.svg') no-repeat 55% center";
		} else {
			repeat = false;
			playerItems.buttons.repeat.style.background = "url('/img/repeat.svg') no-repeat 55% center";
		}
	}

	// Method that updates current track time on player
	this.updateTime = function() {
		if (audio.ended) {
			play.next(self, repeat);
		}
	}
}*/