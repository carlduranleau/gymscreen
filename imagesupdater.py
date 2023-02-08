import os
from updateprocess import UpdateProcess
from googledrive import GoogleDrive
from googleauthenticator import GoogleAuthenticator

class ImagesUpdater(UpdateProcess):
	
	def __init__(self, cache_path, file_extensions):
		self.cache_path = cache_path
		self.file_extensions = file_extensions
		self.driveAPI = GoogleDrive(GoogleAuthenticator())
	
	def update(self):
		self._updateFiles()
	
	# Update local cache with remote files
	def _updateFiles(self):
		# print('Updating pictures cache...')
		# Get number of local and remote files
		remote_files = self._getRemoteFilenames()
		local_files = self._getLocalFilenames()
		
		# Stats counters
		removed = 0
		added = 0
		error = 0
		
		# print('Cached elements: {}'.format(len(local_files)))
		# print('Remote elements: {}'.format(len(remote_files.keys())))
		
		# Remove local file not found remotely
		for file in local_files:
			if not file in remote_files.keys():
				# print('Removing {}'.format(file))
				os.remove('{}/{}'.format(self.cache_path, file))
				removed = removed + 1
		
		# Download remote file not found locally
		for file in remote_files.keys():
			if not file in local_files:
				if self._download(file, remote_files[file], self.cache_path):
					added = added + 1
				else:
					error = error + 1
		
		if (removed + added + error) == 0:
			print('No update needed.')
		else:
			if error > 0:
				print('{} update error(s)'.format(error))
			if added > 0:
				print('{} element(s) added'.format(added))
			if removed > 0:
				print('{} element(s) removed'.format(removed))
	
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
	
	# Validate file extension
	def _isValidFile(self, filename):
		ext_index = filename.find(".")
		if ext_index > -1:
			extension = filename[ext_index:]
			if extension and extension.lower() in self.file_extensions:
				return True
		return False
	
	# Retrieve remote files information
	def _getRemoteFilenames(self):
		# Call the Drive v3 API
		results = self.driveAPI.getService().files().list(fields="*",q="trashed=False").execute()
		drivefiles = results.get('files', [])
		files = dict()
		for file in drivefiles:
			if file.get('fileExtension') is not None and file.get('fileExtension').lower() in self.file_extensions:
				files[file.get('name')] = file.get('id')
		return files
	
	# Retrieve local/cached file names
	def _getLocalFilenames(self):
		files = []
		for root, dirs, files in os.walk(self.cache_path):  
			for filename in files:
				if self._isValidFile(filename):
					files.append(filename)
		return files
