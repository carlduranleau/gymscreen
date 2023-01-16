from gcsa.event  import Event

from datetime import datetime
from dateutil.relativedelta import relativedelta
from google.oauth2.credentials import Credentials
from googlecalendar import GoogleCalendar
from googleauthenticator import GoogleAuthenticator
import json

class CalendarFeeder:

	def __init__(self):
		self._events_data = []
		self._loading_error_count = 0
		self.calendar = None
		self.range_start = None
		self.range_end = None
		self.calendarAPI = GoogleCalendar(GoogleAuthenticator())

	def _reset(self):
		self._events_data = []
		self._loading_error_count = 0

	def load(self):
		self._reset()
		self.range_start = datetime.now() - relativedelta(months=3)
		self.range_end = datetime.now() + relativedelta(months=3)
		events = self.calendarAPI.getService().get_events(self.range_start, self.range_end)
		
		for event in events:
			# print(json.dumps(event.__dict__, indent=4, sort_keys=True, default=str))
			if event:
				self._events_data.append(event)

	def getRangeCount(self):
		return len(self._events_data)

	def getEvents(self):
		return self._events_data

	def _getColor(self, event_color):
		return self.COLORS.get(str(event_color), '#ffffff')

	def toJSON(self):
		json_events = ''

		for event in self._events_data:
			if json_events:
				json_events += ","
			else:
				json_events = ''
			json_events += json.dumps(event.__dict__, indent=4, sort_keys=True, default=str)

		return '{{"count":{},"range_start":"{}","range_end":"{}","events":[{}]}}'.format(len(self._events_data), self.range_start, self.range_end, json_events)
