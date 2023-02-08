from gcsa.event  import Event
from datetime import datetime
from dateutil.relativedelta import relativedelta
from googlecalendar import GoogleCalendar
from googleauthenticator import GoogleAuthenticator
from updateprocess import UpdateProcess
import os
import pickle
import json

class CalendarUpdater(UpdateProcess):
	
	def __init__(self, cache_path, filename, timerange):
		self.cache_path = cache_path
		self.filename = filename
		self.timerange = timerange
		self.calendarAPI = GoogleCalendar(GoogleAuthenticator())
		
	def update(self):
		range_start = datetime.now()
		range_end = datetime.now() + relativedelta(months=self.timerange)
		events = self.calendarAPI.getService().get_events(range_start, range_end)
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
