from gcsa.event  import Event

from datetime import datetime
from dateutil.relativedelta import relativedelta
from google.oauth2.credentials import Credentials
from googlecalendar import GoogleCalendar
from googleauthenticator import GoogleAuthenticator
import json
import os
import pickle

class CalendarFeeder:
	
	CALENDAR_FILE_NAME = 'calendardata.json'
	SOURCE_DRIVE = '/media/pi/F93B-78A5/cache/'
	PERSIST_PATH = 'calendar'

	def __init__(self):
		self._events_data = []
		self._loading_error_count = 0
		self.calendar = None
		self.range_start = None
		self.range_end = None
		if os.path.exists(self.SOURCE_DRIVE + self.PERSIST_PATH):
			self.PERSIST_PATH = self.SOURCE_DRIVE + self.PERSIST_PATH
		print('Calendar cache folder: ' + self.PERSIST_PATH)
		self.calendarAPI = GoogleCalendar(GoogleAuthenticator())

	def _load_from_network(self):
		self.range_start = datetime.now() - relativedelta(months=3)
		self.range_end = datetime.now() + relativedelta(months=3)
		events = self.calendarAPI.getService().get_events(self.range_start, self.range_end)
		if events:
			self._events_data = []
			for event in events:
				# print(json.dumps(event.__dict__, indent=4, sort_keys=True, default=str))
				if event:
					self._events_data.append(event)

	def _load_from_disk(self):
		fullConfigPath = '{}/{}'.format(self.PERSIST_PATH, self.CALENDAR_FILE_NAME)
		calendardata = ''
		if os.path.exists(fullConfigPath):
			with open(fullConfigPath, "rb") as f:
				self._events_data = pickle.load(f)

	def _persist_to_disk(self):
		try:
			if os.path.exists(self.PERSIST_PATH):
				with open('{}/{}'.format(self.PERSIST_PATH, self.CALENDAR_FILE_NAME), 'wb') as f:
					pickle.dump(self._events_data, f)
		except Exception as e:
			print('Unable to persist data')
			print(e)

	def load(self):
		events = None
		try:
			print('Disabled load data from network.')
			#self._load_from_network()
			#self._persist_to_disk()
		except Exception as e:
			print('Unable to load data from network.')
			print(e)
		if not events:
			try:
				self._load_from_disk()
			except Exception as e:
				print('Unable to load data from disk.')
				print(e)

	def toJSON(self):
		json_events = ''

		for event in self._events_data:
			if json_events:
				json_events += ","
			else:
				json_events = ''
			json_events += json.dumps(event.__dict__, indent=4, sort_keys=True, default=str)

		return '{{"count":{},"range_start":"{}","range_end":"{}","events":[{}]}}'.format(len(self._events_data), self.range_start, self.range_end, json_events)

