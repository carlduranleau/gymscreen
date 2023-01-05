HIDE_MARGIN = MAX_WINDOW_WIDTH + BOX_SPACING;	// Left security margin to hide news boxes
NEWS_ROTATION_DEFAULT_INTERVAL = 20000			// News rotation interval in ms
GLOBAL_NEWS_ROTATION_DEFAULT_INTERVAL = 15000;	// Global new rotation interval in ms
FEED_REFRESH_DEFAULT_INTERVAL = 35000			// News feed refresh interval in ms

newsRefreshTimerId = 0;		// id of the setInterval timer to load and refresh news
newsMoveTimerId = 0;		// id of the setInterval timer to move the next news
globalNewsMoveTimerId = 0;	// id of the setInterval timer to move the next global news

// News management
allNewsBoxes = [];			// All available news
visibleNewsBoxes = [];		// All currently visible news
nextVisibleNewsBoxes = [];	// List of news to be displayed on next refresh
nextTopNews = 0;			// Index of the next news to be displayed first

// Global News management
globalNewsContainer = undefined	// Fixed box where global news rotate
allGlobalNewsBoxes = [];		// All available global news
visibleGlobalNewsBoxes = [];	// Currently visible global news
nextVisibleGlobalNewsBoxes = [];// Next global news to be visible
nextTopGlobalNews = 0;			// Index of the next global news to be displayed first
visibleNewsTotalHeight = 0;		// Total height of all visible news box

// Create UI news box and hide it
function createNewsBox(title, message, color) {
	newsBox = document.createElement("div");
	newsBox.setAttribute("class", "newsbox");
	boxContainer = document.createElement("p");
	newsBox.appendChild(boxContainer);
	titleContainer = document.createElement("h3");
	titleContainer.innerHTML = title;
	boxContainer.appendChild(titleContainer);
	messageContainer = document.createElement("p");
	boxContainer.appendChild(messageContainer);
	messageContainer.innerHTML = message;
	newsBox.style.backgroundColor = color;
	newsBox.style.top = "0px";
	newsBox.style.left = HIDE_MARGIN + "px";
	document.body.appendChild(newsBox);
	newsBox.style.top = -(parseInt(newsBox.clientHeight) + BOX_SPACING) + "px";
	newsBox.style.left = MAX_WINDOW_WIDTH - BOX_SPACING - parseInt(newsBox.clientWidth) + "px";
	return newsBox;
}

// Create UI global news box and hide it
function createGlobalNewsBox(title, message, color, container) {
	globalNewsBoxContainer = document.createElement("div");
	globalNewsBoxContainer.setAttribute("class", "globalnewsbox");
	globalNewsTitleContainer = document.createElement("p");
	globalNewsBoxContainer.appendChild(globalNewsTitleContainer);
	titleContainer = document.createElement("h3");
	titleContainer.innerHTML = title;
	globalNewsTitleContainer.appendChild(titleContainer);
	messageContainer = document.createElement("p");
	globalNewsBoxContainer.appendChild(messageContainer);
	messageContainer.innerHTML = message;
	globalNewsBoxContainer.style.top = parseInt(container.clientHeight) + BOX_SPACING;
	globalNewsBoxContainer.style.left = (BOX_SPACING - 10) + "px";
	container.appendChild(globalNewsBoxContainer);
	globalNewsBoxContainer.style.top = -(parseInt(globalNewsBoxContainer.clientHeight) + BOX_SPACING) + "px";
	return globalNewsBoxContainer;
}

// Create UI news box and hide it
function createGlobalNewsContainer(color) {
	globalNewsContainer = document.createElement("div");
	globalNewsContainer.setAttribute("class", "globalnewscontainer");
	if (allNewsBoxes.length > 0) {
		globalNewsContainer.style.width = (parseInt(allNewsBoxes[0].box.style.left) - (BOX_SPACING * 3)) + "px";
	} else {
		globalNewsContainer.style.width = (MAX_WINDOW_WIDTH - (BOX_SPACING * 2)) + "px";
	}
	globalNewsContainer.style.left = BOX_SPACING + "px";
	globalNewsContainer.style.top = BOX_SPACING + "px";
	document.body.appendChild(globalNewsContainer);
	return globalNewsContainer;
}

