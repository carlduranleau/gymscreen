import gkeepapi

class DataFeeder:

	COLORS = { 'ColorValue.Teal': '#9ff0f4', 'ColorValue.Blue':'#b9ecf7', 'ColorValue.DarkBlue':'#a5c6ef', 'ColorValue.Gray':'#dee2e8', 'ColorValue.Purple':'#d7b5e5', 'ColorValue.Pink':'#fcc9f8', 'ColorValue.Brown':'#ddc1a6', 'ColorValue.Red':'#f79999', 'ColorValue.Orange':'#ffbd26', 'ColorValue.Yellow':'#f7eb85', 'ColorValue.Green':'#cff48d', 'ColorValue.White':'#ffffff' }

	def __init__(self, credential):
		self.credential = credential
		self._global_news_data = []
		self._news_data = []
		self._loading_error_count = 0
		self.keep = None
		self._auth_token = None

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
		except:
			print('ERROR: Cannot connect to data feed')
			raise

	def _reset(self):
		self._global_news_data = []
		self._news_data = []
		self._loading_error_count = 0

	def load(self):
		self._authenticate()
		self._reset()

		#gnotes = self.keep.all()
		gnotes = self.keep.find()

		for gnote in gnotes:
			# This line may generate errors on unknown characters.
			# Will occur on 'lists', so it ensures we only get notes.
			validator = '{}: {}'.format(gnote.title, gnote.text)
			if gnote.text and gnote.title:
				if gnote.pinned:
					self._global_news_data.append(gnote)
				else:
					self._news_data.append(gnote)

	def getErrorcount(self):
		return self._loading_error_count

	def hasError(self):
		return self._loading_error_count > 0

	def getGlobalNewsCount(self):
		return len(self._global_news_data)

	def getCategorizedNewsCount(self):
		return len(self._news_data)

	def getTotalNewsCount(self):
		return self.getGlobalNewsCount() + self.getCategorizedNewsCount()

	def getGlobalNews(self):
		return self._global_news_data

	def getCategorizedNews(self):
		return self._news_data

	def _getColor(self, keep_color):
		return self.COLORS.get(str(keep_color), '#ffffff')

	def toJSON(self):
		json_global_news = ''
		json_news = ''

		for news in self._global_news_data:
			if json_global_news:
				json_global_news += ","
			else:
				json_global_news = ''
			json_global_news += '{{"id":"{}","title":"{}","content":"{}","color":"{}"}}'.format(news.id, news.title.replace('\n', '</br>').replace('  ', '&nbsp;&nbsp;'), news.text.replace('\n', '</br>').replace('  ', '&nbsp;&nbsp;'), self._getColor(news.color))

		for news in self._news_data:
			if json_news:
				json_news += ","
			else:
				json_news = ''
			json_news += '{{"id":"{}","title":"{}","content":"{}","color":"{}"}}'.format(news.id, news.title.replace('\n', '</br>').replace('  ', '&nbsp;&nbsp;'), news.text.replace('\n', '</br>').replace('  ', '&nbsp;&nbsp;'), self._getColor(news.color))

		return '{"global_news":[' + json_global_news + '],"news":[' + json_news + ']}'
