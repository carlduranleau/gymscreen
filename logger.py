from updateprocess import UpdateProcess
from environment import Environment
from config import Config
from datetime import datetime
import time
import threading
import signal
import os

class Logger(threading.Thread):
	
	def __init__(self, cache_path, filename, update_delay):
		threading.Thread.__init__(self)
		self.cache_path = cache_path
		self.filename = filename
		self.pending_data = []
		self.update_delay = update_delay
		self.writing = False
	
	def run(self):
		self.log('Logger started ({}{})'.format(self.cache_path, self.filename))
		self.running = True
		while(self.running):
			self._sleep_thread(self.update_delay)
			self.update()
		self.log('Logger stopped')
	
	# Stop thread
	def shutdown(self, signum=None, frame=None):
		self.running = False
		
	def log(self, msg):
		while self.writing:
			print("Waiting...")
			time.sleep(1)
		data = '{}: {}'.format(datetime.now().strftime('%d/%m/%Y %H:%M:%S'), msg) 
		print(data)
		self.pending_data.append(data)
	
	def error(self, err, msg):
		if msg:
			self.log("ERROR: {}".format(msg))
		self.log(err)
	
	def update(self):
		self.writing = True
		with open('{}/{}'.format(self.cache_path, self.filename), 'a') as f:
			for data in self.pending_data:
				f.write(data + '\n')
			self.pending_data = []
		self.writing = False
	
	# Sleep current thread
	def _sleep_thread(self, delay_in_secs):
		i = 0
		while self.running and i < delay_in_secs:
			i += 1;
			time.sleep(1)
			
	def getLogFilename(self):
		return '{}/{}'.format(self.cache_path, self.filename)
