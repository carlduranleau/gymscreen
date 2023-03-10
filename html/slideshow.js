imagesList = [];			// Image file list

imageRotationTimerId = 0;	// Timer id for picture refresh
imageLoadingTimerId	= 0;	// Timer id for picture loading

IMAGES_ROTATION_DEFAULT_INTERVAL = 10000;	// Images rotation interval in ms
FEED_REFRESH_DEFAULT_INTERVAL = 30000;		// Images feed refresh interval in ms

imageContainers = [];		// Container to display images
visibleContainer = 0;		// Current visible container
nextVisibleContainer = 1;	// Next visible container
currentVisibleImage = -1;	// Current visible image
nextVisibleImage = 0;		// Current visible image

// Wait for an animation to finish
function waitForImageAnimation(nextFunction) {
	if (animationInProgress()) {
		setTimeout(waitForImageAnimation, 1000, nextFunction);
	} else {
		nextFunction();
	}
}

function animationInProgress() {
	for (var i = 0; i < imagesList.length; i++) {
		if(imagesList[i].animId != -1) {
			return true;
		}
	}
}

function createImageContainer () {
	imageContainer = document.createElement("div");
	imageContainer.setAttribute("class", "imagecontainer");
	imageContainer.style.left = BOX_SPACING + "px";
	document.body.appendChild(imageContainer);
	return imageContainer;
}

// Add a new image to the list
function addImage (image) {
	var newImage = new Image(image.name, image.url);
	imagesList.push(newImage);
}

// Switch to the next available image
function switchImage () {

	if (animationInProgress()) {
		waitForImageAnimation(switchImage);
		return;
	}

	// Nothing to do if no images are loaded
	if (imagesList.length == 0) {
		return;
	}

	// Create the 2 rotation image containers
	if (imageContainers.length == 0) {
		background = createImageContainer();
		background.style.opacity = "1";
		background.style.backgroundColor = "#FFFFFF";
		background.style.zIndex = 0;
		imageContainers.push(createImageContainer());
		imageContainers.push(createImageContainer());
	}

	imageContainers[visibleContainer].style.zIndex = 99;
	imageContainers[visibleContainer].style.opacity = "1.0";
	imageContainers[nextVisibleContainer].style.zIndex = 1;
	imageContainers[nextVisibleContainer].style.opacity = "0";
	imageContainers[nextVisibleContainer].style.backgroundImage = "url(" + imagesList[nextVisibleImage].filename + ")";

	animId = startAnimThread(setInterval(animImageBox, 100, imagesList[nextVisibleImage], imageContainers[nextVisibleContainer], 10), "Show picture " + imagesList[nextVisibleImage].id);
	imagesList[nextVisibleImage].animId = animId;

	if (currentVisibleImage != -1 && currentVisibleImage != nextVisibleImage) {
		animId = startAnimThread(setInterval(animImageBox, 100, imagesList[currentVisibleImage], imageContainers[visibleContainer], 0), "Hide picture " + imagesList[currentVisibleImage].id);
		imagesList[currentVisibleImage].animId = animId;
	}

	currentVisibleImage = nextVisibleImage;
	nextVisibleImage++;
	if (nextVisibleImage > (imagesList.length - 1)) {
		nextVisibleImage = 0;
	}

	tmp = visibleContainer;
	visibleContainer = nextVisibleContainer;
	nextVisibleContainer = tmp;
}

// Stop image box animation timer
function stopImageAnim(image) {
	if (image && image.animId != -1) {
		stopAnimThread(image.animId, "Stop animation for picture " + image.id);
		image.animId = -1;
	}
}

// Animate image opacity
function animImageBox(image, container, opacity) {
	var currentOpacity = 0;	// Ensure this variable is local to prevent concurrency issues.

	if (container.style.opacity == "1") {
		currentOpacity = 10;
	} else {
		currentOpacity = parseInt(container.style.opacity.replace(".", ""));
	}

	animId = image.animId;
	if ((animId != -1) && (opacity == currentOpacity)) {
		stopImageAnim(image);
		return;
	}

	if (opacity < currentOpacity) {
		currentOpacity--;
	} else {
		currentOpacity++;
	}

	if (currentOpacity == 10) {
		container.style.opacity = "1.0";
	} else {
		container.style.opacity = "0." + currentOpacity;
	}
}

// Parse file data
function loadFilesData(jsonData) {

	var data = JSON.parse(jsonData);

	if (data.files.length > 0) {
		for (var j = 0; j < data.files.length; j++) {
			found = false;
			for (var i = 0; i < imagesList.length; i++) {
				if (imagesList[i].id == data.files[j].name) {
					found = true;
					break;
				}
			}
			if (!found) {
				addImage(data.files[j]);
			}
		}

		newImagesList = [];
		for (var i = 0; i < imagesList.length; i++) {
			for (var j = 0; j < data.files.length; j++) {

				if (imagesList[i].id == data.files[j].name) {
					newImagesList.push(imagesList[i]);
					break;
				}
			}
		}
		imagesList = newImagesList;
		newImagesList = undefined;
	}

	switchImage();

	if(imageLoadingTimerId == 0) {
		imageLoadingTimerId = startAnimThread(setInterval(getImageList, getConfig("imagesFeedUpdateDelay", FEED_REFRESH_DEFAULT_INTERVAL)), "Start Image Feed Timer");
		imageRotationTimerId = startAnimThread(setInterval(switchImage, getConfig("imageSwapDelay", IMAGES_ROTATION_DEFAULT_INTERVAL)), "Start Image Switch Timer");
	}
}

// Load new data from Google Drive JSON feed
function getImageList() {

	if (animationInProgress()) {
		waitForImageAnimation(switchImage);
		return;
	}

	if(imageLoadingTimerId != 0) {
		stopAnimThread(imageLoadingTimerId, "Stop Image Feed Timer");
		stopAnimThread(imageRotationTimerId, "Stop Image Switch Timer");
		imageLoadingTimerId = 0;
		imageRotationTimerId = 0;
	}

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
           if (xmlhttp.status == 200) {
               loadFilesData(xmlhttp.responseText);
           }
           else if (xmlhttp.status == 400) {
               debugLog('There was an error 400');
           }
           else {
               debugLog('something else other than 200 was returned');
           }
        }
    };

    xmlhttp.open("GET", FILE_URL, true);
    xmlhttp.send();
}

// Classes

function Image(pId, pFilename) {
   this.id = pId;
   this.filename = pFilename;
   this.animId = -1;
}

// Starting loading news.
getImageList();