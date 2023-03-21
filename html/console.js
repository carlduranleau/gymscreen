// Constants
DEBUG = true;

class Console {
	LOGIN_URL = "/auth/"		// Authentication URL
	HEALTH_URL = "/health"		// Health data url
	CONSOLE_UPDATE_DELAY = 5000						// Console refresh delay
	static instance;
	static sessiontoken;

	static init() {
		var instance = new Console();
		instance.login();
	}

	static get sessiontoken() {
		return this.sessiontoken;
	}

	static request(method, url, isAsync, onsuccess, onerror) {
		//debugLog ("Console.request");
		var xmlhttp = new XMLHttpRequest();
		
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				if (onsuccess && xmlhttp.status == 200) {
					onsuccess(xmlhttp.responseText);
				} else if (xmlhttp.status == 401) {
					window.location.reload();
				} else if (onerror) {
					onerror(xmlhttp.status, xmlhttp.responseText)
				}
			}
		};
		xmlhttp.open(method, url, isAsync);
		if (this.sessiontoken) {
			xmlhttp.setRequestHeader("auth", this.sessiontoken);
		}
		xmlhttp.send();
	}

	login() {
		//var p = prompt("Enter administrator password:");
		//this.createSession(p);
		if(!Console.sessiontoken) {
			this.showLogin();
		} else {
			ConsoleFactory.showWorkspace();
		}
	}
	
	logout() {
		Console.sessiontoken = '';
	}

	refreshData() {
		if (ConsoleFactory.listenersCount > 0 && Console.sessiontoken) {
			Console.request(
				"GET",
				this.HEALTH_URL,
				true,
				(response) => ConsoleFactory.invokeListeners(response),
				(status, response) => debugLog('something else other than 200 was returned')
			);
			setTimeout((function(self) {
				return function () {
					self.refreshData();
				}
			})(this), this.CONSOLE_UPDATE_DELAY);
		} else {
			console.log("Can't refresh");
		}
	}

	showLogin() {
		ConsoleFactory.workspace.style.visibility = 'hidden';
		var loginWindow = document.getElementsByClassName("consolelogincontainer")[0]
		if (loginWindow) {
			loginWindow.style.visibility = 'visible';
		} else {
			const self = this;
			Console.request(
				"GET",
				"/l.html",
				true,
				(response) => {
					const consolePanel = document.getElementsByClassName("consolecontainer")[0];
					loginWindow = document.createElement('div');
					loginWindow.className = "consolelogincontainer"
					loginWindow.innerHTML = response;
					document.body.appendChild(loginWindow);
					loginWindow.style.visibility = 'visible';
					const loginField = document.getElementById("pw");
					const loginButton = document.getElementById("login");
					loginButton.onclick = (e) => { self.processLogin(loginField.value); loginField.value="";return false; };
					loginField.onkeypress = (e) => { 
						if (e.keyCode == 13) {
							self.processLogin(loginField.value);
							loginField.value="";
							return false;
						}
						return true;
					};
					loginField.focus();
					
				},
				(status, response) => alert('ERROR: Cannot load login prompt.')
			);

		}
	}

	showWorkspace() {
		const loginWindow = document.getElementsByClassName("consolelogincontainer")[0]
		if (loginWindow) {
			loginWindow.style.visibility = 'hidden';
		}
		ConsoleFactory.workspace.style.visibility = 'visible';
	}

	processLogin(pw) {
		this.createSession(pw);
	}

	createSession(p) {
		Console.sessiontoken = '';
		const self = this;
		Console.request(
			"GET",
			this.LOGIN_URL + p,
			true,
			(response) => { 
				Console.sessiontoken = JSON.parse(response).token;
				if(!Console.sessiontoken) {
					self.showLogin();
				} else {
					self.showWorkspace();
					self.refreshData();
				}
			},
			(status, response) => debugLog('createSession: something else other than 200 was returned')
		);
	}
}

class ConsoleFactory {
	static #listeners = [];
	static #widgets = [];
	static #workspace;
	static #workspaceContent = [];
	
	static get widgetsInformation() {
		return this.#widgets.map(widget => new WidgetInformation(widget.id, this.#isWidgetOnWorkspace(widget), widget.title ? "DECORATED" : "RAW"));
	}

	static get listenersCount() {
		return this.#listeners.length;
	}

	static invokeListeners(data) {
		this.#listeners.forEach(listener => listener.onData(data));
	}
	
	// Create a new UI widget with title and content panel.
	static createDecoratedWidget(title) {
		try {
			var widget = new DecoratedWidget(title);
			this.#registerWidget(widget);
			return widget;
		} catch (e) {
			console.log("ConsoleFactory.createDecoratedWidget: " + e);
		}
		return;
	}
	// Create a new empty UI widget.
	static createWidget() {
		try {
			var widget = new Widget();
			this.#registerWidget(widget);
			return widget;
		} catch (e) {
			console.log("ConsoleFactory.createWidget: " + e);
		}
		return;
	}
	// Add a widget to the console workspace.
	static addWidgetToWorkspace(widget) {
		try {
			if (this.#isWidget(widget)) {
				if (this.#isWidgetOnWorkspace(widget)) {
					//console.log("Widget with id '" + widget.id + "' already added to workspace.");
				} else {
					//console.log("Widget with id '" + widget.id + "' added to workspace.");
					this.workspace.appendChild(widget.frame);
					this.#workspaceContent.push(widget);
				}
			} else {
				console.log("Widget with id '" + widget.id + "' not found. Only widgets created using ConsoleFactory.createWidget can be added to workspace.");
			}
		} catch(e) {
			console.log("ConsoleFactory.addWidgetToWorkspace: " + e);
		}
	}
	// Remove a widget to the console workspace.
	static removeWidgetFromWorkspace(widget) {
		try {
			if (this.#isWidgetOnWorkspace(widget)) {
				this.workspace.removeChild(widget.frame);
				this.#workspaceContent = this.#workspaceContent.filter(w => w.id !== widget.id);
			} else {
				console.log("Widget with id '" + widget.id + "' not found on workspace.");
			}
		} catch(e) {
			console.log("ConsoleFactory.removeWidgetFromWorkspace: " + e);
		}
	}
	
