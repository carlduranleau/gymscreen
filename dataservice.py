from flask_restful import Resource
from calendarfeeder import CalendarFeeder
from newsfeeder import NewsFeeder
from flask import make_response

class DataService(Resource):

	newsfeeder = NewsFeeder()
	calendarfeeder = CalendarFeeder()

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
