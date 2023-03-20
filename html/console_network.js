class NetworkWidget {
	OS_UPDATE_DELAY=2000;
	OS_COMMAND_URL = "http://localhost:5002/health/os/";
	widget;

	constructor(widget) {
		this.widget = widget;
	}

	static init() {
		var widget = ConsoleFactory.createDecoratedWidget("Network");
		var instance = new NetworkWidget(widget);
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
		Console.request(
			"GET",
			this.OS_COMMAND_URL + 'iwconfig/wlan0;ifconfig/wlan0',
			true,
			(response) => self.dataHandler(response),
			(status, response) => debugLog('getOSData: something else other than 200 was returned')
		);
	}
	
	dataHandler(response) {
		var parsed = response.replace(/(?:\r\n|\r|\n)/g, '<br>');
		this.widget.content.innerHTML = this.getFormattedData(JSON.parse(parsed).result);
	}
	
	getFormattedData(data) {
		var blocks = data.split('<br><br>').filter(b => b.trim());	// Split iwconfig and ifconfig information
		return this.getWifiFormattedData(blocks[0]) + this.getNetworkFormattedData(blocks[1]);
	}
	
	getNetworkFormattedData(networkdata) {
		var data = networkdata.substring(networkdata.indexOf('inet')).replace(/\([\s\S]*?\)/g, '').replaceAll('<br>', ' ');
		var fields = data.split('  ').filter(d => d.trim());
		var dataObj = {};
		fields.forEach((d) => {
			var elem = d.trim().split(' ');
			var key = elem.length > 2 ? elem.slice(0, -1).join(' ') : elem[0];
			dataObj[key.trim()] = elem[elem.length - 1].trim();
		});
		var formattedData = '';
		Object.keys(dataObj).forEach(d => formattedData += `<p><b>${d}:</b>&nbsp;${dataObj[d]}</p><p>`);
		return formattedData;
	}

	getWifiFormattedData(wifidata) {
		var data = wifidata.substring(wifidata.indexOf('ESSID')).replaceAll('<br>', '');
		var fields = data.split('  ').filter(d => d.trim());
		var dataObj = {};
		fields.forEach((d) => {
			var elem = d.split(/[:=]+/);
			dataObj[elem[0].trim()] = elem[1].trim();
		});
		var formattedData = '';
		Object.keys(dataObj).forEach(d => formattedData += `<p><b>${d}:</b>&nbsp;${dataObj[d]}</p><p>`);
		return formattedData;
	}
}