	// Remove a widget from the console workspace. Deleted widgets cannot be added through Console.addWidget.
	static deleteWidget(widget) {
		try {
			if (this.#isWidget(widget)) {
				this.remoteWidgetFromWorkspace(widget);
				this.#widgets = this.#widgets.filter(w => w.id !== widget.id);
			} else {
				console.log("Widget with id '" + widget.id + "' not found.");
			}
		} catch(e) {
			console.log("ConsoleFactory.deleteWidget: " + e);
		}
	}
	// Add a new data update listener. Every listener must implement the Listener class, or declare an onData method and a name property.
	static subscribeToData(listener) {
		try {
			if (listener.onData && listener.name) {
				if (this.#isListener(listener)) {
					console.log("Listener with name '" + listener.name + "' already subscribed.");
				} else {
					if (this.#listeners.count == 0) {
						Console.instance.refreshData();
					}
					this.#listeners.push(listener);
					//console.log("Listener with name '" + listener.name + "' subscribed.");
				}
			} else {
				console.log("Invalid listener. Data subscription aborted.");
			}
			//console.log("Listeners count: " + this.#listeners.length);
		} catch(e) {
			console.log("ConsoleFactory.subscribeToData: " + e);
		}
	}
	// Remove a listener.
	static unsubscribeToData(listener) {
		try {
			if (listener.onData && listener.name) {
				if (this.#isListener(listener)) {
					this.#listeners.push(listener);
				} else {
					console.log("Listener with name '" + listener.name + "' not found.");
				}
			} else {
				console.log("Invalid listener.");
			}
		} catch(e) {
			console.log("ConsoleFactory.unsubscribeToData: " + e);
		}
	}
	
	static get workspace() {
		if (!this.#workspace) {
			this.#workspace = document.getElementsByClassName("consolepanelcontainer")[0];
		}
		return this.#workspace;
	}
	
	static #isWidget(widget) {
		var foundwidget = this.#widgets.filter(w => w.id === widget.id);
		if (foundwidget.length > 0) {
			return true;
		}
		return false;
	}
	
	static #isWidgetOnWorkspace(widget) {
		var foundwidget = this.#workspaceContent.filter(w => w.id === widget.id);
		if (foundwidget.length > 0) {
			return true;
		}
		return false;
	}

	static #isListener(listener) {
		var foundlistener = this.#listeners.filter(l => l.name === listener.name);
		if (foundlistener.length > 0) {
			return true;
		}
		return false;
	}

	static #registerWidget(widget) {
		this.#widgets.push(widget);
	}
}

// Information template to return immutable widget information.
class WidgetInformation {
	#id;
	#onWorkspace = false;
	#type;
	constructor(id, onWorkspace, type) {
		this.#id = id;
		this.#onWorkspace = onWorkspace;
		this.#type = type;
	}
	
	get id() {
		return this.#id;
	}
	
	get onWorkspace() {
		return this.#onWorkspace;
	}
	
	get type() {
		return this.#type;
	}
}

// Base widget frame without title and content panels
class Widget {
	#id;
	#rootPanel;
	constructor() {
		this.#id = (new Date()).getTime();
		this.#build();
	}

	get id() {
		return this.#id;
	}	

	get frame() {
		return this.#rootPanel;
	}
	
	#build() {
		var panelContainer = document.createElement('div');
		panelContainer.className = 'widgetframe';
		this.#rootPanel = panelContainer;
	}
}

// Widget with title and content panels
class DecoratedWidget extends Widget {
	#titlePanel;
	#contentPanel;
	#title;
	constructor(title) {
		super();
		this.#title = title;
		this.#build();
	}
	
	get title() {
		return this.#titlePanel;
	}

	get content() {
		return this.#contentPanel;
	}
	
	#build() {
		var panelTitle = document.createElement('div');
		panelTitle.className = 'widgettitle';
		panelTitle.innerHTML = this.#title;
		var panelContent = document.createElement('div');
		panelContent.className = 'widgetcontent';
		this.frame.appendChild(panelTitle);
		this.frame.appendChild(panelContent);
		this.#titlePanel = panelTitle;
		this.#contentPanel = panelContent;		
	}
}

// Interface to subscribe to data updates
class Listener {
	#name;
	#widget;
	constructor(widget, name) {
		this.#widget = widget;
		this.#name = name;
	}
	
	get name() {
		return this.#name;
	}

	get widget() {
		return this.#widget;
	}
	
	onData(data) {
		console.log("Listener '" + this.#name + "' hasn't implemented onData method.");
	}
}

function debugLog(msg) {
	if (DEBUG) {
		console.log(msg)
	}
}

