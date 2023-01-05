import os
import time
import threading

class DownloadThread(threading.Thread):

	WAIT_DELAY_IN_SECS = 10
	PERSIST_PATH = 'images'

	def __init__(self, google_drive):
		threading.Thread.__init__(self)
		self.pending_files = []
		self.downloaded_files = []
		self.complete = True
		self.google_drive = google_drive
		self.running = True;

	def run(self):
		while(self.running):
			if not self.complete and len(self.pending_files) > 0:
				processed = []
				for i in range(len(self.pending_files)):
					file = self.pending_files[i]
					if self.google_drive.download(file, self.PERSIST_PATH):
						processed.append(file)
					else:
						print('ERROR: Unable to download {}'.format(file.get('name')))
				for file in processed:
					self.pending_files.remove(file)
				self.complete = len(self.pending_files) == 0
			self._update_downloaded_files()
			self._sleep_thread(self.WAIT_DELAY_IN_SECS)
		print('Download thread stopped')

	def _sleep_thread(self, delay_in_secs):
		i = 0
		while self.running and i < delay_in_secs:
			i += 1;
			time.sleep(1)

	def shutdown(self):
		self.running = False

	def _update_downloaded_files(self):
		self.downloaded_files = []
		for root, dirs, files in os.walk(self.PERSIST_PATH):  
			for filename in files:
				self.downloaded_files.append(filename)

	def is_available(self, filename):
		return filename in self.downloaded_files

	def updateFiles(self, new_files):
		self._update_downloaded_files()
		self.pending_files = []
		for file in self.downloaded_files:
			if not file in new_files:
				os.remove('{}/{}'.format(self.PERSIST_PATH, file))
				self.downloaded_files.remove(file)
		for file in new_files:
			if not file in self.downloaded_files:
				self.pending_files.append(file)
		self.complete = len(self.pending_files) == 0
