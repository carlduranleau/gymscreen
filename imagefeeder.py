from __future__ import print_function
from downloadthread import DownloadThread
import os
import signal
import json

class ImageFeeder:

	# Background update thread parameters
	ALLOWED_EXTENSIONS = ['png', 'jpg']
	WAIT_DELAY_IN_SECS = 10
	SOURCE_DRIVE = '/media/pi/F93B-78A5/cache/'
	PERSIST_PATH = 'images'

	def __init__(self):
		self.files = []
		if os.path.exists(self.SOURCE_DRIVE + self.PERSIST_PATH):
			self.PERSIST_PATH = self.SOURCE_DRIVE + self.PERSIST_PATH
		print('Images cache folder: ' + self.PERSIST_PATH)
		self.download_thread = DownloadThread(self.PERSIST_PATH, self.ALLOWED_EXTENSIONS, self.WAIT_DELAY_IN_SECS)
		self.download_thread.start()
		signal.signal(signal.SIGTERM, self._service_shutdown)
		signal.signal(signal.SIGINT, self._service_shutdown)

	def _service_shutdown(self, signum, frame):
		print('Waiting for application thread to stop...')
		self.download_thread.shutdown()
		self.download_thread.join()
		os._exit(0)

	def load(self):
		self.files = self._getFiles()

	def _getFiles(self):
		files = []
		for root, dirs, files in os.walk(self.PERSIST_PATH):  
			for filename in files:
				if self._isValidFile(filename):
					files.append(filename)
		return files

	def _isValidFile(self, filename):
		ext_index = filename.find(".")
		if ext_index > -1:
			extension = filename[ext_index:]
			if extension and extension.lower() in self.ALLOWED_EXTENSIONS:
				return True
		return False

	def toJSON(self):
		json_output = ''
		for file in self.files:
			if json_output:
				json_output += ","
			else:
				json_output = ''
			json_output += '{{"name":"{}","url":"/{}/{}"}}'.format(file, 'images', file)
		return '{"files":[' + json_output + ']}'

