class OSWidget {
	OS_UPDATE_DELAY=2000;
	OS_COMMAND_URL = "http://localhost:5002/health/os/";
	widget;

	constructor(widget) {
		this.widget = widget;
	}

	static init() {
		var widget = ConsoleFactory.createDecoratedWidget("Memory");
		var instance = new OSWidget(widget);
		ConsoleFactory.addWidgetToWorkspace(widget);
		setInterval((function(self) {
				return function () {
					self.getOSData();
				}
			})(instance), instance.OS_UPDATE_DELAY);
	}

	getOSData() {
		const self = this;
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() { self.dataHandler(xmlhttp); };
		xmlhttp.open("GET", this.OS_COMMAND_URL + 'ps/aux', true);
		xmlhttp.send();
	}
	
	dataHandler(xmlhttp) {
		if (xmlhttp.readyState == XMLHttpRequest.DONE) {
			if (xmlhttp.status == 200) {
				var parsed = xmlhttp.responseText.replace(/(?:\r\n|\r|\n)/g, '<br>');
				this.widget.content.innerHTML = JSON.parse(parsed).result;
			} else if (xmlhttp.status == 400) {
				debugLog('getLogs: There was an error 400');
			} else {
				debugLog('getLogs: something else other than 200 was returned: ' + xmlhttp.status);
			}
		}
	}
}
