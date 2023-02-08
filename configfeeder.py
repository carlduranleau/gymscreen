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
			print(e)
			self.textContent = ''

	def toText(self):
		return re.sub(r'(#.*\n)', '', self.textContent)

