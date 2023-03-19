class CPUWidget {
	OS_UPDATE_DELAY=2000;
	OS_COMMAND_URL = "http://localhost:5002/health/os/";
	widget;

	constructor(widget) {
		this.widget = widget;
	}

	static init() {
		var widget = ConsoleFactory.createDecoratedWidget("CPU");
		var instance = new CPUWidget(widget);
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
		xmlhttp.open("GET", this.OS_COMMAND_URL + 'top/n1/b', true);
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
