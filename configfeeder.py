from environment import Environment
import re
import os

class ConfigFeeder:

	def __init__(self, cache_path, filename):
		self.textContent=''
		self.cache_path = cache_path
		self.filename = filename

	def _load_from_disk(self):
		fullConfigPath = '{}/{}'.format(self.cache_path, self.filename)
		self.textContent=''
		if os.path.exists(fullConfigPath):
			with open(fullConfigPath, "r") as f:
				self.textContent = f.read()

	def load(self):
		try:
			self._load_from_disk()
		except Exception as e:
			Environment.logger.error(e, "ConfigFeeder")
			self.textContent = ''

	def toText(self):
		return re.sub(r'(#.*\n)', '', self.textContent)

	def toJSON(self):
		configjson = '{'
		first = True
		# Remove comment lines
		content = re.sub(r'(#.*\n)', '', self.textContent)

		# Convert properties to JSON attributes
		for line in content.split('\n'):
			if '=' in line:
				if not first:
					configjson = configjson + ','
				keyvalue = line.split('=')
				configjson = configjson + '"{}":"{}"'.format(keyvalue[0], self.applyOverrides(keyvalue))
				first = False
		configjson = configjson + '}'
		return configjson

	def applyOverrides(self, keyvalue):
		if keyvalue[0].upper() == "MAINTENANCEMODE" and Environment.maintenanceMode:
			return Environment.maintenanceMode
		return keyvalue[1]