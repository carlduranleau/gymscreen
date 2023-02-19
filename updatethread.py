from updateprocess import UpdateProcess
from environment import Environment
import time
import threading

class UpdateThread(threading.Thread):
	
	def __init__(self, processes, update_delay):
		threading.Thread.__init__(self)
		self.processes = processes
		self.update_delay = update_delay
		self.running = False;
		self.processrunning = None
	
	def run(self):
		Environment.logger.log('Download thread started')
		self.running = True
		while(self.running):
			self._runProcesses()
			self._sleep_thread(self.update_delay)
		self._waitForProcess()
		Environment.logger.log('Download thread stopped')
		Environment.logger.update()
	
	def isRunning(self):
		return self.running
	
	def hasProcessRunning(self):
		return not self.processrunning is None
	
	# Stop thread
	def shutdown(self, signum=None, frame=None):
		print('Waiting for application thread to stop...')
		self.running = False
	
	def getProcesses(self):
		return self.processes
	
	def _waitForProcess(self):
		if self.processrunning is None:
			return
		print("Waiting for {} to finish...".format(self.processrunning.__class__.__name__))
		while not self.processrunning is None:
			time.sleep(1)
	
	# Sleep current thread
	def _sleep_thread(self, delay_in_secs):
		i = 0
		while self.running and i < delay_in_secs:
			i += 1;
			time.sleep(1)

	def _runProcesses(self):
		for process in self.processes:
			if isinstance(process, UpdateProcess):
				self.processrunning = process
				try:
					if not self.running:
						self.processrunning = None
						return
					if not process.isRunning():
						Environment.logger.log('Running {}...'.format(process.__class__.__name__))
						process.run()
						#Environment.logger.log('{} stopped'.format(process.__class__.__name__))
					else:
						Environment.logger.log('{} is already running.'.format(process.__class__.__name__))
				except Exception as e:
					Environment.logger.error(e, "UpdateThread")
			else:
				Environment.logger.log('WARNING: {} is not an UpdateProcess instance.'.format(process.__class__.__name__))
		self.processrunning = None
