window.onload = function() {
	// Constant DOM elements
	const block = document.querySelector('div.app div.block');
	const uploadBlock = document.getElementsByClassName('upload-block')[0];
	const trackList = document.querySelector('div.content div.music div.tracks ul');
	const playButton = document.querySelector('div.content div.music div.tracks ul li div.btn');

	// Variables
	let dragenterCounter = 0; // Counter for drag events to prevent dragleave event when hover child elements

	// Functions for handling the events
	const handlers = {
		uploadStopPropagnation: function(event) {
			event.preventDefault();
	    	event.stopPropagation();
		},
		uploadRemoveUnvisibleClass: function(event) {
			uploadBlock.classList.remove('unvisible'); // Removing unvisible class from uploadBlock
		},
		increaseDragenterCounter: function(event) {
			dragenterCounter++; // Incrementing drag counter
		},
		decreaseDragenterCounter: function(event) {
			dragenterCounter--; // Decrementing drag counter
			// If dragleave occured to storage window -> make "drag and drop" window invisible
			if (dragenterCounter <= 0) { 
			  	uploadBlock.classList.add('unvisible');
			}
		},
		sendDroppedFile: function(event) {
			uploadBlock.classList.add('unvisible');
			dragenterCounter = 0;

			// Getting dropped files
			let files = event.dataTransfer.files; 
			// Sending new files to server
			upload.sendNewFiles(files);
		},
		playTrack: function(event) {
			const listItem = this.parentElement;
			let index = 0; 
			for (let i = 0; i < listItem.children.length; i++) {
				if (listItem.children[i].className === 'track-name') {
					index = i;
					break;
				}
			}
			const trackName = listItem.children[index].textContent;
			play.playFile(trackName);
		}
	}

	// Drag events for uploading files
	block.addEventListener('drag', handlers.uploadStopPropagnation);
	block.addEventListener('dragstart', handlers.uploadStopPropagnation);
	block.addEventListener('dragend', handlers.uploadStopPropagnation);
	block.addEventListener('dragover', handlers.uploadStopPropagnation);
	block.addEventListener('dragenter', handlers.uploadStopPropagnation);
	block.addEventListener('dragleave', handlers.uploadStopPropagnation);
	block.addEventListener('drop', handlers.uploadStopPropagnation);
	block.addEventListener('dragover', handlers.uploadRemoveUnvisibleClass);
	block.addEventListener('dragenter', handlers.uploadRemoveUnvisibleClass);
	block.addEventListener('dragenter', handlers.increaseDragenterCounter);
	block.addEventListener('dragleave', handlers.decreaseDragenterCounter);
	block.addEventListener('drop', handlers.sendDroppedFile);

	// Initial tracklist load
	generating.fillTrackList(trackList, handlers.playTrack);
}	