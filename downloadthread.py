import os
import time
import threading
from googledrive import GoogleDrive
from googleauthenticator import GoogleAuthenticator

class DownloadThread(threading.Thread):


	def __init__(self, cache_path, file_extensions, update_delay):
		threading.Thread.__init__(self)
		self.cache_path = cache_path
		self.file_extensions = file_extensions
		self.update_delay = update_delay
		self.driveAPI = GoogleDrive(GoogleAuthenticator())
		self.running = True;

	def run(self):
		print('Download thread started')
		while(self.running):
			self._sleep_thread(self.update_delay)
			self._updateFiles()
		print('Download thread stopped')

	def shutdown(self):
		self.running = False

	def _sleep_thread(self, delay_in_secs):
		i = 0
		while self.running and i < delay_in_secs:
			i += 1;
			time.sleep(1)

	def _getRemoteFilenames(self):
		# Call the Drive v3 API
		results = self.driveAPI.getService().files().list(fields="*",q="trashed=False").execute()
		drivefiles = results.get('files', [])
		files = dict()
		for file in drivefiles:
			if file.get('fileExtension') is not None and file.get('fileExtension').lower() in self.file_extensions:
				files[file.get('name')] = file.get('id')
		return files

	def _getLocalFilenames(self):
		files = []
		for root, dirs, files in os.walk(self.cache_path):  
			for filename in files:
				if self._isValidFile(filename):
					files.append(filename)
		return files

	def _isValidFile(self, filename):
		ext_index = filename.find(".")
		if ext_index > -1:
			extension = filename[ext_index:]
			if extension and extension.lower() in self.file_extensions:
				return True
		return False

	def _updateFiles(self):
		if not self.running:
			return None
		remote_files = self._getRemoteFilenames()
		local_files = self._getLocalFilenames()
		print('Local files count:{}'.format(len(local_files)))
		print('Remote files count:{}'.format(len(remote_files.keys())))
		
		# Remove local file not found remotely
		for file in local_files:
			if not file in remote_files.keys():
				print('Removing {}'.format(file))
				os.remove('{}/{}'.format(self.cache_path, file))
		
		# Download remote file not found locally
		for file in remote_files.keys():
			if not file in local_files:
				self._download(file, remote_files[file], self.cache_path)

	def _download(self, filename, file_id, target):
		try:
			print('Downloading {}'.format(filename))
			content = self.driveAPI.getService().files().get_media(fileId=file_id).execute()
			with open('{}/{}'.format(target, filename), 'wb') as f:
				f.write(content)
			return True
		except:
			print('Unable to download {}'.format(filename))
		return False
