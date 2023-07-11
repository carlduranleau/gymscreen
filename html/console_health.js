class HealthWidget {
	static #healthWidget;

	static init() {
		this.#healthWidget = ConsoleFactory.createDecoratedWidget("Health", WidgetState.DEFAULT, new HealthListener("HealthListener", "/health", 5000));
		ConsoleFactory.addWidgetToWorkspace(this.#healthWidget);
	}
}

class HealthListener extends Listener {
	
	constructor(name,url,delay) {
		super(name,url,delay);
	}
	
	onData(data) {
		var u = JSON.parse(data);
		var html = `<p><b>starttime:</b>&nbsp;${u.environment.starttime}</p><p><b>updaterthread.running:</b>&nbsp;${u.updaterthread.running}</p><p><b>updaterthread.processcount:</b>&nbsp;${u.updaterthread.processcount}</p>`;
		Object.keys(u.config).forEach(c => html += `<p><b>${c}:</b>&nbsp;${u.config[c]}</p>`);
		this.widget.content.innerHTML = html;
		UpdatersWidget.onData(data);
	}
}
