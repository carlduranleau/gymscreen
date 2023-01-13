from gcsa.google_calendar import GoogleCalendar as GoogleCalendarAPI

class GoogleCalendar:

	def __init__(self, authenticator):
		self.authenticator = authenticator

	def getService(self):
		try:
			creds = self.authenticator.authenticate();
			return GoogleCalendarAPI(credentials=creds)
		except:
			print('ERROR: Cannot connect to file feed')
			raise