// Add a new news to the available news list
function addNews (news) {
	var news = new News(news.id, createNewsBox(news.title, news.content, news.color));
	allNewsBoxes.push(news);
}

// Add a new news to the available news list
function addGlobalNews (news) {
	if (globalNewsContainer == undefined) {
		createGlobalNewsContainer("");
	}
	var news = new News(news.id, createGlobalNewsBox(news.title, news.content, news.color, globalNewsContainer));
	allGlobalNewsBoxes.push(news);
	if (nextVisibleGlobalNewsBoxes.length == 0) {
		nextVisibleGlobalNewsBoxes.push(0);
	}
}

function newsAnimationInProgress() {
	for (var i = 0; i < allNewsBoxes.length; i++) {
		if(allNewsBoxes[i].animId != -1) {
			return true;
		}
	}
	for (var i = 0; i < allGlobalNewsBoxes.length; i++) {
		if(allGlobalNewsBoxes[i].animId != -1) {
			return true;
		}
	}
}

// Remove all news from available news list
function clearNews () {
	for (var i = 0; i < allNewsBoxes.length; i++) {
		if (allNewsBoxes[i].animId != -1) {
			stopNewsAnim(allNewsBoxes[i]);
		}
		document.body.removeChild(allNewsBoxes[i].box);
	}
	allNewsBoxes = [];
	nextVisibleNewsBoxes = [];
}

// Remove all global news from available news list
function clearGlobalNews () {
	for (var i = 0; i < allGlobalNewsBoxes.length; i++) {
		if (allGlobalNewsBoxes[i].animId != -1) {
			stopNewsAnim(allGlobalNewsBoxes[i]);
		}
		globalNewsContainer.removeChild(allGlobalNewsBoxes[i].box);
	}
	allGlobalNewsBoxes = [];
	nextVisibleGlobalNewsBoxes = [];
	visibleGlobalNewsBoxes = [];
}

// Update nextVisibleNewsBoxes 
function organizeNews() {

	if (allNewsBoxes.length == 0) {
		nextVisibleNewsBoxes = [];
		return;
	}

	totalHeight = 0;
	margin = BOX_SPACING;
	nextVisibleNewsBoxes = [];
	lastIndex = allNewsBoxes.length - 1;
	var i = nextTopNews;
	for (i = nextTopNews; i < allNewsBoxes.length; i++) {
		visibleNewsTotalHeight = totalHeight;
		totalHeight = totalHeight + margin + parseInt(allNewsBoxes[i].box.clientHeight);
		if (totalHeight <= MAX_WINDOW_HEIGHT) {
			if (nextVisibleNewsBoxes.includes(allNewsBoxes[i])) {
				break;
			}
			nextVisibleNewsBoxes.push(allNewsBoxes[i]);
			// Process the array as an endless circle
			if (i == lastIndex) {
				i = -1;
			}
		} else {
			break;
		}
	}
	nextTopNews = i;

	// Prepare to return to the first news if we are at the end.
	if (nextTopNews > lastIndex) {
		nextTopNews = 0;
	}
}

// Update nextVisibleGlobalNewsBoxes 
function organizeGlobalNews() {
	if (allGlobalNewsBoxes.length == 0) {
		nextVisibleGlobalNewsBoxes = [];
		return;
	}

	maxHeight = parseInt(globalNewsContainer.clientHeight);
	totalHeight = 0;
	nextVisibleGlobalNewsBoxes = [];
	lastIndex = allGlobalNewsBoxes.length - 1;
	var i = nextTopGlobalNews;
	for (i = nextTopGlobalNews; i < allGlobalNewsBoxes.length; i++) {
		totalHeight = totalHeight + parseInt(allGlobalNewsBoxes[i].box.clientHeight);
		if (totalHeight <= maxHeight) {
			if (nextVisibleGlobalNewsBoxes.includes(allGlobalNewsBoxes[i])) {
				break;
			}
			nextVisibleGlobalNewsBoxes.push(allGlobalNewsBoxes[i]);

			// Process the array as an endless circle
			if (i == lastIndex) {
				i = -1;
			}
		} else {
			break;
		}
	}
	nextTopGlobalNews = i;

	// Prepare to return to the first news if we are at the end.
	if (nextTopGlobalNews > lastIndex) {
		nextTopGlobalNews = 0;
	}
}


