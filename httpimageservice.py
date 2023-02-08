from flask_restful import Resource
from flask import Flask, request, send_from_directory
from config import Config
from imagefeeder import ImageFeeder
from flask import make_response

class HttpImageService(Resource):

	feeder = ImageFeeder(Config.CACHE_PATH, Config.IMAGES_DIR, Config.IMAGE_EXTENSIONS)
	def get(self, path=None):
		response = None
		if path:
			response = send_from_directory(Config.CACHE_PATH + Config.IMAGES_DIR, path)
		else:
			self.feeder.load()
			response = make_response(self.feeder.toJSON())
			response.headers['content-type'] = 'application/json'
		response.headers['Access-Control-Allow-Origin'] = '*'
		return response
