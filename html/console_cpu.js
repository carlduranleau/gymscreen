class CPUWidget {
	static OS_UPDATE_DELAY=2000;
	static OS_COMMAND_URL = "/health/os/";
	static #widget;

	constructor(widget) {
		this.widget = widget;
	}

	static init() {
		this.#widget = ConsoleFactory.createDecoratedWidget("CPU", WidgetState.NORMAL, new CPUListener("CPUListener", this.OS_COMMAND_URL + 'top/n1/b', this.OS_UPDATE_DELAY));
		ConsoleFactory.addWidgetToWorkspace(this.#widget);
	}
}

class CPUListener extends Listener {
	
	constructor(name,url,delay) {
		super(name,url,delay);
	}

	onData(response) {
		var parsed = response.replace(/(?:\r\n|\r|\n)/g, '<br>');
		this.widget.content.innerHTML = this.getFormattedData(JSON.parse(parsed).result);
	}
	
	getFormattedData(data) {
		const FIELDS = ['pid', 'user', 'pr', 'ni', 'virt', 'res', 'shr', 's', 'cpu', 'mem', 'time', 'command'];
		data = data.substring(data.indexOf('COMMAND') + 7);
		var processes = data.split('<br>').filter(d => d.trim());
		var dataObj = [];
		
		processes.forEach((p) => {
			var fields = {};
			var values = p.split(' ').filter(f => f.trim());
			var i = 0;
			FIELDS.forEach((f) => {
				fields[f] = values[i].trim();
				i++;
			});
			dataObj.push(fields);
		});
		dataObj.forEach(d => dataObj.filter(f => f.command != '' && f.command == d.command && f.pid != d.pid).forEach((e) => { d.cpu = (parseFloat(d.cpu) + parseFloat(e.cpu)).toString(); e.cpu = '0.0'; e.command = '' }));
		var formattedData = '';
		dataObj.filter(d => d.cpu != '0.0' && d.command != 'top').forEach(d => formattedData += `<p><b>${d.command}:</b>&nbsp;${d.cpu}%</p><p>`);
		return formattedData;
	}
}
