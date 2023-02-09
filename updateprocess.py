from datetime import datetime

class UpdateProcess:
	lastrun = None
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
		except Exception as e:
			self.setError(e)
			print(e)
	def update(self):
		pass
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