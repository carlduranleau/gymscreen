EVENTS_ROTATION_DEFAULT_INTERVAL = 15000;	// events rotation interval in ms
FEED_REFRESH_DEFAULT_INTERVAL = 35000			// News feed refresh interval in ms

eventsRefreshTimerId = 0;			// id of the setInterval timer to load and refresh events
eventsMoveTimerId = 0;				// id of the setInterval timer to move the next event

// events News management
eventsContainer = undefined	// Fixed box where events rotate
allEventsBoxes = [];		// All available events
visibleEventsBoxes = [];	// Currently visible events
nextVisibleEventsBoxes = [];// Next events to be visible
nextTopEvents = 0;			// Index of the next events to be displayed first

// Create UI events box and hide it
function createEventBox(title, message, container) {
	eventsBoxContainer = document.createElement("div");
	eventsBoxContainer.setAttribute("class", "eventsbox");
	eventsTitleContainer = document.createElement("p");
	eventsBoxContainer.appendChild(eventsTitleContainer);
	titleContainer = document.createElement("h3");
	titleContainer.innerHTML = title;
	eventsTitleContainer.appendChild(titleContainer);
	messageContainer = document.createElement("p");
	eventsBoxContainer.appendChild(messageContainer);
	messageContainer.innerHTML = message;
	eventsBoxContainer.style.top = parseInt(container.clientHeight) + BOX_SPACING;
	eventsBoxContainer.style.left = (BOX_SPACING - 10) + "px";
	container.appendChild(eventsBoxContainer);
	eventsBoxContainer.style.top = -(parseInt(eventsBoxContainer.clientHeight) + BOX_SPACING) + "px";
	return eventsBoxContainer;
}

// Create UI events box and hide it
function createEventsContainer() {
	eventsContainer = document.createElement("div");
	eventsContainer.setAttribute("class", "eventscontainer");
	eventsContainer.style.left = BOX_SPACING + "px";
	eventsContainer.style.top = BOX_SPACING + "px";
	document.body.appendChild(eventsContainer);
	return eventsContainer;
}

// Add a new event to the available events list
function addEvent (newEvent) {
	if (!eventsContainer) {
		createEventsContainer("");
	}
	var event = new Event(newEvent.event_id, createEventBox(formatDateTime(newEvent.start), formatContent(newEvent), eventsContainer));
	allEventsBoxes.push(event);
	if (nextVisibleEventsBoxes.length == 0) {
		nextVisibleEventsBoxes.push(0);
	}
}

function eventsAnimationInProgress() {
	for (var i = 0; i < allEventsBoxes.length; i++) {
		if(allEventsBoxes[i].animId != -1) {
			return true;
		}
	}
}

// Remove all events from available events list
function clearEvents () {
	for (var i = 0; i < allEventsBoxes.length; i++) {
		if (allEventsBoxes[i].animId != -1) {
			stopEventsAnim(allEventsBoxes[i]);
		}
		eventsContainer.removeChild(allEventsBoxes[i].box);
	}
	allEventsBoxes = [];
	nextVisibleEventsBoxes = [];
	visibleEventsBoxes = [];
}

// Update nextVisibleEventsBoxes 
function organizeEvents() {
	if (allEventsBoxes.length == 0) {
		nextVisibleEventsBoxes = [];
		return;
	}

	maxHeight = parseInt(eventsContainer.clientHeight);
	totalHeight = 0;
	nextVisibleEventsBoxes = [];
	lastIndex = allEventsBoxes.length - 1;
	var i = nextTopEvents;
	for (i = nextTopEvents; i < allEventsBoxes.length; i++) {
		totalHeight = totalHeight + parseInt(allEventsBoxes[i].box.clientHeight);
		if (totalHeight <= maxHeight) {
			if (nextVisibleEventsBoxes.includes(allEventsBoxes[i])) {
				break;
			}
			nextVisibleEventsBoxes.push(allEventsBoxes[i]);

			// Process the array as an endless circle
			if (i == lastIndex) {
				i = -1;
			}
		} else {
			break;
		}
	}
	nextTopEvents = i;

	// Prepare to return to the first event if we are at the end.
	if (nextTopEvents > lastIndex) {
		nextTopEvents = 0;
	}
}


