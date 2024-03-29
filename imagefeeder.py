from environment import Environment
import os

class ImageFeeder:

	def __init__(self, cache_path, image_dir, file_extensions):
		self.files = []
		self.cache_path = cache_path + image_dir
		self.image_dir = image_dir
		self.file_extensions = file_extensions

	def load(self):
		try:
			self.files = self._getFiles()
		except Exception as e:
			Environment.logger.error(e, "ImageFeeder")
			self.files = []

	def _getFiles(self):
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

	def toJSON(self):
		json_output = ''
		for file in self.files:
			if json_output:
				json_output += ","
			else:
				json_output = ''
			json_output += '{{"name":"{}","url":"/{}/{}"}}'.format(file, self.image_dir, file)
		return '{"files":[' + json_output + ']}'
