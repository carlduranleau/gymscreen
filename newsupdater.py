from updateprocess import UpdateProcess
from filecredential import FileCredential
from dataservice import DataService
from environment import Environment
import gkeepapi
import os
import pickle

class NewsUpdater(UpdateProcess):
	
	def __init__(self, cache_path, filename):
		self.cache_path = cache_path
		self.filename = filename
		self.credential = FileCredential('token')
		self.keep = None
		self._auth_token = None
		self._news_data = []
	
	def update(self):
		self._authenticate()
		gnotes = self.keep.find()
		remote_news = []
		for gnote in gnotes:
			# print(json.dumps(gnote.__dict__, indent=4, sort_keys=True, default=str))
			# print(json.dumps(gnote))
			# This line may generate errors on unknown characters.
			# Will occur on 'lists', so it ensures we only get notes.
			validator = '{}: {}'.format(gnote.title, gnote.text)
			if gnote.text and gnote.title:
				remote_news.append(gnote)
		self._persist_to_disk(remote_news)
	
	def _authenticate(self):
		try:
			if self._auth_token:
				self.keep.resume(self.credential.username, self._auth_token)
			else:
				self.keep = gkeepapi.Keep()
				success = self.keep.login(self.credential.username, self.credential.password)
				if not success:
					raise Exception()
				self._auth_token = self.keep.getMasterToken()
			if self.keep:
				self.keep.sync()
		except Exception as e:
			self._auth_token = None
			self.keep = None
			Environment.logger.error(e, "NewsUpdater")
			raise

	def getHealthData(self):
		DataService.newsfeeder.load()
		return '{{"lastdata":{}}}'.format(DataService.newsfeeder.toJSON())

	def _persist_to_disk(self, data):
		if os.path.exists(self.cache_path):
			with open('{}/{}'.format(self.cache_path, self.filename), 'wb') as f:
				pickle.dump(data, f)
