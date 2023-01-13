from flask_restful import Resource
from filecredential import FileCredential
from calendarfeeder import CalendarFeeder
from datafeeder import DataFeeder
from flask import make_response

class RestService(Resource):

	newsfeeder = DataFeeder(FileCredential('token'))
	calendarfeeder = CalendarFeeder(FileCredential('token'))

	def get(self, path=None):
		feeder = None
		if path: #/feed gets news feed while /feed/calendar gets calendar feed
			feeder = self.calendarfeeder
		else:
			feeder = self.newsfeeder
		feeder.load()
		response = make_response(feeder.toJSON())
		response.headers['content-type'] = 'application/json'
		response.headers['Access-Control-Allow-Origin'] = '*'
		return response
