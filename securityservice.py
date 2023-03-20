from environment import Environment
from flask_restful import Resource
from securityfeeder import SecurityFeeder
from flask import make_response
from config import Config

class SecurityService(Resource):

	if Environment.security is None:
		Environment.security = SecurityFeeder(Config.CACHE_PATH)

	def get(self, path=None):
		if path is None:
			response = make_response(Environment.security.logout())
		else:
			response = make_response(Environment.security.login(path))
		response.headers['content-type'] = 'text/plain'
		response.headers['Access-Control-Allow-Origin'] = '*'
		return response
