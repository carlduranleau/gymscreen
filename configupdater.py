import re
import os
from updateprocess import UpdateProcess
from configservice import ConfigService
from googledrive import GoogleDrive
from googleauthenticator import GoogleAuthenticator

class ConfigUpdater(UpdateProcess):
	
	def __init__(self, cache_path, filename):
		self.driveAPI = GoogleDrive(GoogleAuthenticator())
		self.cache_path = cache_path
		self.filename = filename
		
	def update(self):
		results = self.driveAPI.getService().files().list(fields="*",q="trashed=False and name='{}'".format(self.filename)).execute()
		drivefiles = results.get('files', [])
		if drivefiles:
			self.download(drivefiles[0], self.cache_path)
	
	def download(self, filename, target):
		# print('Downloading {}'.format(filename.get('name')))
		content = self.driveAPI.getService().files().get_media(fileId=filename.get('id')).execute()
		with open('{}/{}'.format(target, filename.get('name')), 'wb') as f:
			f.write(content)
	
	def getHealthData(self):
		ConfigService.feeder.load()
		return '{{"lastdata":"{}"}}'.format(ConfigService.feeder.toText().replace("\n","\\n"))

