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
		start = datetime.now()
		end = datetime.now() + relativedelta(months=12)
		remote_events = []
		getMore = True
		while(getMore):
			self.range_start = start
			self.range_end = start + relativedelta(months=self.timerange)
			events = self.calendarAPI.getService().get_events(self.range_start, self.range_end)
			for event in events:
				remote_events.append(event)
			if self.range_end < end and len(remote_events) < 1:
				start = self.range_end
			else:
				getMore = False
		self._persist_to_disk(remote_events)
	
	def _persist_to_disk(self, data):
		if os.path.exists(self.cache_path):
			with open('{}/{}'.format(self.cache_path, self.filename), 'wb') as f:
				pickle.dump(data, f)
		
	def getHealthData(self):
		return '{{"url":"{}"}}'.format('/calendarfeed')
	
	def getLastDateRange(self):
		return [self.range_start, self.range_end, self.timerange]