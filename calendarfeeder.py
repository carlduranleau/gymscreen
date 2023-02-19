from environment import Environment
from gcsa.event  import Event
import json
import os
import pickle

class CalendarFeeder:

	def __init__(self, cache_path, filename):
		self._events_data = []
		self.cache_path = cache_path
		self.filename = filename

	def _load_from_disk(self):
		fullConfigPath = '{}/{}'.format(self.cache_path, self.filename)
		calendardata = ''
		if os.path.exists(fullConfigPath):
			with open(fullConfigPath, "rb") as f:
				self._events_data = pickle.load(f)

	def load(self):
		try:
			self._load_from_disk()
		except Exception as e:
			Environment.logger.error(e, "CalendarFeeder")
			self._events_data = []

	def toJSON(self):
		json_events = ''
		for event in self._events_data:
			if json_events:
				json_events += ","
			else:
				json_events = ''
			json_events += json.dumps(event.__dict__, indent=4, sort_keys=True, default=str)
		return '{{"count":{},"events":[{}]}}'.format(len(self._events_data), json_events)

