class UpdateProcess:
	running = False
	error = None
	def run(self):
		if self.isRunning():
			return
		try:
			self.setRunning()
			self.update()
			self.setStopped()
		except Exception as e:
			self.setError(e)
			print(e)
	def update(self):
		pass
	def isRunning(self):
		return self.running
	def setRunning(self):
		self.error = None
		self.running = True
	def setStopped(self):
		self.running = False
	def hasError(self):
		return self.error() is None
	def setError(self, message):
		self.error = message
		self.setStopped()
	def getError(self, message):
		return self.error