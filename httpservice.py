from flask_restful import Resource
from flask import Flask, request, send_from_directory
from config import Config

class HttpService(Resource):

	ROOT_HTTP_FOLDER = "html"

	def get(self, path=None):
		if path:
			filepath = path
			if "." not in path:
				filepath = filepath + ".html"
		else:
			filepath = 'index.html'
		response = send_from_directory(self.ROOT_HTTP_FOLDER, filepath)
		response.headers['Access-Control-Allow-Origin'] = '*'
		return response
