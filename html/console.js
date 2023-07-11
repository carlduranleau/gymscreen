// Constants
DEBUG = true;

class Console {
	LOGIN_URL = "/auth/"		// Authentication URL
	HEALTH_URL = "/health"		// Health data url
	CONSOLE_UPDATE_DELAY = 5000						// Console refresh delay
	static instance;
	static sessiontoken;

	static init() {
		Console.instance = new Console();
		Console.instance.login();
	}

	static disconnect() {
		if (Console.instance) {
			Console.instance.logout();
		} else {
			window.location.reload();
		}
	}

	static get sessiontoken() {
		return this.sessiontoken;
	}

	static request(method, url, isAsync, onsuccess, onerror) {
		var xmlhttp = new XMLHttpRequest();
		
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				if (onsuccess && xmlhttp.status == 200) {
					onsuccess(xmlhttp.responseText);
				} else if (xmlhttp.status == 401) {
					Console.disconnect();
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
		if(!Console.sessiontoken) {
			this.showLogin();
		} else {
			UpdatersWidget.init();
			LogsWidget.init();
			HealthWidget.init();
			MemoryWidget.init();
			CPUWidget.init();
			NetworkWidget.init();
			this.showWorkspace();
		}
	}
	
	logout() {
		Console.sessiontoken = '';
		window.location.reload();
	}

	refreshData() {
		if (Console.sessiontoken) {
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
			console.log("No session");
			this.login();
		}
	}

	showLogin() {
		ConsoleFactory.workspace.style.visibility = 'hidden';
		ConsoleFactory.logoutbutton.style.visibility = 'hidden';
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
		ConsoleFactory.logoutbutton.style.visibility = 'visible';
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
				if(Console.sessiontoken) {
					self.refreshData();
				}
				self.login();
			},
			(status, response) => debugLog('createSession: something else other than 200 was returned')
		);
	}
}

class ConsoleFactory {
	static #listeners = [];
	static #widgets = [];
	static #workspace;
	static #logoutbutton;
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
	static createDecoratedWidget(title,state,listener) {
		try {
			var widget = new DecoratedWidget(title,state,listener);
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
					console.log("Widget with id '" + widget.id + "' already added to workspace.");
				} else {
					console.log("Widget with id '" + widget.id + "' added to workspace.");
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
					console.log("Listener with name '" + listener.name + "' subscribed.");
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
	
	static get logoutbutton() {
		if (!this.#logoutbutton) {
			this.#logoutbutton = document.getElementsByClassName("consoledisconnect")[0];
		}
		return this.#logoutbutton;
	}
	
	static maximize(widget) {
		if (this.#isWidget(widget)) {
			this.#widgets.forEach(w => {
				if (widget != w) {
					w.state = w.state | WidgetState.HIDDEN;
				} else {
					w.state = w.state | WidgetState.MAXIMIZED;
				}
			});
		}
	}
	
