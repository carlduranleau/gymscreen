from environment import Environment
from config import Config
from commandprocessor import CommandProcessor
from flask import abort
import json
import types
import time
import uuid
import bcrypt
import os

class SecurityFeeder:
	
	def __init__(self, cache_path):
		self.sessiontoken=''
		self.sessiontime=0
		self.token=''
		self.cache_path = cache_path
		
	def login(self, p):
		self.validatePassword(p)
		self.sessiontoken = uuid.uuid4().hex
		self.sessiontime = int(time.time()) + Config.SESSION_TTL
		return '{{"status":"OK","token":"{}"}}'.format(self.sessiontoken)
	
	def logout(self):
		self.sessiontoken = None
		self.sessiontime = None
		return '{"status":"OK"}'
		
	def validatePassword(self, p):
		self.loadToken()
		if self.token is None or not bcrypt.hashpw(p.encode('utf-8'), self.token) == self.token:
			abort(401)
	
	def validateSession(self, token):
		if self.sessiontoken is None or self.sessiontime < int(time.time() or not self.sessiontoken == token):
			abort(401)
	
	def loadToken(self):
		authFilePath = '{}/{}'.format(self.cache_path, 'token')
		if not os.path.exists(authFilePath):
			print("Unable to load token. Please set a password.")
			abort(401)
		with open(authFilePath, 'rb') as f:
			self.token = f.read()
	
