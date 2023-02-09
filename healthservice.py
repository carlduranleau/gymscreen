from flask_restful import Resource
from flask import Flask, request, send_from_directory
from config import Config
from healthfeeder import HealthFeeder
from flask import make_response

class HealthService(Resource):

	feeder = HealthFeeder()
	
	def get(self, command=None):
		self.feeder.load(command)
		response = make_response(self.feeder.toJSON())
		response.headers['content-type'] = 'application/json'
		response.headers['Access-Control-Allow-Origin'] = '*'
		return response
