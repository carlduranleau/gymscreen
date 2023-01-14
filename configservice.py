from flask_restful import Resource
from configfeeder import ConfigFeeder
from flask import make_response

class ConfigService(Resource):

	feeder = ConfigFeeder()

	def get(self):
		self.feeder.load()
		response = make_response(self.feeder.toText())
		response.headers['content-type'] = 'text/plain'
		response.headers['Access-Control-Allow-Origin'] = '*'
		return response
