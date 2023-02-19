from environment import Environment
from gcsa.google_calendar import GoogleCalendar as GoogleCalendarAPI

class GoogleCalendar:

	def __init__(self, authenticator):
		self.authenticator = authenticator

	def getService(self):
		try:
			creds = self.authenticator.authenticate();
			return GoogleCalendarAPI(credentials=creds)
		except Exception as e:
			Environment.logger.error(e, "GoogleCalendar")
			raise
