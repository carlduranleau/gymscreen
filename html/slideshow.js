imagesList = [];			// Image file list
sponsorImagesList = [];		// Sponsor image file list

imageRotationThread = null;	// Refresh thread
imageLoadingThread	= null;	// Loading thread
sponsorDisplayThread = null;// Sponsor display thread

IMAGES_ROTATION_DEFAULT_INTERVAL = 10000;	// Images rotation interval in ms
FEED_REFRESH_DEFAULT_INTERVAL = 30000;		// Images feed refresh interval in ms
SPONSOR_DISPLAY_INTERVAL = 60000;			// Sponsor display interval

imageContainers = [];		// Container to display images
visibleContainer = 0;		// Current visible container
nextVisibleContainer = 1;	// Next visible container
currentVisibleImage = null;	// Current visible image
nextVisibleImageIndex = 0;	// next visible image index
nextSponsorImageIndex = 0;	// Next sponsor image to display (from sponsorImagesList)

sponsorNeeded = false;		// Define if the next image must be a sponsor

// Wait for an animation to finish
function waitForImageAnimation(nextFunction, thread) {
	if (animationInProgress()) {
		if (!thread) {
			ThreadManager.createThread(waitForImageAnimation, [nextFunction], 1000).start();
		}
	} else {
		ThreadManager.unregister(thread);
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
	if (newImage.isSponsor()) {
		sponsorImagesList.push(newImage);
	} else {
		imagesList.push(newImage);
	}
}

// Switch to the next available image
function switchImage () {

	if (animationInProgress()) {
		waitForImageAnimation(switchImage,);
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
	
	const nextImg = sponsorNeeded ? sponsorImagesList[nextSponsorImageIndex] : imagesList[nextVisibleImageIndex];
	imageContainers[nextVisibleContainer].style.backgroundImage = "url(" + nextImg.filename + ")";
	
	const ctnr = imageContainers[nextVisibleContainer];
	const threadShow = ThreadManager.createThread(animImageBox, [nextImg, ctnr, 10]);
	nextImg.animId = threadShow.id;
	threadShow.start();

	if (currentVisibleImage && currentVisibleImage != nextImg) {
		const ctnr = imageContainers[visibleContainer];
		const threadHide = ThreadManager.createThread(animImageBox, [currentVisibleImage, ctnr, 0]);
		currentVisibleImage.animId = threadHide.id;
		threadHide.start();
	}

	currentVisibleImage = nextImg;
	if (sponsorNeeded) {
		nextSponsorImageIndex++;
		if (nextSponsorImageIndex > (sponsorImagesList.length - 1)) {
			nextSponsorImageIndex = 0;
		}
	} else {
		nextVisibleImageIndex++;
		if (nextVisibleImageIndex > (imagesList.length - 1)) {
			nextVisibleImageIndex = 0;
		}
	}
	
	sponsorNeeded = false;
	tmp = visibleContainer;
	visibleContainer = nextVisibleContainer;
	nextVisibleContainer = tmp;
}

// Stop image box animation timer
function stopImageAnim(image) {
	if (image && image.animId != -1) {
		ThreadManager.stopThread(image.animId);
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
		imagesList = [];
		sponsorImagesList = [];
		for (var j = 0; j < data.files.length; j++) {
			addImage(data.files[j]);
		}
	}

	if (nextSponsorImageIndex > (sponsorImagesList.length - 1)) {
		nextSponsorImageIndex = 0;
	}
	if (nextVisibleImageIndex > (imagesList.length - 1)) {
		nextVisibleImageIndex = 0;
	}

	if (imagesList.length > 0) {
		switchImage();
	}

	refreshThreadsConfiguration();
}

function refreshThreadsConfiguration() {
	const imagesFeedUpdateDelay = getConfig("imagesFeedUpdateDelay", FEED_REFRESH_DEFAULT_INTERVAL);
	const imageSwapDelay = getConfig("imageSwapDelay", IMAGES_ROTATION_DEFAULT_INTERVAL);
	const imageSponsorFrequency = getConfig("imageSponsorFrequency", SPONSOR_DISPLAY_INTERVAL);
	if (!imageLoadingThread || imageLoadingThread.interval != imagesFeedUpdateDelay) {
		if (imageLoadingThread) {
			ThreadManager.unregister(imageLoadingThread);
		}
		imageLoadingThread = ThreadManager.createThread(getImageList, [], imagesFeedUpdateDelay);
	}
	if (!imageRotationThread || imageRotationThread.interval != imageSwapDelay) {
		if (imageRotationThread) {
			ThreadManager.unregister(imageRotationThread);
		}
		imageRotationThread = ThreadManager.createThread(switchImage, [], imageSwapDelay);
	}
	if (!sponsorDisplayThread || sponsorDisplayThread.interval != imageSponsorFrequency) {
		if (sponsorDisplayThread) {
			ThreadManager.unregister(sponsorDisplayThread);
		}
		sponsorDisplayThread = ThreadManager.createThread(displaySponsor, [], imageSponsorFrequency);
		sponsorDisplayThread.start();
	}
	
	imageLoadingThread.start();
	imageRotationThread.start();
}

// Prepare to show a sponsor image
function displaySponsor() {
	sponsorNeeded = sponsorImagesList.length > 0;
}

// Load new data from Google Drive JSON feed
function getImageList() {

	if (animationInProgress()) {
		waitForImageAnimation(switchImage);
		return;
	}

	if(imageLoadingThread) {
		imageLoadingThread.stop();
		imageRotationThread.stop();
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
class Image {
	id;
	filename;
	animId;
	constructor(pId, pFilename) {
		this.id = pId;
		this.filename = pFilename;
		this.animId = -1;
	}
	
	isSponsor() {
		return this.id.toLowerCase().startsWith("sponsor");
	}
}

// Starting loading news.
getImageList();
