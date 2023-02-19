from datetime import datetime

class Environment:
	starttime = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
	maintenanceMode = None
	logger = None
	updatethread = None