// Move a news box 1 pixel toward its destination. Used with animation timer.
function animNewsBox(newsBox, xPosition, yPosition) {
	box = newsBox.box
	animId = newsBox.animId
	x = parseInt(box.style.left);
	y = parseInt(box.style.top);
	stepX = x < xPosition ? 1 : -1;
	stepY = y < yPosition ? 1 : -1;
	if ((animId != -1) && (x == xPosition) && (y == yPosition)) {
		stopNewsAnim(newsBox);
		return;
	}
	if (x != xPosition) {
		x += stepX;
	}
	if (y != yPosition) {
		y += stepY;
	}
	box.style.left = x + "px";
	box.style.top = y + "px";
}

// Stop news box animation timer
function stopNewsAnim(newsBox) {
	stopAnimThread(newsBox.animId, "Stop animation for news #" + newsBox.id);
	newsBox.animId = -1;
}

// Push visible news boxes to back and hidden boxes to front.
function setZIndex() {
	for (var i = 0; i < visibleNewsBoxes.length; i++) {
		visibleNewsBoxes[i].box.style.zIndex = 0;
	}
	for (var i = 0; i < nextVisibleNewsBoxes.length; i++) {
		nextVisibleNewsBoxes[i].box.style.zIndex = 99;
	}
}

// Update screen with new nextVisibleGlobalNewsBoxes
function rotateGlobalNews() {

	if (newsAnimationInProgress()) {
		waitForNewsAnimation(rotateGlobalNews);
		return;
	}

	organizeGlobalNews();

	// Hide current global news if we have another to show
	if (visibleGlobalNewsBoxes.length > 0 || nextVisibleGlobalNewsBoxes.length > 0) {
		for (var i = 0; i < visibleGlobalNewsBoxes.length; i++) {
			if (!nextVisibleGlobalNewsBoxes.includes(visibleGlobalNewsBoxes[i])) {
				if (visibleGlobalNewsBoxes[i].animId != -1) {
					stopNewsAnim(visibleGlobalNewsBoxes[i]);
				}
				animId = startAnimThread(setInterval(animNewsBox, 5, visibleGlobalNewsBoxes[i], BOX_SPACING - 10, parseInt(globalNewsContainer.clientHeight) + BOX_SPACING), "Hide Global New #" + visibleGlobalNewsBoxes[i].id);
				visibleGlobalNewsBoxes[i].animId = animId;
			}
		}
		currentHeight = 0;
		for (var i = 0; i < nextVisibleGlobalNewsBoxes.length; i++) {
			if (!visibleGlobalNewsBoxes.includes(nextVisibleGlobalNewsBoxes[i])) {
				nextVisibleGlobalNewsBoxes[i].box.style.left = (BOX_SPACING - 10) + "px";
				nextVisibleGlobalNewsBoxes[i].box.style.top = -(parseInt(nextVisibleGlobalNewsBoxes[i].box.clientHeight) + BOX_SPACING) + "px";
			}
			if (nextVisibleGlobalNewsBoxes[i].animId != -1) {
				stopNewsAnim(nextVisibleGlobalNewsBoxes[i]);
			}
			animId = startAnimThread(setInterval(animNewsBox, 5, nextVisibleGlobalNewsBoxes[i], BOX_SPACING - 10, currentHeight), "Show Global New #" + nextVisibleGlobalNewsBoxes[i].id);
			nextVisibleGlobalNewsBoxes[i].animId = animId;
			currentHeight += parseInt(nextVisibleGlobalNewsBoxes[i].box.clientHeight);
		}
		visibleGlobalNewsBoxes = nextVisibleGlobalNewsBoxes;
	}
}

