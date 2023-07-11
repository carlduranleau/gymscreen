class LogsWidget {
	static init() {
		ConsoleFactory.addWidgetToWorkspace(
			ConsoleFactory.createDecoratedWidget("Logs", WidgetState.DEFAULT, new LogsListener("LogsListener", '/health/log/50', 2000)));
	}
}

class LogsListener extends Listener {
	
	constructor(name,url,delay) {
		super(name,url,delay);
	}

	onData(data) {
		var parsed = data.replace(/(?:\r\n|\r|\n)/g, '<br>');
		this.widget.content.innerHTML = JSON.parse(parsed).result;
	}
}
