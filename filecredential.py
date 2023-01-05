from credential import Credential

class FileCredential(Credential):

	def __init__(self, filename):
		self.filename = filename
		self.username = None
		self.password = None
		self._loadFile()

	def _loadFile(self):
		credentialFile = open(self.filename)
		content = credentialFile.read()
		data = content.split(':')
		if len(data) < 2:
			self.username = content
		else:
			self.username = data[0]
			self.password = data[1]
		credentialFile.close()