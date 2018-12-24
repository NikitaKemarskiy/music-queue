// Constants
const UPLOADURL = '/files/upload';
const PLAYURL = '/files/play/';
const FILESLISTURL = '/files/get';

// Variables
const tracks = new Map(); // Cache for tracks
let audio; // Variable for current audio instance
let currentTrack; // Variable for current track name
let currentButton; // Variable for current play button

const processing = { // Functions for processing some data
	
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

const generating = { // Functions for generating page content

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
		generating.getFilesList().then(function(files) {
			files.forEach(function(track) {
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
			});
		});
	}
};

const upload = { // Functions for uploading new files to server

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

const cache = { // Functions for caching

	// Function that checks cache size and clears it necessary
	checkCacheSize: function() {
		if (tracks.size > 15) { // There're more that 15 tracks in cache
			const keys = [...tracks.keys()];
			console.dir(keys);
			for (let i = 0; i < 3; i++) { // Delete 3 tracks from it
				tracks.delete(keys[i]);
			}
		}
	}
};

const play = { // Functions for playing tracks

	// Function that sends request for playing the track
	load: function(fileName, playButton, playerInstance) {
		playerInstance.updatePlay(fileName, playButton); // Update play on the player
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

	// Function that changes current play button
	changeButton: function(playButton) {
		if (currentButton !== playButton) { // New play button and current play button aren't the same buttons
			currentButton = playButton;	// Change current play button
		}
	}
}

const player = function(playerItems) { // Class for player

	// Method that updates player status
	this.updatePlay = function(fileName, playButton) {
		if (!!playButton) { // Play button is specified
			if (currentTrack === fileName) { // Play/pause current track
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
				if (!tracks.has(fileName)) { // Track is not in the cache
					tracks.set(fileName, new Audio(PLAYURL + fileName)); // Cache current track
					cache.checkCacheSize(); // Check current cache size
				}
				currentTrack = fileName; // Change current track name
				play.changeButton(playButton);
				if (!!audio) { // Audio is not undefined
					audio.removeEventListener('timeupdate', this.updateTime); // Remove timeupdate event listener
				}
				audio = tracks.get(fileName); // Write track from cache into audio variable
				audio.currentTime = 0; // Play from the beginning
				audio.addEventListener('timeupdate', this.updateTime); // Add timeupdate event listener

				playerItems.info.name.textContent = fileName; // Set track name at the player
				
				this.play(); // Play current track on player
				play.play(); // Play current track in the track list
			}
		} else if (!!currentTrack) { // Play button is not specified, current track is specified
			if (currentTrack === fileName) { // Play/pause current track
				if (!audio.paused) { // Current track is playing
					this.pause(); // Pause current track on the player
					play.pause(); // Pause current track in the track list
				} else { // Current track is paused
					this.play(); // Play current track on the player
					play.play(); // Play current track in the track list
				}
			} else { // Play another track
				//...
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

	// Method that updates current track time on player
	this.updateTime = function() {
		console.log(`=> ${audio.currentTime}`);
	}
}