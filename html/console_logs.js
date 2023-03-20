class LogsWidget {
	LOGS_UPDATE_DELAY=2000;
	LOG_COMMAND_URL = "/health/log/";
	widget;

	constructor(widget) {
		this.widget = widget;
	}
	
	static init() {
		var widget = ConsoleFactory.createDecoratedWidget("Logs");
		var instance = new LogsWidget(widget);
		ConsoleFactory.addWidgetToWorkspace(instance.widget);
		instance.getLogs();
		setInterval((function(self) {
				return function () {
					self.getLogs();
				}
			})(instance), instance.LOGS_UPDATE_DELAY);
	}

	getLogs() {
		const self = this;
		Console.request(
			"GET",
			this.LOG_COMMAND_URL + '50',
			true,
			(response) => self.dataHandler(response),
			(status, response) => debugLog('getLogs: something else other than 200 was returned')
		);
	}
	
	dataHandler(response) {
		var parsed = response.replace(/(?:\r\n|\r|\n)/g, '<br>');
		this.widget.content.innerHTML = JSON.parse(parsed).result;
	}
}

