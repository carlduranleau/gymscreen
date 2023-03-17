// Constants
var UpdatersViewer = {};
UpdatersViewer.onData = (data) => {
	console.log(data);
}

var widget1;
var widget2;

class UpdatersListener extends Listener {
	#widget;
	constructor(widget) {
		super(widget.id);
		this.#widget = widget;
	}
	
	onData(data) {
		//console.log(data);
		widget2.content.innerHTML = ConsoleFactory.widgetsInformation.map(i => "ID: " + i.id + " displayed: " + i.onWorkspace + " type: " + i.type + "<br>");
		this.#widget.content.innerHTML = data;
	}
}

function initWidget() {
	widget1 = ConsoleFactory.createDecoratedWidget("Updaters1");
	widget2 = ConsoleFactory.createDecoratedWidget("Updaters2");
	ConsoleFactory.subscribeToData(new UpdatersListener(widget1));
	ConsoleFactory.subscribeToData(new UpdatersListener(widget2));
	//initTabs(widget);
	ConsoleFactory.addWidgetToWorkspace(widget1);
	ConsoleFactory.addWidgetToWorkspace(widget2);
}

function initTabs(widget) {
	
	// MUST CREATE TABS HERE (Check console.html for HTML code to convert to JS)
	
	
	const tabCalendar = widget.content.querySelector(".tab-calendar");
	const tabConfig = widget.content.querySelector(".tab-config");
	const tabImages = widget.content.querySelector(".tab-images");
	const tabNews = widget.content.querySelector(".tab-news");

	const contentCalendar = widget.content.querySelector(".content-calendar");
	const contentConfig = widget.content.querySelector(".content-config");
	const contentImages = widget.content.querySelector(".content-images");
	const contentNews = widget.content.querySelector(".content-news");

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

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

// Event handling
/*
window.onresize = function (event) {
	MAX_WINDOW_WIDTH = window.innerWidth;
	MAX_WINDOW_HEIGHT = window.innerHeight;
	HIDE_MARGIN = MAX_WINDOW_WIDTH + BOX_SPACING;
}

window.onload = function(event) {
	initWidget();
}
*/
