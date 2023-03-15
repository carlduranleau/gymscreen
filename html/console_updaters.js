// Constants
var UpdatersViewer = {};
UpdatersViewer.onData = (data) => {
	console.log(data);
}

var widget;

function initWidget() {
	Console.register(UpdatersViewer);
	widget = Console.createWidget("Updaters", "0px", "0px", "50%", "50%");
	initTabs();
	panels = document.getElementsByClassName('consolepanelcontainer')[0];
	refreshData();
}

function initTabs() {
	
	// MUST CREATE TABS HERE (Check console.html for HTML code to convert to JS)
	
	
	const tabCalendar = widget.contentPanel.querySelector(".tab-calendar");
	const tabConfig = widget.contentPanel.querySelector(".tab-config");
	const tabImages = widget.contentPanel.querySelector(".tab-images");
	const tabNews = widget.contentPanel.querySelector(".tab-news");

	const contentCalendar = widget.contentPanel.querySelector(".content-calendar");
	const contentConfig = widget.contentPanel.querySelector(".content-config");
	const contentImages = widget.contentPanel.querySelector(".content-images");
	const contentNews = widget.contentPanel.querySelector(".content-news");

	tabCalendar.classList.add("tabone");
	contentCalendar.style.display = "flex";
	contentConfig.style.display = "none";
	contentImages.style.display = "none";
	contentNews.style.display = "none";
	
	tabCalendar.addEventListener("click", () => {
		tabCalendar.classList.add("tabone");
		contentCalendar.style.display = "flex";
		tabConfig.classList.remove("tabone");
		contentConfig.style.display = "none";
		tabImages.classList.remove("tabone");
		contentImages.style.display = "none";
		tabNews.classList.remove("tabone");
		contentNews.style.display = "none";
	});
	
	tabConfig.addEventListener("click", () => {
		tabCalendar.classList.remove("tabone");
		contentCalendar.style.display = "none";
		tabConfig.classList.add("tabone");
		contentConfig.style.display = "flex";
		tabImages.classList.remove("tabone");
		contentImages.style.display = "none";
		tabNews.classList.remove("tabone");
		contentNews.style.display = "none";
	});
	
	tabImages.addEventListener("click", () => {
		tabCalendar.classList.remove("tabone");
		contentCalendar.style.display = "none";
		tabConfig.classList.remove("tabone");
		contentConfig.style.display = "none";
		tabImages.classList.add("tabone");
		contentImages.style.display = "flex";
		tabNews.classList.remove("tabone");
		contentNews.style.display = "none";
	});

	tabNews.addEventListener("click", () => {
		tabCalendar.classList.remove("tabone");
		contentCalendar.style.display = "none";
		tabConfig.classList.remove("tabone");
		contentConfig.style.display = "none";
		tabImages.classList.remove("tabone");
		contentImages.style.display = "none";
		tabNews.classList.add("tabone");
		contentNews.style.display = "flex";
	});

}

function createUpdaterPanel(title) {
	var panel = document.getElementsByClassName("content-calendar")[0];
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
	setTimeout(refreshData, 5000);
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
