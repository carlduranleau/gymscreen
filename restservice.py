from flask_restful import Resource
from filecredential import FileCredential
from datafeeder import DataFeeder
from flask import make_response

class RestService(Resource):

	feeder = DataFeeder(FileCredential('token'))

	def get(self):
		self.feeder.load()
		response = make_response(self.feeder.toJSON())
		response.headers['content-type'] = 'application/json'
		response.headers['Access-Control-Allow-Origin'] = '*'
		return response
