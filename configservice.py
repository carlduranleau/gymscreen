from flask_restful import Resource
from configfeeder import ConfigFeeder
from flask import make_response
from config import Config

class ConfigService(Resource):

	feeder = ConfigFeeder(Config.CACHE_PATH, Config.CONFIG_FILE)

	def get(self):
		self.feeder.load()
		response = make_response(self.feeder.toJSON())
		response.headers['content-type'] = 'text/plain'
		response.headers['Access-Control-Allow-Origin'] = '*'
		return response
