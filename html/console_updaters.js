class UpdatersWidget {
	static #updaterWidget;
	
	static init() {
		this.#updaterWidget = ConsoleFactory.createDecoratedWidget("Updaters", WidgetState.DEFAULT);
		//this.#updaterWidget.content.innerHTML = '<span style="font-style:italic">Waiting for data...</span>';
		ConsoleFactory.addWidgetToWorkspace(this.#updaterWidget);
	}

	static get instance() {
		return this.#updaterWidget;
	}

	// THIS WIDGET HAS NO LISTENER. IT GETS DATA FROM THE HEALTHWIDGET FEED BECAUSE THEY SHARE THE SAME DATA SOURCE.
	static onData(data) {
		var healthData = JSON.parse(data);
		var updaters = healthData.updaterthread.processes.map(u => `<p><b>name:</b>&nbsp;${u.name}</p><p><b>haserror:</b>&nbsp;${u.haserror}</p><p><b>lasterror:</b>&nbsp;${u.lasterror}</p><p><b>lastexecution:</b>&nbsp;${u.lastexecution}</p><p><b>lastexecutiontime:</b>&nbsp;${u.lastexecutiontime}</p><p><b>url:</b>&nbsp;${u.customdata.url}</p>`);
		this.#updaterWidget.content.innerHTML = updaters.join('<hr>');
	}
	
	static #initTabs(widget) {
		
		// MUST CREATE TABS HERE (Check console.html for HTML code to convert to JS)
		
		const tabCalendar = widget.content.querySelector(".tab-calendar");
		const tabConfig = widget.content.querySelector(".tab-config");
		const tabImages = widget.content.querySelector(".tab-images");
		const tabNews = widget.content.querySelector(".tab-news");

		const contentCalendar = widget.content.querySelector(".content-calendar");
		const contentConfig = widget.content.querySelector(".content-config");
		const contentImages = widget.content.querySelector(".content-images");
		const contentNews = widget.content.querySelector(".content-news");

		tabCalendar.classList.add("tabone");
		contentCalendar.style.display = "flex";
		contentConfig.style.display = "none";
		contentImages.style.display = "none";
		contentNews.style.display = "none";
		
		tabCalendar.addEventListener("click", () => {
			tabCalendar.classList.add("tabone");
			contentCalendar.style.display = "flex";
			tabConfig.classList.remove("tabone");
			contentConfig.style.display = "none";
			tabImages.classList.remove("tabone");
			contentImages.style.display = "none";
			tabNews.classList.remove("tabone");
			contentNews.style.display = "none";
		});
		
		tabConfig.addEventListener("click", () => {
			tabCalendar.classList.remove("tabone");
			contentCalendar.style.display = "none";
			tabConfig.classList.add("tabone");
			contentConfig.style.display = "flex";
			tabImages.classList.remove("tabone");
			contentImages.style.display = "none";
			tabNews.classList.remove("tabone");
			contentNews.style.display = "none";
		});
		
		tabImages.addEventListener("click", () => {
			tabCalendar.classList.remove("tabone");
			contentCalendar.style.display = "none";
			tabConfig.classList.remove("tabone");
			contentConfig.style.display = "none";
			tabImages.classList.add("tabone");
			contentImages.style.display = "flex";
			tabNews.classList.remove("tabone");
			contentNews.style.display = "none";
		});

		tabNews.addEventListener("click", () => {
			tabCalendar.classList.remove("tabone");
			contentCalendar.style.display = "none";
			tabConfig.classList.remove("tabone");
			contentConfig.style.display = "none";
			tabImages.classList.remove("tabone");
			contentImages.style.display = "none";
			tabNews.classList.add("tabone");
			contentNews.style.display = "flex";
		});
	}
}

