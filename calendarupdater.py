from gcsa.event  import Event
from datetime import datetime
from dateutil.relativedelta import relativedelta
from googlecalendar import GoogleCalendar
from googleauthenticator import GoogleAuthenticator
from updateprocess import UpdateProcess
from dataservice import DataService
import os
import pickle
import json
import types

class CalendarUpdater(UpdateProcess):
	
	def __init__(self, cache_path, filename, timerange):
		self.cache_path = cache_path
		self.filename = filename
		self.timerange = timerange
		self.calendarAPI = GoogleCalendar(GoogleAuthenticator())
		self.range_start = None
		self.range_end = None
		
	def update(self):
		self.range_start = datetime.now()
		self.range_end = datetime.now() + relativedelta(months=self.timerange)
		events = self.calendarAPI.getService().get_events(self.range_start, self.range_end)
		remote_events = []
		if events:
			for event in events:
				# print(json.dumps(event.__dict__, indent=4, sort_keys=True, default=str))
				if event:
					remote_events.append(event)
		self._persist_to_disk(remote_events)
	
	def _persist_to_disk(self, data):
		if os.path.exists(self.cache_path):
			with open('{}/{}'.format(self.cache_path, self.filename), 'wb') as f:
				pickle.dump(data, f)
		
	def getHealthData(self):
		DataService.calendarfeeder.load()
		return '{{"daterange":{{"start":"{}","end":"{}","range":{}}},"lastdata":{}}}'.format(self.range_start, self.range_end, self.timerange, DataService.calendarfeeder.toJSON())
	
	def getLastDateRange(self):
		return [self.range_start, self.range_end, self.timerange]