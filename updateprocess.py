from environment import Environment
from datetime import datetime

class UpdateProcess:
	lastrun = None
	lastexecutiontime = None
	running = False
	error = None
	def run(self):
		if self.isRunning():
			return
		try:
			self.lastrun = datetime.now()
			self.setRunning()
			self.update()
			self.setStopped()
			self.lastexecutiontime = (datetime.now() - self.lastrun).total_seconds() * 1000
		except Exception as e:
			self.setError(e)
			Environment.logger.error(e, self.__class__.__name__)
	def update(self):
		pass
	def getHealth(self):
		return '{{"name":"{}","haserror":"{}","lasterror":"{}","lastexecution":"{}","lastexecutiontime":"{}","customdata":{}}}'.format(self.__class__.__name__,self.hasError(),self.getError(),self.getLastRunTime().strftime("%m/%d/%Y, %H:%M:%S"),self.getLastExecutionTime(),self.getHealthData())
	def getHealthData(self):
		return '{}'
	def isRunning(self):
		return self.running
	def setRunning(self):
		self.error = None
		self.running = True
	def setStopped(self):
		self.running = False
	def hasError(self):
		return not self.error is None
	def setError(self, message):
		self.error = message
		self.setStopped()
	def getError(self):
		return self.error
	def getLastRunTime(self):
		return self.lastrun
	def getLastExecutionTime(self):
		return self.lastexecutiontime