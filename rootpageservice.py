from flask_restful import Resource
from flask import Flask, request, send_from_directory

class RootPageService(Resource):

	ROOT_HTTP_FOLDER = "html"

	def get(self):
		return send_from_directory(self.ROOT_HTTP_FOLDER, "index.html");
