from googleapiclient.discovery import build

class GoogleDrive:

	def __init__(self, authenticator):
		self.authenticator = authenticator

	def getService(self):
		try:
			creds = self.authenticator.authenticate();
			return build('drive', 'v3', credentials=creds)
		except:
			print('ERROR: Cannot connect to file feed')
			raise
