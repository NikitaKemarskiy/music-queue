// Constants
const UPLOADURL = '/files/upload';
const PLAYURL = '/files/play/';
const FILESLISTURL = '/files/get';

// Variables
let audio; // Variable for current audio instance
let currentTrack; // Variable for current track name

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
}

const play = { // Functions for playing tracks

	// Function that sends request for playing the track
	playFile: function(fileName) {
		if (currentTrack === fileName) { // Play/pause current track
			if (!audio.paused) { // Current track is playing
				play.pauseTrack(); // Pause current track
			} else { // Current track is paused
				play.playTrack(); // Play current track
			}
		} else { // Play another track
			if (!!audio && !audio.paused) { // Track is already playing
				play.pauseTrack(); // Pause this track
			}
			currentTrack = fileName; // Change current track name
			audio = new Audio(PLAYURL + fileName); // Create new audio instance
			play.playTrack(); // Play new track
		}
	},

	// Function that plays current track
	playTrack: function() {
		audio.play();
		console.log(`Playing the track: ${currentTrack}`);
	},

	// Function that pauses current track
	pauseTrack: function() {
		audio.pause();
		console.log(`Track was paused: ${currentTrack}`);
	}
}