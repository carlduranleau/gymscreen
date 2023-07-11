class NetworkWidget {
	static init() {
		ConsoleFactory.addWidgetToWorkspace(
			ConsoleFactory.createDecoratedWidget("Network", WidgetState.DEFAULT, new NetworkListener("NetworkListener", "/health/os/iwconfig/wlan0;ifconfig/wlan0", 2000)));
	}
}

class NetworkListener extends Listener {
	
	constructor(name,url,delay) {
		super(name,url,delay);
	}
	
	onData(data) {
		var parsed = data.replace(/(?:\r\n|\r|\n)/g, '<br>');
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
