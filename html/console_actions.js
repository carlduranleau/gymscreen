class ActionPanelWidget {
	OS_COMMAND_URL = "/health/os/";
	widget;

	constructor(widget) {
		this.widget = widget;
	}

	static init() {
		var widget = ConsoleFactory.createWidget();
		var instance = new ActionPanelWidget(widget);
		//ConsoleFactory.addWidgetToWorkspace(widget);
		instance.getOSData();
		setInterval((function(self) {
				return function () {
					self.getOSData();
				}
			})(instance), instance.OS_UPDATE_DELAY);
	}

	buildActionBar() {
		var actionPanel = document.createElement('div');
		actionPanel.className = 'consolepanelcontainer';
		this.widget.frame
	}
	
	createAction(name, command) {
		var self = this;
		var rebootAction = document.createElement('button');
		rebootAction.className = 'consoleaction';
		rebootAction.innerText = name;
		rebootaction.onclick = () => self.runCommand(command);
	}
	

	runCommand(command) {
		const self = this;
		Console.request(
			"GET",
			this.OS_COMMAND_URL + (command.split(' ').join('/')),
			true,
			(response) => self.dataHandler(response),
			(status, response) => debugLog('runCommand: something else other than 200 was returned')
		);
	}
	
	confirm() {
	}
	
	dataHandler(response) {
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
