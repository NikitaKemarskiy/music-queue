window.onload = function() {
	// Constant DOM elements
	const block = document.querySelector('div.app div.block');
	const uploadBlock = document.getElementsByClassName('upload-block')[0];
	// Track list <li> item
	//document.getElementsByClassName('track-item');

	// Variables
	let dragenterCounter = 0; // Counter for drag events to prevent dragleave event when hover child elements

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
		}
	}

	// Drag events for uploading files
	/*['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(function(event) {
		block.addEventListener(event, handlers.uploadStopPropagnation);
	});*/
	/*['dragover', 'dragenter'].forEach(function(event) {
		block.addEventListener(event, handlers.uploadRemoveUnvisibleClass);
	});*/
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
	block.addEventListener('drop', handlers.increaseDragenterCounter);
}	

	// Drag events for uploading files
	/*storage.on('drag dragstart dragend dragover dragenter dragleave drop', function(event) {
			event.preventDefault();
	    	event.stopPropagation();
		})
		.on('dragover dragenter', function() {
			upload_block.removeClass('unvisible');
		})
		=========
		.on('dragenter', function(event) {
			dragenter_counter++; // Incrementing drag counter
		})
		.on('dragleave', function() {
			dragenter_counter--; // Decrementing drag counter
			// If dragleave occured to storage window -> make "drag and drop" window invisible
			if (dragenter_counter <= 0) { 
			  	upload_block.addClass('unvisible');
			}
		})
		.on('drop', function(event) {
			upload_block.addClass('unvisible');
			dragenter_counter = 0; 
			loader_spinner.css('display', 'block'); // Enable animation spinner

			let files = event.originalEvent.dataTransfer.files; // Getting dropped files
			// Creating form data with files to upload
			let formData = processing.create_upload_form_data(current_path, user_email, files); 

			$.ajax({ // Sending created form data using POST method
		        type: "POST",
		        enctype: 'multipart/form-data',
		        url: "/files/upload",
		        data: formData, // Form data with info for uploading and files
		        processData: false, // Prevent jQuery from automatically transforming the data into a query string
		        contentType: false, // Prevent jQuery from setting Content-Type header
		        cache: false, // Prevent browser from caching response page
		        success: (data) => { // Files were successfully uploaded 
		        	// Update the folder to see new data
		            socket.emit('show_directory', { path: user_email + directory.update_directory(current_path, files_list) }); 
		            socket.emit('get_size', user_email);
		            loader_spinner.css('display', 'none'); // Stop animation spinner
		        }, 
		        error: (error) => { // Error occured on server
		           	alert('Error uploading files');
		           	loader_spinner.css('display', 'none'); // Stop animation spinner
		        }
			});
		});*/