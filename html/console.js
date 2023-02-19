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

var panels;
var healthdata;

function initConsole() {
	refreshData();
	panels = createConsoleContainer();
}

function createConsoleContainer() {
	consoleContainer = document.createElement('div');
	consoleContainer.className = 'consolecontainer';
	consoleTitle = document.createElement('div');
	consoleTitle.className = 'consoletitle';
	consoleTitle.innerHTML = 'Gymnamic console'
	panelsContainer = document.createElement('div');
	panelsContainer.className = 'consolepanelcontainer';
	consoleContainer.appendChild(consoleTitle);
	consoleContainer.appendChild(panelsContainer);
	document.body.appendChild(consoleContainer);
	return panelsContainer;
}

function createPanel(title) {
	panelContainer = document.createElement('div');
	panelContainer.className = 'consolepanel';
	panelContainer.style.top = '0px';
	panelContainer.style.left = '0px';
	panelContainer.style.width = '50%';
	panelContainer.style.height = '50%';
	panelTitle = document.createElement('div');
	panelTitle.className = 'paneltitle';
	panelTitle.innerHTML = title;
	panelContent = document.createElement('div');
	panelContent.className = 'panelcontent';
	panelContainer.appendChild(panelTitle);
	panelContainer.appendChild(panelContent);
	panels.appendChild(panelContainer);
	return panelContent;
}

function createUpdaterPanel(title) {
	var panel = createPanel(title);
	var updaterData;
	var content = '<i>No data available</i>';
	if (healthdata) {
		var processes = healthdata.updaterthread.processes;
		var count = processes.length;
		for (var i = 0; i < count; i++) {
			console.log(processes[i].name);
			if (processes[i].name == title) {
				updaterData = processes[i];
				break;
			}
		}
	}
	if (updaterData) {
		var content = '<ul>';
		for (var f in updaterData) {
			if (f == 'customdata') {
				content = content + '<li>' + f + ': </li>';
				var customData = updaterData[f];
				content = content + '<ul>';
				for (var c in customData) {
					content = content + '<li>' + c + ': ' + customData[c] + '</li>';
				}
				content = content + '</ul>';
			} else {
				content = content + '<li>' + f + ': ' + updaterData[f] + '</li>';
			}
		}
		content = content + '</ul>';
	}
	panel.innerHTML = content;
}

function clearThreads() {
	if (animationThreads.size > 0) {
		debugLog("Clearing threads:");
		for (let [key, name] of animationThreads) {
			stopAnimThread(key, name);
		}
	}
}

function startAnimThread(animId, name) {
	if (maintenanceMode) {
		debugLog ("Thread creation disabled in maintenance mode");
		stopAnimThread(animId, name);
	}
	debugLog("Adding thread #" + animId + ": " + name);
	animationThreads.set(animId, name);
	debugLog("Current thread count:" + animationThreads.size);
	displayThreads();
	return animId;
}

function stopAnimThread(animId, name) {
	debugLog("Stopping thread #" + animId + ": " + name);
	if (animationThreads.has(animId)) {
		animationThreads.delete(animId)
	}
	clearInterval(animId);
	debugLog("Remaining thread count:" + animationThreads.size);
	displayThreads();
}

function displayThreads() {
	if (animationThreads.size > 0) {
		debugLog("Active threads:");
		for (let [key, name] of animationThreads) {
			debugLog("Thread #" + key + ": " + name);
		}
	} else {
		debugLog("No active threads");
	}
}

function isConfigurationExpired() {
	if (configurationMap.get("expiration") == undefined) {
		return true;
	}
	return (!configurationMap.has("expiration")) || (configurationMap.get("expiration") < (new Date()).getTime());
}

function refreshData() {
	debugLog ("refreshData");
	var xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == XMLHttpRequest.DONE) {
			if (xmlhttp.status == 200) {
				healthdata = JSON.parse(xmlhttp.responseText);
				updatePanels();
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

function updatePanels() {
	createUpdaterPanel('CalendarUpdater');
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function debugLog(msg) {
	if (DEBUG) {
		console.log(msg)
	}
}

// Event handling
/*
window.onresize = function (event) {
	MAX_WINDOW_WIDTH = window.innerWidth;
	MAX_WINDOW_HEIGHT = window.innerHeight;
	HIDE_MARGIN = MAX_WINDOW_WIDTH + BOX_SPACING;
}
*/
window.onload = function(event) {
	initConsole();
}
