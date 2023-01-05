from flask_restful import Resource
from filecredential import FileCredential
from imagefeeder import ImageFeeder
from flask import make_response

class FileService(Resource):

	feeder = ImageFeeder('credentials.json')

	def get(self):
		self.feeder.load()
		response = make_response(self.feeder.toJSON())
		response.headers['content-type'] = 'application/json'
		response.headers['Access-Control-Allow-Origin'] = '*'
		return response
