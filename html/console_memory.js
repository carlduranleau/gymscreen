class MemoryWidget {
	OS_UPDATE_DELAY=2000;
	OS_COMMAND_URL = "http://localhost:5002/health/os/";
	widget;

	constructor(widget) {
		this.widget = widget;
	}

	static init() {
		var widget = ConsoleFactory.createDecoratedWidget("Memory");
		var instance = new MemoryWidget(widget);
		ConsoleFactory.addWidgetToWorkspace(widget);
		instance.getOSData();
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
		xmlhttp.open("GET", this.OS_COMMAND_URL + 'ps/aux/--sort=-%mem', true);
		xmlhttp.send();
	}
	
	dataHandler(xmlhttp) {
		if (xmlhttp.readyState == XMLHttpRequest.DONE) {
			if (xmlhttp.status == 200) {
				var parsed = xmlhttp.responseText.replace(/(?:\r\n|\r|\n)/g, '<br>');
				this.widget.content.innerHTML = this.getFormattedData(JSON.parse(parsed).result);
			} else if (xmlhttp.status == 400) {
				debugLog('getOSData: There was an error 400');
			} else {
				debugLog('getOSData: something else other than 200 was returned: ' + xmlhttp.status);
			}
		}
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
