// Constants
HEALTH_URL = "http://localhost:5002/health"		// Health url
NEWS_FEED_URL = "http://localhost:5002/feed"		// News feed url
EVENTS_FEED_URL = "http://localhost:5002/calendarfeed"		// Events feed url
FILE_URL = "http://localhost:5002/images"	// Images feed url
CONFIG_URL = "http://localhost:5002/config"	// Configuration feed url
MAX_WINDOW_WIDTH = window.innerWidth;		// Browser width
MAX_WINDOW_HEIGHT = window.innerHeight;		// Browser height
BOX_SPACING = 20;							// General element spacing
CONSOLE_UPDATE_DELAY = 2000					// Console refresh delay
DEBUG = true;

// Shared Console static class.
var Console = {};
Console.workspace = {};
// Trigger a data update. Listeners will be notified through the onData method.
Console.triggerUpdate = () => {
	try {
		refreshData();
	} catch (e) {
		console.log("Console.triggerUpdate: " + e);
	}
};
// Create a new UI widget with title and content panel.
Console.createWidget = (title, top, left, width, height) => {
	try {
		return createWidget(title, top, left, width, height);
	} catch (e) {
		console.log("Console.createWidget: " + e);
	}
	return;
};
// Create a new empty UI widget.
Console.createRawWidget = (top, left, width, height) => {
	try {
		return createRawWidget(top, left, width, height);
	} catch (e) {
		console.log("Console.createRawWidget: " + e);
	}
	return;
};
// Add a widget to the console workspace.
Console.addWidget = (widget) => {
	try {
		var foundwidget = widgets.filter(w => w.id === widget.id);
		if (foundwidget) {
			Console.workspace.appendChild(widget.rootPanel);
		} else {
			console.log("Widget with id '" + widget.id + "' not found. Only widgets created using Console.createWidget can be added to workspace.");
		}
	} catch(e) {
		console.log("Console.addWidget: " + e);
	}
};
// Remove a widget from the console workspace. Deleted widgets cannot be added through Console.addWidget.
Console.removeWidget = (widget) => {
	try {
		Console.workspace.removeChild(widget.rootPanel);
		widgets = widgets.filter(w => w.id !== widget.id);
	} catch(e) {
		console.log("Console.removeWidget: " + e);
	}
};
// Add a new data update listener. Every listener must declare an onData method.
Console.register = (listener) => {
	try {
		register(listener);
	} catch(e) {
		console.log("Console.register: " + e);
	}
};

var healthdata;
var listeners = [];		// Data listeners registered through the "register" method. They must declare an "onData" method to be called on new data events.
var widgets = [];		// Registered new UI widget through the "createWidget" method.

function initConsole() {
	Console.workspace = document.getElementsByClassName('consolepanelcontainer')[0];
	refreshData();
	setInterval(refreshData, CONSOLE_UPDATE_DELAY);
}

function register(listener) {
	if(listeners.includes(listener)) return;
	listeners.push(listener);
}

function invokeListeners() {
	if (listeners.length == 0) return;
	try {
		listeners.forEach(function(listener) {
			listener.onData(healthdata);
		});
	} catch(e) {
		console.log(e);
	}
}

function createRawWidget(top, left, width, height) {
	panelContainer = document.createElement('div');
	panelContainer.className = 'consolepanel';
	panelContainer.style.top = top;
	panelContainer.style.left = left;
	panelContainer.style.width = width;
	panelContainer.style.height = height;
	var Widget = {};
	Widget.id = Date.now();
	Widget.rootPanel = panelContainer;
	widgets.push(Widget);
	return Widget;
}

function createWidget(title, top, left, width, height) {
	panelContainer = document.createElement('div');
	panelContainer.className = 'consolepanel';
	panelContainer.style.top = top;
	panelContainer.style.left = left;
	panelContainer.style.width = width;
	panelContainer.style.height = height;
	panelTitle = document.createElement('div');
	panelTitle.className = 'paneltitle';
	panelTitle.innerHTML = title;
	panelContent = document.createElement('div');
	panelContent.className = 'panelcontent';
	panelContainer.appendChild(panelTitle);
	panelContainer.appendChild(panelContent);
	var Widget = {};
	Widget.id = Date.now();
	Widget.rootPanel = panelContainer;
	Widget.titlePanel = panelTitle;
	Widget.contentPanel = panelContent;
	widgets.push(Widget);
	return Widget;
}

function refreshData() {
	debugLog ("refreshData");
	var xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == XMLHttpRequest.DONE) {
			if (xmlhttp.status == 200) {
				Console.lastDataUpdate = new Date();
				healthdata = JSON.parse(xmlhttp.responseText);
				invokeListeners();
			} else if (xmlhttp.status == 400) {
				debugLog('There was an error 400');
			} else {
				debugLog('something else other than 200 was returned');
			}
		}
	};

    xmlhttp.open("GET", HEALTH_URL, true);
    xmlhttp.send();
}

window.onload = function(event) {
	initConsole();
}