// Move an event box 1 pixel toward its destination. Used with animation timer.
function animEventsBox(eventBox, xPosition, yPosition) {
	box = eventBox.box
	animId = eventBox.animId
	x = parseInt(box.style.left);
	y = parseInt(box.style.top);
	stepX = x < xPosition ? 1 : -1;
	stepY = y < yPosition ? 1 : -1;
	if ((animId != -1) && (x == xPosition) && (y == yPosition)) {
		stopEventsAnim(eventBox);
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

// Stop events box animation timer
function stopEventsAnim(eventBox) {
	stopAnimThread(eventBox.animId, "Stop animation for event #" + eventBox.id);
	eventBox.animId = -1;
}

// Update screen with new nextVisibleEventsBoxes
function rotateEvents() {

	if (eventsAnimationInProgress()) {
		waitForEventsAnimation(rotateEvents);
		return;
	}

	organizeEvents();

	// Hide current events if we have another to show
	if (visibleEventsBoxes.length > 0 || nextVisibleEventsBoxes.length > 0) {
		for (var i = 0; i < visibleEventsBoxes.length; i++) {
			if (!nextVisibleEventsBoxes.includes(visibleEventsBoxes[i])) {
				if (visibleEventsBoxes[i].animId != -1) {
					stopNewsAnim(visibleEventsBoxes[i]);
				}
				animId = startAnimThread(setInterval(animNewsBox, 5, visibleEventsBoxes[i], BOX_SPACING - 10, parseInt(eventsContainer.clientHeight) + BOX_SPACING), "Hide events New #" + visibleEventsBoxes[i].id);
				visibleEventsBoxes[i].animId = animId;
			}
		}
		currentHeight = 0;
		for (var i = 0; i < nextVisibleEventsBoxes.length; i++) {
			if (!visibleEventsBoxes.includes(nextVisibleEventsBoxes[i])) {
				nextVisibleEventsBoxes[i].box.style.left = (BOX_SPACING - 10) + "px";
				nextVisibleEventsBoxes[i].box.style.top = -(parseInt(nextVisibleEventsBoxes[i].box.clientHeight) + BOX_SPACING) + "px";
			}
			if (nextVisibleEventsBoxes[i].animId != -1) {
				stopNewsAnim(nextVisibleEventsBoxes[i]);
			}
			animId = startAnimThread(setInterval(animNewsBox, 5, nextVisibleEventsBoxes[i], BOX_SPACING - 10, currentHeight), "Show events New #" + nextVisibleEventsBoxes[i].id);
			nextVisibleEventsBoxes[i].animId = animId;
			currentHeight += parseInt(nextVisibleEventsBoxes[i].box.clientHeight);
		}
		visibleEventsBoxes = nextVisibleEventsBoxes;
	}
}

// Parse events data
function loadEventsData(jsonData) {

	var data = JSON.parse(jsonData);

	if (data.events && data.events.length > 0) {
		for (var j = 0; j < data.events.length; j++) {
			found = false;
			for (var i = 0; i < allEventsBoxes.length; i++) {
				if (allEventsBoxes[i].id == data.events[j].event_id) {
					titleElement = allEventsBoxes[i].box.getElementsByTagName("h3")[0];
					titleElement.innerHTML = formatDateTime(data.events[j].start);
					messageElement = allEventsBoxes[i].box.getElementsByTagName("p")[1];
					messageElement.innerHTML = formatContent(data.events[j]);
					found = true;
					break;
				}
			}
			if (!found) {
				addEvent(data.events[j]);
			}
		}

		eventsToRemove = [];
		for (var i = 0; i < allEventsBoxes.length; i++) {
			found = false;
			for (var j = 0; j < data.events.length; j++) {
				if (allEventsBoxes[i].id == data.events[j].event_id) {
					found = true;
				}
			}
			if (!found) {
				eventsToRemove.push(i);
			}			
		}
		for (var i = 0; i < eventsToRemove.length; i++) {
			eventsContainer.removeChild(allEventsBoxes[eventsToRemove[i]].box);
			allEventsBoxes.splice(eventsToRemove[i], 1);
		}
	}

	rotateEvents();

	if(eventsRefreshTimerId == 0) {
		eventsRefreshTimerId = startAnimThread(setInterval(getRemoteEventsFeedData, getConfig("eventsFeedUpdateDelay", FEED_REFRESH_DEFAULT_INTERVAL)), "Start Feed Refresh Timer");
		eventsMoveTimerId = startAnimThread(setInterval(rotateEvents, getConfig("eventsSwapDelay", EVENTS_ROTATION_DEFAULT_INTERVAL)), "Start events Events Move Timer");
	}
}

// Wait for an animation to finish
function waitForEventsAnimation(nextFunction) {
	if (eventsAnimationInProgress()) {
		setTimeout(waitForEventsAnimation, 1000, nextFunction);
	} else {
		nextFunction();
	}
}

// Load new data from Google Keep JSON feed
function getRemoteEventsFeedData() {

	if (eventsAnimationInProgress()) {
		waitForEventsAnimation(getRemoteEventsFeedData);
		return;
	}

	if(eventsRefreshTimerId != 0) {
		stopAnimThread(eventsRefreshTimerId, "Stop Feed Refresh Timer");
		stopAnimThread(eventsMoveTimerId, "Stop events Events Move Timer");
		eventsRefreshTimerId = 0;
		eventsMoveTimerId = 0;
	}

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
           if (xmlhttp.status == 200) {
               loadEventsData(xmlhttp.responseText);
           }
           else if (xmlhttp.status == 400) {
				debugLog('There was an error 400');
           }
           else {
               debugLog('something else other than 200 was returned');
           }
        }
    };

    xmlhttp.open("GET", EVENTS_FEED_URL, true);
    xmlhttp.send();
}

function formatDateTime(rawDate) {
	if (!rawDate) return "";
	var dateObj = new Date(Date.parse(rawDate + (rawDate.includes(":") ? "" : " 00:00:00").replace(" ", "T").replace("+00:00", "")))
	var datePart = dateObj.getDate() + " " + DATE_NAME[dateObj.getMonth()] + " " + dateObj.getFullYear();
	var timePart = rawDate.includes(":") ? (to2Chars(dateObj.getHours()) + ":" + to2Chars(dateObj.getMinutes())).replace("00:00", "") : "";

	return datePart + (timePart ? (" &agrave; " + timePart) : "")
}

function formatContent(event) {
	if (!event) return;
	var content = event.summary;
	if (event.description) {
		content = "<b>" + content + "</b><br><br>" + event.description.replace(/(?:\r\n|\r|\n)/g, "<br>");
	}
	if (event.location) {
		content = content + "<br><br><b>Lieu :</b> " + event.location;
	}
	
	return content;
}

function to2Chars(input) {
	return ("0" + input).slice(-2);
}

// Classes

function Event(pId, pBox) {
   this.id = pId;
   this.box = pBox;
   this.animId = -1;
}

// Starting loading events.
getRemoteEventsFeedData();