// Update screen with new nextVisibleNewsBoxes
function placeNewsBoxes() {

	if (newsAnimationInProgress()) {
		waitForNewsAnimation(rotateGlobalNews);
		return;
	}

	// Compute next visible news box
	organizeNews();
	setZIndex();

	// Hide currently visible boxes that should be removed
	for (var i = 0; i < visibleNewsBoxes.length; i++) {
		if (!nextVisibleNewsBoxes.includes(visibleNewsBoxes[i])) {
			if (visibleNewsBoxes[i].animId != -1) {
				stopNewsAnim(visibleNewsBoxes[i]);
			}
			//animId = startAnimThread(setInterval(animNewsBox, 5, visibleNewsBoxes[i], MAX_WINDOW_WIDTH - BOX_SPACING - parseInt(visibleNewsBoxes[i].box.clientWidth), -(BOX_SPACING + parseInt(visibleNewsBoxes[i].box.clientHeight))), "Hide News box #" + visibleNewsBoxes[i].id);
			animId = startAnimThread(setInterval(animNewsBox, 5, visibleNewsBoxes[i], MAX_WINDOW_WIDTH - BOX_SPACING - parseInt(visibleNewsBoxes[i].box.clientWidth), MAX_WINDOW_WIDTH + BOX_SPACING), "Hide News box #" + visibleNewsBoxes[i].id);
			visibleNewsBoxes[i].animId = animId
		}
	}

	yPosition = BOX_SPACING;
	margin = BOX_SPACING;
	maxSize = MAX_WINDOW_HEIGHT - BOX_SPACING;
	dynamicMargin = Math.floor((maxSize - visibleNewsTotalHeight) / (nextVisibleNewsBoxes.length - 1));
	for (var i = 0; i < nextVisibleNewsBoxes.length; i++) {
		if (!visibleNewsBoxes.includes(nextVisibleNewsBoxes[i])) {
			nextVisibleNewsBoxes[i].box.style.left = MAX_WINDOW_WIDTH - BOX_SPACING - parseInt(newsBox.clientWidth) + "px";
			nextVisibleNewsBoxes[i].box.style.top = -(parseInt(newsBox.clientHeight) + BOX_SPACING) + "px";
		}
		if (nextVisibleNewsBoxes[i].animId != -1) {
			stopNewsAnim(nextVisibleNewsBoxes[i]);
		}
		animId = startAnimThread(setInterval(animNewsBox, 5, nextVisibleNewsBoxes[i], MAX_WINDOW_WIDTH - BOX_SPACING - parseInt(nextVisibleNewsBoxes[i].box.clientWidth), yPosition), "Show News box #" + nextVisibleNewsBoxes[i].id);
		nextVisibleNewsBoxes[i].animId = animId;

		yPosition = (yPosition + dynamicMargin + margin + parseInt(nextVisibleNewsBoxes[i].box.clientHeight));
	}
	visibleNewsBoxes = nextVisibleNewsBoxes;
}

