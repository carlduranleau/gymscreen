from __future__ import print_function
import pickle
import os.path
from downloadthread import DownloadThread
from googledrive import GoogleDrive
from googleauthenticator import GoogleAuthenticator
import os
import signal
import json

class ImageFeeder:

	ALLOWED_EXTENSIONS = ['png', 'jpg']
	PERSIST_PATH = 'images'

	def __init__(self, credential_file):
		self.files = None
		self.results = None
		self.driveAPI = GoogleDrive(GoogleAuthenticator(credential_file))
		self.download_thread = DownloadThread(self)
		self.download_thread.start()
		signal.signal(signal.SIGTERM, self._service_shutdown)
		signal.signal(signal.SIGINT, self._service_shutdown)

	def _service_shutdown(self, signum, frame):
		print('Waiting for application thread to stop...')
		self.download_thread.shutdown()
		self.download_thread.join()
		os._exit(0)

	def load(self):
		# Call the Drive v3 API
		self.results = self.driveAPI.getService().files().list(fields="*",q="trashed=False").execute()
		drivefiles = self.results.get('files', [])
		filenames = []
		self.files = dict()
		for file in drivefiles:
			if file.get('fileExtension') is not None and file.get('fileExtension').lower() in self.ALLOWED_EXTENSIONS:
				self.files[file.get('name')] = file.get('id')
				filenames.append(file.get('name'))
		self.download_thread.updateFiles(filenames)

	def download(self, filename, target):
		if filename in self.files:
			try:
				print('Downloading {}'.format(filename))
				content = self.driveAPI.getService().files().get_media(fileId=self.files[filename]).execute()
				with open('{}/{}'.format(target, filename), 'wb') as f:
					f.write(content)
				return True
			except:
				print('Unable to download {}'.format(filename))
		return False

	def toJSON(self):
		json_output = ''
		if self.results:
			for file in self.files:
				if self.download_thread.is_available(file):
					if json_output:
						json_output += ","
					else:
						json_output = ''
					json_output += '{{"name":"{}","url":"/{}/{}"}}'.format(file, self.PERSIST_PATH, file)
		return '{"files":[' + json_output + ']}'

