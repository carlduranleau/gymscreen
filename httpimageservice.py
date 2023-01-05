from flask_restful import Resource
from flask import Flask, request, send_from_directory

class HttpImageService(Resource):

	ROOT_HTTP_FOLDER = "images"

	def get(self, path):
		response = send_from_directory(self.ROOT_HTTP_FOLDER, path)
		response.headers['Access-Control-Allow-Origin'] = '*'
		return response
