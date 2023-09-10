class CMDWidget {
	static widget;
	static menu;
	static init() {
		this.widget = ConsoleFactory.createWidget("Menu", WidgetState.DEFAULT)
		this.#build()
	}
	
	static #build() {
		if (this.widget) {
			if (this.widget.frame.childNodes.length == 0) {
				const frame = this.widget.frame;
				frame.style.backgroundColour = '#222222';
				frame.style.width = '32px';
				frame.style.height = '32px';
				frame.style.textAlign = 'right';
				frame.style.display = 'flex';
				frame.style.flexFlow = 'row';
				frame.style.flexWrap = 'nowrap';
				
				const menuButton = document.createElement('img');
				menuButton.src='consolemenu.png';
				menuButton.style.width = '32px';
				menuButton.style.height = '32px';
				
				frame.appendChild(menuButton);
				const menuPanel = document.getElementsByClassName("consoletitle")[0]
				menuPanel.appendChild(frame);
				
				this.addMenu("Reload page", () => this.#executeRequest("/health/os/sh/reloadPage", "Reload page"));
				this.addMenu("Restart service", () => this.#executeRequest("/health/os/pkill/-x/python", "Restart service"));
				this.addMenu("Restart server", () => this.#executeRequest("/health/os/shutdown/-r/now", "Restart server"));
				this.addMenu("Shutdown server", () => this.#executeRequest("/health/os/shutdown/-h/now", "Shutdown server"));
				this.addSeparator();
				this.addMenu("Logout", Console.disconnect);
				
			} else {
				console.log("CMDWidget: Widget already built.");
			}
		} else {
			console.log("CMDWidget: No widget to draw.");
		}
	}
	
	static #buildMenu() {
		this.menu = document.createElement('div');
		this.menu.style.backgroundColor = '#888888';
		this.menu.style.width = '150px';
		this.menu.style.height = '20px';
		this.menu.style.position = 'absolute';
		this.menu.style.visibility = 'hidden';
		this.menu.style.flexFlow = 'column';
		this.menu.style.flexWrap = 'nowrap';
		//const widgetLocation = this.widget.frame.getBoundingClientRect();
		//this.menu.style.top = (widgetLocation.top + (widgetLocation.height / 2)) + 'px';
		//this.menu.style.left = (widgetLocation.left + widgetLocation.width - parseInt(this.menu.style.width)) + 'px';
		this.menu.onmouseleave = this.closeMenu;
		this.menu.onblur = this.closeMenu;
		this.widget.frame.onclick = this.openMenu;
		document.getElementsByClassName("consolecontainer")[0].appendChild(this.menu);
	}
	
	static addSeparator() {
		if (!this.menu) this.#buildMenu();
		const menuEntry = document.createElement('div');
		menuEntry.style.backgroundColor = '#888888';
		menuEntry.style.width = '100%';
		menuEntry.style.height = '20px';
		menuEntry.style.fontSize = '18px';
		menuEntry.style.cursor = 'default';
		menuEntry.style.paddingTop = '4px';
		menuEntry.style.paddingBottom = '4px';
		menuEntry.innerHTML = '<hr/>';
		this.menu.style.height = (this.menu.childNodes.length *  20) + 'px'
		this.menu.append(menuEntry);		
		
	}
	static addMenu(name, action) {
		if (!this.menu) this.#buildMenu();
		const menuEntry = document.createElement('div');
		menuEntry.style.backgroundColor = '#888888';
		menuEntry.style.width = '100%';
		menuEntry.style.height = '20px';
		menuEntry.style.fontSize = '18px';
		menuEntry.style.cursor = 'pointer';
		menuEntry.style.paddingTop = '4px';
		menuEntry.style.paddingBottom = '4px';
		menuEntry.innerHTML = '&nbsp;' + name + '&nbsp;';
		menuEntry.onclick = action;
		menuEntry.onmouseover = this.#highlightEntry;
		menuEntry.onmouseleave = this.#restoreEntry;
		this.menu.style.height = (this.menu.childNodes.length *  20) + 'px'
		this.menu.append(menuEntry);		
	}
	
	static #executeEntry(action) {
		this.closeMenu();
		action();
	}
	
	static #highlightEntry(event) {
		event.target.style.backgroundColor = '#555555';
	}

	static #restoreEntry(event) {
		event.target.style.backgroundColor = '#888888';
	}
	
	static openMenu() {
		if (CMDWidget.menu.style.visibility != 'hidden') {
			CMDWidget.menu.style.visibility = 'hidden';
		} else {
			const widgetLocation = CMDWidget.widget.frame.getBoundingClientRect();
			CMDWidget.menu.style.top = (widgetLocation.top + (widgetLocation.height / 2)) + 'px';
			CMDWidget.menu.style.left = (widgetLocation.left + widgetLocation.width - parseInt(CMDWidget.menu.style.width)) + 'px';
			CMDWidget.menu.style.visibility = 'visible';
			CMDWidget.menu.focus();
		}
		
	}
	
	static closeMenu() {
		CMDWidget.menu.style.visibility = 'hidden';
	}
	
	static #executeRequest(requestUrl, requestName) {
		if (confirm("This action will close your session. Click 'OK' to continue. (" + requestName + ")")) {
			Console.request("GET", requestUrl, false, (response) => alert("Request executed successfully (" + requestName + ")"), (status, response) => alert("Can't execute request (" + requestName + "): " + response));
		}
	}
}
