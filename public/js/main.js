window.onload = function() {

	// Constant DOM elements
	const block = document.querySelector('div.app div.block');
	const uploadBlock = document.getElementsByClassName('upload-block')[0];
	const searchBlock = document.querySelector('div.content div.music div.search input');
	const list = document.querySelector('div.content div.music div.tracks ul');
	const playButton = document.querySelector('div.content div.music div.tracks ul li div.btn');
	
	// Constants
	const playerItems = { // Player DOM elements
		buttons: {
			prev: document.querySelector('div.app div.player div.player-content div.btn.btn-prev'),
			play: document.querySelector('div.app div.player div.player-content div.btn.btn-play'),
			next: document.querySelector('div.app div.player div.player-content div.btn.btn-next'),
			repeat: document.querySelector('div.app div.player div.player-content div.btn.btn-repeat'),
			shuffle: document.querySelector('div.app div.player div.player-content div.btn.btn-shuffle'),
		},
		info: {
			time: document.querySelector('div.app div.player div.player-content div.playback-timeline div.time-passed'),
			name: document.querySelector('div.app div.player div.player-content div.track-play div.track-name'),
			timeline: document.querySelector('div.app div.player div.playback-timeline div.time-line-passed')
		}
	};
	const playerInstance = new player(playerItems); // Player instance
	const trackListInstance = new trackList(list); // Player instance

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
		playTrackList: function(event) {
			const listItem = this.parentElement;
			const trackName = listItem.children[1].textContent; // Get clicked track name

			trackListInstance.updatePlayStatus(trackName); // Update track list play status
			playerInstance.updatePlayStatus(trackName); // Update player play status
		},
		playTrackPlayer: function(event) {
			trackListInstance.updatePlayStatus(); // Update track list play status
			playerInstance.updatePlayStatus(); // Update player play status
		},
		nextTrackPlayer: function(event) {
			const nextTrack = playerInstance.getNext(); // Play next track
			if (!!nextTrack) { // Next track is specified
				trackListInstance.updatePlayStatus(nextTrack); // Update track list play status
				playerInstance.updatePlayStatus(nextTrack); // Update player play status
			}
		},
		prevTrackPlayer: function(event) {
			const prevTrack = playerInstance.getPrev(); // Play previous track
			if (!!prevTrack) { // Previous track is specified
				trackListInstance.updatePlayStatus(prevTrack); // Update track list play status
				playerInstance.updatePlayStatus(prevTrack); // Update player play status
			}
		},
		shufflePlayer: function(event) {
			playerInstance.shuffle();
		},
		repeatPlayer: function(event) {
			playerInstance.repeat();
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

	// Player events
	playerItems.buttons.play.addEventListener('click', handlers.playTrackPlayer);
	playerItems.buttons.next.addEventListener('click', handlers.nextTrackPlayer);
	playerItems.buttons.prev.addEventListener('click', handlers.prevTrackPlayer);
	playerItems.buttons.shuffle.addEventListener('click', handlers.shufflePlayer);
	playerItems.buttons.repeat.addEventListener('click', handlers.repeatPlayer);

	// Initial tracklist load
	generating.fillTrackList(list, handlers.playTrackList);
}	