// Parse news data
function loadNewsData(jsonData) {

	var data = JSON.parse(jsonData);

	if (data.news.length > 0) {
		for (var j = 0; j < data.news.length; j++) {
			found = false;
			for (var i = 0; i < allNewsBoxes.length; i++) {
				if (allNewsBoxes[i].id == data.news[j].id) {
					titleElement = allNewsBoxes[i].box.getElementsByTagName("h3")[0];
					titleElement.innerHTML = data.news[j].title;
					messageElement = allNewsBoxes[i].box.getElementsByTagName("p")[1];
					messageElement.innerHTML = data.news[j].content;
					allNewsBoxes[i].box.style.backgroundColor = data.news[j].color;
					found = true;
					break;
				}
			}
			if (!found) {
				addNews(data.news[j]);
			}
		}

		newsToRemove = [];
		for (var i = 0; i < allNewsBoxes.length; i++) {
			found = false;
			for (var j = 0; j < data.news.length; j++) {
				if (allNewsBoxes[i].id == data.news[j].id) {
					found = true;
				}
			}
			if (!found) {
				newsToRemove.push(i);
			}			
		}
		for (var i = 0; i < newsToRemove.length; i++) {
			document.body.removeChild(allNewsBoxes[newsToRemove[i]].box);
			allNewsBoxes.splice(newsToRemove[i], 1);
		}
	}

	if (data.global_news.length > 0) {
		for (var j = 0; j < data.global_news.length; j++) {
			found = false;
			for (var i = 0; i < allGlobalNewsBoxes.length; i++) {
				if (allGlobalNewsBoxes[i].id == data.global_news[j].id) {
					titleElement = allGlobalNewsBoxes[i].box.getElementsByTagName("h3")[0];
					titleElement.innerHTML = data.global_news[j].title;
					messageElement = allGlobalNewsBoxes[i].box.getElementsByTagName("p")[1];
					messageElement.innerHTML = data.global_news[j].content;
					found = true;
					break;
				}
			}
			if (!found) {
				addGlobalNews(data.global_news[j]);
			}
		}

		newsToRemove = [];
		for (var i = 0; i < allGlobalNewsBoxes.length; i++) {
			found = false;
			for (var j = 0; j < data.global_news.length; j++) {
				if (allGlobalNewsBoxes[i].id == data.global_news[j].id) {
					found = true;
				}
			}
			if (!found) {
				newsToRemove.push(i);
			}			
		}
		for (var i = 0; i < newsToRemove.length; i++) {
			globalNewsContainer.removeChild(allGlobalNewsBoxes[newsToRemove[i]].box);
			allGlobalNewsBoxes.splice(newsToRemove[i], 1);
		}
	}

	placeNewsBoxes();
	rotateGlobalNews();

	if(newsRefreshTimerId == 0) {
		newsRefreshTimerId = startAnimThread(setInterval(getRemoteNewFeedData, getConfig("newsFeedUpdateDelay", FEED_REFRESH_DEFAULT_INTERVAL)), "Start Feed Refresh Timer");
		newsMoveTimerId = startAnimThread(setInterval(placeNewsBoxes, getConfig("newsSwapDelay", NEWS_ROTATION_DEFAULT_INTERVAL)), "Start News Move Timer");
		globalNewsMoveTimerId = startAnimThread(setInterval(rotateGlobalNews, getConfig("globalNewsSwapDelay", GLOBAL_NEWS_ROTATION_DEFAULT_INTERVAL)), "Start Global News Move Timer");
	}
}

// Wait for an animation to finish
function waitForNewsAnimation(nextFunction) {
	if (newsAnimationInProgress()) {
		setTimeout(waitForNewsAnimation, 1000, nextFunction);
	} else {
		nextFunction();
	}
}

// Load new data from Google Keep JSON feed
function getRemoteNewFeedData() {

	if (newsAnimationInProgress()) {
		waitForNewsAnimation(getRemoteNewFeedData);
		return;
	}

	if(newsRefreshTimerId != 0) {
		stopAnimThread(newsRefreshTimerId, "Stop Feed Refresh Timer");
		stopAnimThread(newsMoveTimerId, "Stop News Move Timer");
		stopAnimThread(globalNewsMoveTimerId, "Stop Global News Move Timer");
		newsRefreshTimerId = 0;
		newsMoveTimerId = 0;
		globalNewsMoveTimerId = 0;
	}

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
           if (xmlhttp.status == 200) {
               loadNewsData(xmlhttp.responseText);
           }
           else if (xmlhttp.status == 400) {
				debugLog('There was an error 400');
           }
           else {
               debugLog('something else other than 200 was returned');
           }
        }
    };

    xmlhttp.open("GET", FEED_URL, true);
    xmlhttp.send();
}


// Classes

function News(pId, pBox) {
   this.id = pId;
   this.box = pBox;
   this.animId = -1;
}

// Starting loading news.
getRemoteNewFeedData();