	static restore() {
		this.#widgets.forEach(w => {
			w.state = (w.state & ~WidgetState.HIDDEN) & ~WidgetState.MAXIMIZED;
		});
	}
	
	static #isWidget(widget) {
		var foundwidget = this.#widgets.filter(w => w.id == widget.id);
		if (foundwidget.length > 0) {
			return true;
		}
		return false;
	}
	
	static getWidgetById(widgetId) {
		var foundwidget = this.#workspaceContent.find(w => w.id == widgetId);
		return foundwidget;
	}
	
	static #isWidgetOnWorkspace(widget) {
		var foundwidget = this.#workspaceContent.filter(w => w.id == widget.id);
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
	#listener;
	#updateid;
	constructor(listener) {
		this.#id = (new Date()).getTime();
		this.#build();
		if (listener) {
			this.#listener = listener;
			this.#listener.widget = this;
		}
	}

	get id() {
		return this.#id;
	}	

	get frame() {
		return this.#rootPanel;
	}
	
	hide() {
		this.#rootPanel.style.display = 'none'
	}
	
	show(maximized) {
		this.#rootPanel.className = 'widgetframe' + (maximized ? 'maximized' : '');
		this.#rootPanel.style.display = 'block'
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
	#buttonPanel;
	#title;
	#state;
	#listener;
	constructor(title,state,listener) {
		super(listener);
		this.#title = title;
		if (listener) {
			this.#listener = listener;
			this.#listener.widget = this;
		}
		this.#build();
		this.state = (state ? state : WidgetState.DEFAULT);
	}
	
	set state(newState) {
		if (newState != undefined && newState != this.#state) {
			this.#state = newState;
			if (this.#listener) {
				if (this.#state & WidgetState.PAUSED || this.#state & WidgetState.HIDDEN) {
					this.#titlePanel.innerHTML = this.#title + "&nbsp;(Paused)"
					this.#listener.stop();
				} else {
					this.#titlePanel.innerHTML = this.#title
					this.#listener.start();
				}
			}
			if (this.#state & WidgetState.HIDDEN) {
				this.hide();
			} else {
				this.show(this.#state & WidgetState.MAXIMIZED);
			}
		}
	}
	
	get state() {
		return this.#state;
	}
	
	get title() {
		return this.#titlePanel;
	}
	
	set title(newTitle) {
		if (newTitle) {
			this.#titlePanel.innerHTML = newTitle;
			this.#title = newTitle;
		}
	}

	get content() {
		return this.#contentPanel;
	}
	
	togglePause() {
		if (this.#state & WidgetState.PAUSED) {
			this.state = this.#state & ~WidgetState.PAUSED;
		} else {
			this.state = this.#state | WidgetState.PAUSED;
		}
	}
	
	toggleMaximized() {
		if (this.#state & WidgetState.MAXIMIZED) {
			ConsoleFactory.restore();
		} else {
			ConsoleFactory.maximize(this);
		}
	}
	
	#build() {
		var panelTitleBar = document.createElement('div');
		panelTitleBar.className = 'widgettitlebar';
		
		var panelButtons = document.createElement('div');
		panelButtons.className = 'widgetbuttons';
		var buttons = this.#listener ? '<span class="widgetbutton" onclick="ConsoleFactory.getWidgetById(\'' + this.id + '\').togglePause()">&#8865;</span>' : '';
		buttons += '<span class="widgetbutton" onclick="ConsoleFactory.getWidgetById(\'' + this.id + '\').toggleMaximized()">&#8862;</span>'
		panelButtons.innerHTML = buttons;
		
		var panelTitle = document.createElement('div');
		panelTitle.className = 'widgettitle';
		panelTitle.innerHTML = this.#title;
		
		panelTitleBar.appendChild(panelTitle);
		panelTitleBar.appendChild(panelButtons);
		
		var panelContent = document.createElement('div');
		panelContent.className = 'widgetcontent';
		if (this.#listener) {
			panelContent.innerHTML = '<span style="font-style:italic">Waiting for data...</span>';
		}
		this.frame.appendChild(panelTitleBar);
		this.frame.appendChild(panelContent);
		this.#titlePanel = panelTitle;
		this.#buttonPanel = panelButtons;
		this.#contentPanel = panelContent;
	}
}

// Interface to subscribe to data updates
class Listener {
	#name;
	#url;
	#updateid;
	#updatedelay;
	#widget;
	constructor(name, url, updatedelay) {
		this.#url = url;
		this.#name = name;
		this.#updatedelay = updatedelay;
	}
	
	start() {
		debugLog("Listener '" + this.#name + "' starting.")
		if (!this.#updateid && this.#updatedelay && this.#url) {
			this.#updateid = setInterval((function(self) {
				return function () {
					self.getData();
				}
			})(this), this.#updatedelay);
			debugLog("Listener '" + this.#name + "' started.")
		}
	}
	
	stop() {
		if (this.#updateid) {
			clearInterval(this.#updateid);
			this.#updateid = undefined;
			debugLog("Listener '" + this.#name + "' stopped.")
		}
	}
	
	status() {
		return this.#updateid ? true : false;
	}
	
	set widget(w) {
		this.#widget = w;
	}
	
	get widget() {
		return this.#widget;
	}
	
	get name() {
		return this.#name;
	}
	
	getData() {
		const self = this;
		const url = this.#url;
		const name = this.#name;
		Console.request(
			"GET",
			url,
			true,
			(response) => self.onData(response),
			(status, response) => debugLog(name + ': data request returned with the status ' + status)
		);
	}
	
	onData(data) {
		console.log("Listener '" + this.#name + "' hasn't implemented onData method.");
	}
}

class WidgetState {
	static DEFAULT = 0;
	static MAXIMIZED = 1;
	static PAUSED = 2;
	static HIDDEN = 4;
}

function debugLog(msg) {
	if (DEBUG) {
		console.log(msg)
	}
}

