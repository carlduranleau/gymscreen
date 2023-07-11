class MemoryWidget {
	static init() {
		ConsoleFactory.addWidgetToWorkspace(
			ConsoleFactory.createDecoratedWidget("Memory", WidgetState.DEFAULT, new MemoryListener("MemoryListener", "/health/os/ps/aux/--sort=-%mem", 2000)));
	}
}

class MemoryListener extends Listener {
	
	constructor(name,url,delay) {
		super(name,url,delay);
	}
	
	onData(data) {
		var parsed = data.replace(/(?:\r\n|\r|\n)/g, '<br>');
		this.widget.content.innerHTML = this.getFormattedData(JSON.parse(parsed).result);
	}
	
	getFormattedData(data) {
		const FIELDS = ['user', 'pid', 'cpu', 'mem', 'rss', 'vsz', 'rss', 'tty', 'stat', 'start time', 'command'];
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
		dataObj.forEach(d => dataObj.filter(f => f.command != '' && f.command == d.command && f.pid != d.pid).forEach((e) => { d.mem = (parseFloat(d.mem) + parseFloat(e.mem)).toString(); e.mem = '0.0'; e.command = '' }));
		var formattedData = '';
		dataObj.filter(d => d.mem != '0.0' && d.mem != '0').forEach(d => formattedData += `<p><b>${d.mem}%:</b>&nbsp;${d.command}</p><p>`);
		return formattedData;
	}
}
