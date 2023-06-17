HIDE_MARGIN = MAX_WINDOW_WIDTH + BOX_SPACING;	// Left security margin to hide news boxes
NEWS_ROTATION_DEFAULT_INTERVAL = 20000			// News rotation interval in ms
FEED_REFRESH_DEFAULT_INTERVAL = 35000			// News feed refresh interval in ms

newsRefreshThread = null;		// Refresh thread
newsMoveThread = null;			// Move thread

// News management
allNewsBoxes = [];			// All available news
visibleNewsBoxes = [];		// All currently visible news
nextVisibleNewsBoxes = [];	// List of news to be displayed on next refresh
nextTopNews = 0;			// Index of the next news to be displayed first
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

// Add a new news to the available news list
function addNews (newNews) {
	var news = new News(newNews.id, createNewsBox(newNews.title, newNews.content, newNews.color));
	allNewsBoxes.push(news);
}

function newsAnimationInProgress() {
	for (var i = 0; i < allNewsBoxes.length; i++) {
		if(allNewsBoxes[i].animId != -1) {
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

// Move a news box 1 pixel toward its destination. Used with animation timer.
function animNewsBox(newsBox, xPosition, yPosition) {
	box = newsBox.box
	animId = newsBox.animId
	x = parseInt(box.style.left);
	y = parseInt(box.style.top);
	stepX = x < xPosition ? 10 : -10;
	stepY = y < yPosition ? 10 : -10;
	if ((animId != -1) && (x == xPosition) && (y == yPosition)) {
		stopNewsAnim(newsBox);
		return;
	}
	if (x != xPosition) {
		if ((stepX > 0 && x < xPosition && x + stepX > xPosition) ||
		(stepX < 0 && x > xPosition && x + stepX < xPosition)) {
			x = xPosition;
		} else {
			x += stepX;
		}
	}
	if (y != yPosition) {
		if ((stepY > 0 && y < yPosition && y + stepY > yPosition) ||
		(stepY < 0 && y > yPosition && y + stepY < yPosition)) {
			y = yPosition;
		} else {
			y += stepY;
		}
	}
	box.style.left = x + "px";
	box.style.top = y + "px";
}

// Stop news box animation timer
function stopNewsAnim(newsBox) {
	ThreadManager.stopThread(newsBox.animId);
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

// Update screen with new nextVisibleNewsBoxes
function placeNewsBoxes() {
	if (newsAnimationInProgress()) {
		waitForNewsAnimation(placeNewsBoxes);
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
			const newX = MAX_WINDOW_WIDTH - BOX_SPACING - parseInt(visibleNewsBoxes[i].box.clientWidth);
			const newY = MAX_WINDOW_WIDTH + BOX_SPACING;
			const o = visibleNewsBoxes[i];
			const thread = ThreadManager.createThread(animNewsBox, [o, newX, newY]);
			visibleNewsBoxes[i].animId = thread.id;
			thread.start();
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
		//animId = startAnimThread(setInterval(animNewsBox, 5, nextVisibleNewsBoxes[i], MAX_WINDOW_WIDTH - BOX_SPACING - parseInt(nextVisibleNewsBoxes[i].box.clientWidth), yPosition), "Show News box #" + nextVisibleNewsBoxes[i].id);
		const newX = MAX_WINDOW_WIDTH - BOX_SPACING - parseInt(nextVisibleNewsBoxes[i].box.clientWidth);
		const newY = yPosition;
		const o = nextVisibleNewsBoxes[i];
		const thread = ThreadManager.createThread(animNewsBox, [o, newX, newY]);
		nextVisibleNewsBoxes[i].animId = thread.id;
		yPosition = (yPosition + dynamicMargin + margin + parseInt(nextVisibleNewsBoxes[i].box.clientHeight));
		thread.start();
	}
	visibleNewsBoxes = nextVisibleNewsBoxes;
}

// Parse news data
function loadNewsData(jsonData) {
	var data = JSON.parse(jsonData);

	if (data.news && data.news.length > 0) {
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

	placeNewsBoxes();

	if(newsRefreshThread) {
		ThreadManager.unregister(newsRefreshThread);
		ThreadManager.unregister(newsMoveThread);
	}
	newsRefreshThread = ThreadManager.createThread(getRemoteNewFeedData, [], getConfig("newsFeedUpdateDelay", FEED_REFRESH_DEFAULT_INTERVAL));
	newsMoveThread = ThreadManager.createThread(placeNewsBoxes, [], getConfig("newsSwapDelay", NEWS_ROTATION_DEFAULT_INTERVAL));
	newsRefreshThread.start();
	newsMoveThread.start();
}

// Wait for an animation to finish
function waitForNewsAnimation(nextFunction, thread) {
	if (newsAnimationInProgress()) {
		if (!thread) {
			Thread.createThread(waitForNewsAnimation, [nextFunction], 1000).start();
		}
	} else {
		ThreadManager.unregister(thread);
		nextFunction();
	}
}

// Load new data from Google Keep JSON feed
function getRemoteNewFeedData() {
	if (newsAnimationInProgress()) {
		waitForNewsAnimation(getRemoteNewFeedData);
		return;
	}

	if(newsRefreshThread) {
		newsRefreshThread.stop();
		newsMoveThread.stop();
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

    xmlhttp.open("GET", NEWS_FEED_URL, true);
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
