class HealthWidget {
	static #healthWidget;

	static init() {
		this.#healthWidget = ConsoleFactory.createDecoratedWidget("Health");
		ConsoleFactory.subscribeToData(new HealthListener(this.#healthWidget));
		ConsoleFactory.addWidgetToWorkspace(this.#healthWidget);
	}
}

class HealthListener extends Listener {
	constructor(widget) {
		super(widget, widget.id);
	}
	
	onData(data) {
		var u = JSON.parse(data);
		var html = `<p><b>starttime:</b>&nbsp;${u.environment.starttime}</p><p><b>updaterthread.running:</b>&nbsp;${u.updaterthread.running}</p><p><b>updaterthread.processescount:</b>&nbsp;${u.updaterthread.processescount}</p>`;
		Object.keys(u.config).forEach(c => html += `<p><b>${c}:</b>&nbsp;${u.config[c]}</p>`);
		this.widget.content.innerHTML = html;
	}
}
