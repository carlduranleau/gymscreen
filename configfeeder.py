from __future__ import print_function
import pickle
import os.path
from googleapiclient.discovery import build
import re
import os
from googledrive import GoogleDrive

class ConfigFeeder(GoogleDrive):

	CONFIG_FILE_NAME = 'config.properties'
	PERSIST_PATH = 'config'

	def __init__(self, credential_file):
		GoogleDrive.__init__(self, credential_file)
		self.textContent=''

	def _load_last_configuration(self):
		fullConfigPath = '{}/{}'.format(self.PERSIST_PATH, self.CONFIG_FILE_NAME)
		if os.path.exists(fullConfigPath):
			f = open(fullConfigPath, "r")
			self.textContent = f.read()
			f.close()

	def load(self):
		self.authenticate()

		try:
			# Call the Drive v3 API
			results = self.service.files().list(fields="*",q="trashed=False and name='{}'".format(self.CONFIG_FILE_NAME)).execute()
			drivefiles = results.get('files', [])
			if drivefiles:
				self.download(drivefiles[0], self.PERSIST_PATH)
		except Exception as e:
			print('Cannot download configuration. Loading last valid configuration.')
			print(e)
		self._load_last_configuration()

	def download(self, filename, target):
		try:
			print('Downloading {}'.format(filename.get('name')))
			content = self.service.files().get_media(fileId=filename.get('id')).execute()
			with open('{}/{}'.format(target, filename.get('name')), 'wb') as f:
				f.write(content)
			return True
		except Exception as e:
			print('Unable to download {}'.format(filename.get('name')))
			print(e)
		return False

	def toText(self):
		return re.sub(r'(#.*\n)', '', self.textContent)

