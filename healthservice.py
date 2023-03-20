from flask_restful import Resource
from healthfeeder import HealthFeeder
from flask import make_response,request

class HealthService(Resource):

	feeder = HealthFeeder()
	
	def get(self, path=None):
		self.feeder.load(path, request.headers.get('auth'))
		response = make_response(self.feeder.toJSON())
		response.headers['content-type'] = 'application/json'
		response.headers['Access-Control-Allow-Origin'] = '*'
		return response
