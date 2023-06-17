// Constants
NEWS_FEED_URL = "http://localhost:5002/feed"		// News feed url
EVENTS_FEED_URL = "http://localhost:5002/calendarfeed"		// Events feed url
FILE_URL = "http://localhost:5002/images"	// Images feed url
CONFIG_URL = "http://localhost:5002/config"	// Configuration feed url
MAX_WINDOW_WIDTH = window.innerWidth;		// Browser width
MAX_WINDOW_HEIGHT = window.innerHeight;		// Browser height
BOX_SPACING = 20;							// General element spacing
CONFIG_UPDATE_DELAY = 60000					// Configuration expiration delay in ms
animationThreads = new Map();						// List of active animation threads
configurationMap = new Map();				// Configuration Map (property, value)
maintenanceMode = false;
DEBUG = false;
CONFIG_REFRESH_IN_PROGRESS = false;

/*
function startAnimThread(animId, name) {
	if (maintenanceMode) {
		debugLog ("Thread creation disabled in maintenance mode");
		stopAnimThread(animId, name);
	}
	if (animationThreads.has(name) && animId != animationThreads.get(name)) {
		debugLog("WARN: Trying to start the new thread " + name + " with id #" + animId + " over the already active thread #" + animationThreads.get(name));
		debugLog("WARN: Terminating thread #" + animationThreads.get(name));
		clearInterval(animationThreads.get(name));
   	}
	debugLog("Adding thread #" + animId + ": " + name);
	animationThreads.set(name, animId);
	return animId;
}

function stopAnimThread(animId, name) {
	debugLog("Stopping thread #" + animId + ": " + name);
	if (animationThreads.has(name)) {
		animationThreads.delete(name)
	}
	clearInterval(animId);
}
*/

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
	if (!name.startsWith("RAT$")) {
		clearInterval(animId);
	}
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

function refreshConfig() {
	debugLog ("refreshConfig");
	if (CONFIG_REFRESH_IN_PROGRESS) {
		return;
	}
	CONFIG_REFRESH_IN_PROGRESS = true;
	debugLog ("Refreshing config");
	var xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
           if (xmlhttp.status == 200) {
           		configurationMap.clear();
           		var properties = xmlhttp.responseText.split("\n");
			properties.forEach(function(entry) {
				if (entry.includes("=")) {
					property = entry.split("=");
					key = property[0];
					value = property[1];
					configurationMap.set(key.trim(), value.trim());
				}
			});
			if (configurationMap.size > 0) {
				configurationMap.set("expiration", (new Date()).getTime() + CONFIG_UPDATE_DELAY);
			}
			handleMaintenanceMode();
           }
           else if (xmlhttp.status == 400) {
		debugLog('There was an error 400');
           }
           else {
		debugLog('something else other than 200 was returned');
           }
           CONFIG_REFRESH_IN_PROGRESS = false;
        }
    };

    xmlhttp.open("GET", CONFIG_URL, true);
    xmlhttp.send();
}

function handleMaintenanceMode() {
	if (configurationMap.has("maintenanceMode")) {
		var newMaintenanceMode = configurationMap.get("maintenanceMode") && (configurationMap.get("maintenanceMode") == "on" || configurationMap.get("maintenanceMode") == "true");
		if (newMaintenanceMode) {
			setTimeout(refreshConfig, 10000);
		}
		if (newMaintenanceMode != maintenanceMode) {
			maintenanceMode = newMaintenanceMode;
			if (maintenanceMode) {
				debugLog ("Maintenance mode has been activated");
				clearThreads();
				var screenMask = document.createElement("div");
				screenMask.setAttribute("class", "maintenance");
				document.body.appendChild(screenMask);
			} else {
				location.reload();
			}
		}
	}
}

function getConfig(param, defaultValue) {

	if (!configurationMap.has("expiration") || !configurationMap.has(param)) {
		refreshConfig();
		debugLog ("Getting default config for " + param + ": " + defaultValue);
		return defaultValue;
	}

	if (isConfigurationExpired()) {
		refreshConfig();
	}

	debugLog ("Getting config for " + param + ": " + configurationMap.get(param));
	return configurationMap.get(param);
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

class ThreadManager {
	static #threads = new Map();
	
	static createThread(runnerFunc, params, interval) {
		const thread = new Thread(runnerFunc, params, interval);
		this.register(thread);
		return thread;
	}

	static stopThread(id) {
		const thread = this.#threads.get(id);
		if (thread) {
			this.unregister(thread);
		}
	}
	
	static register(newThread) {
		if (!this.isRegistered(newThread)) {
			this.#threads.set(newThread.id, newThread);
		}
	}
	
	static isRegistered(thread) {
		return this.#threads.has(thread.id);
	}
	
	static threadCount() {
		return this.#threads.size();
	}
	
	static unregister(thread) {
		if (this.isRegistered(thread)) {
			thread.stop();
			this.#threads.delete(thread);
		}
	}
	
	static get stats() {
		var stats = "";
		if (this.#threads.size > 0) {
			this.#threads.forEach((t) => {
				stats += ("Thread #" + t.id + ": " + (t.running ? "Running" : "Stopped") + "\n");
			});
		} else {
			stats = "No thread found.";
		}
		return stats
	}
}

class Thread {
	#id;
	#func;
	#params;
	#interval;
	#lastrunstamp;
	#running = false;
	constructor(func, params, interval) {
		this.#id = window.performance.now();
		this.#func = func;
		this.#params = params; 
		this.#interval = interval;
		
		this.#params.push(this);
		if (interval) {
			debugLog("Interval (" + interval + "ms) thread " + this.#id + " created.");
		} else {
			debugLog("Thread " + this.#id + " created.");
		}
	}
	
	start(){
		debugLog("Thread " + this.#id + " started.");
		if (!this.#running) {
			this.#lastrunstamp = (new Date()).getTime();
			this.#running = true;
			this.run();
		}
	}
	
	stop() {
		debugLog("Thread " + this.#id + " stopped.");
		this.#running = false;
	}
	
	run() {
		const self = this;
		const params = this.#params;
		const func = this.#func;
		if (this.#running) {
			if (!this.#interval) {
				func.apply(null, params);
				requestAnimationFrame(() => {
					self.run();
				});
			} else {
				if (this.#interval) {
					const endTime = (new Date()).getTime() + this.#interval;
					this.sleepUntil(endTime);
				}
			}
		}
	}
	
	sleepUntil(untilTime) {
		if (this.#running) {
			const self = this;
			const params = this.#params;
			const func = this.#func;
			if ((new Date()).getTime() < untilTime) {
				requestAnimationFrame(() => {
					self.sleepUntil(untilTime);
				});
			} else {
				func.apply(null, params);
				self.run();
			}
		}
	}
	
	get running() {
		return this.#running;
	}
	
	get id() {
		return this.#id;
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
	initTimeWidget();
}
