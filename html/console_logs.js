class LogsWidget {
	LOGS_UPDATE_DELAY=2000;
	LOG_COMMAND_URL = "http://localhost:5002/health/log/";
	widget;

	constructor(widget) {
		this.widget = widget;
	}
	
	static init() {
		var widget = ConsoleFactory.createDecoratedWidget("Logs");
		var instance = new LogsWidget(widget);
		ConsoleFactory.addWidgetToWorkspace(instance.widget);
		setInterval((function(self) {
				return function () {
					self.getLogs();
				}
			})(instance), instance.LOGS_UPDATE_DELAY);
	}

	getLogs() {
		const self = this;
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() { self.dataHandler(xmlhttp); };
		xmlhttp.open("GET", this.LOG_COMMAND_URL + '50', true);
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

