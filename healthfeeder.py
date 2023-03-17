from environment import Environment
from config import Config
from commandprocessor import CommandProcessor
import json
import types

class HealthFeeder:
	
	def __init__(self):
		self.healthdata = None
		self.commandprocessor = CommandProcessor()
		
	def load(self, command=None):
		self.healthdata = '{"status":"OK"}'
		try:
			if command:
				self.processCommand(command)
			else:
				self.getHealth()
		except Exception as e:
			self.healthdata = '{{"status":"ERROR","error":"{}"}}'.format(e)
	
	def processCommand(self, request):
		if request is None:
			return
		args = request.split('/')
		if len(args) < 2:
			return
		context = args[0]
		command = args[1]
		args.pop(0)
		args.pop(0)
		result = self.commandprocessor.execute(context, command, args)
		self.healthdata = '{{"result":"{}"}}'.format(result)
	
	def getHealth(self):
		self.healthdata = '{{{},{},{}}}'.format(self._getEnvironmentHealth(), self._getUpdatersHealth(), self._getConfig())

	def _getUpdatersHealth(self):
		if not Environment.updatethread:
			return ''
		updaters = Environment.updatethread.getProcesses()
		updatersData = '"updaterthread":{{"running":"{}","processcount":{}'.format(Environment.updatethread.isRunning(),len(updaters))
		
		if updaters:
			updatersData = updatersData + ',"processes":['
			first = True
			for updater in updaters:
				updaterData = updater.getHealth()
				if not first:
					updaterData = ',' + updaterData
				first = False
				updatersData = updatersData + updaterData
			updatersData = updatersData + ']'
		updatersData = updatersData + '}'
		return updatersData
	
	def _getEnvironmentHealth(self):
		return '"environment":{{"starttime":"{}"}}'.format(Environment.starttime)
	
	def _getLoggerHealth(self):
		pass
	
	def _getConfig(self):
		configData = '"config":{'
		first = True
		for k,v in Config.__dict__.items():
			if not '__' in k:
				if not first:
					configData = configData + ','
				configData = configData + '"{}":"{}"'.format(k,v)
				first = False
		configData = configData + '}'
		return configData
	
	def toJSON(self):
		return self.healthdata
		#json.dumps(self.healthdata, indent=4, sort_keys=True, default=str)
		# json_health = ''
		# for event in self._events_data:
		# 	if json_events:
		# 		json_events += ","
		# 	else:
		# 		json_events = ''
		# 	json_events += json.dumps(event.__dict__, indent=4, sort_keys=True, default=str)
		# return '{{"count":{},"events":[{}]}}'.format(len(self._events_data), json_events)
