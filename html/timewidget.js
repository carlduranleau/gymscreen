DATE_NAME = ["Janvier", "F&eacute;vrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Ao&ucirc;t", "Septembre", "Octobre", "Novembre", "D&eacute;cembre"];

function refreshDate(widget) {
	var dateObj = new Date();
	var currentDate = dateObj.getDate() + " " + DATE_NAME[dateObj.getMonth()] + " " + dateObj.getFullYear();
	var currentTime = to2Chars(dateObj.getHours()) + ":" + to2Chars(dateObj.getMinutes()) + ":" + to2Chars(dateObj.getSeconds());
	widget.innerHTML = currentDate + "<br>" + currentTime;
	widget.style.top = window.innerHeight - 80;
}

function to2Chars(input) {
	return ("0" + input).slice(-2);
}

function initTimeWidget() {
	var widget = document.createElement('div');
	widget.className = 'timewidget';
	widget.style.top = window.innerHeight - 80;
	document.body.appendChild(widget);
	setInterval(refreshDate, 1000, widget);
}

