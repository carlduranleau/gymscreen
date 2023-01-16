from filecredential import FileCredential
import gkeepapi
import json

class NewsFeeder:

	COLORS = { 'ColorValue.Teal': '#9ff0f4', 'ColorValue.Blue':'#b9ecf7', 'ColorValue.DarkBlue':'#a5c6ef', 'ColorValue.Gray':'#dee2e8', 'ColorValue.Purple':'#d7b5e5', 'ColorValue.Pink':'#fcc9f8', 'ColorValue.Brown':'#ddc1a6', 'ColorValue.Red':'#f79999', 'ColorValue.Orange':'#ffbd26', 'ColorValue.Yellow':'#f7eb85', 'ColorValue.Green':'#cff48d', 'ColorValue.White':'#ffffff' }

	def __init__(self):
		self.credential = FileCredential('token')
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
			print('ERROR: Cannot connect to news data feed')
			raise

	def _reset(self):
		self._news_data = []
		self._loading_error_count = 0

	def load(self):
		self._authenticate()
		gnotes = self.keep.find()
		self._reset()
		remote_news = []
		for gnote in gnotes:
			# print(json.dumps(gnote.__dict__, indent=4, sort_keys=True, default=str))
			# print(json.dumps(gnote))
			# This line may generate errors on unknown characters.
			# Will occur on 'lists', so it ensures we only get notes.
			validator = '{}: {}'.format(gnote.title, gnote.text)
			if gnote.text and gnote.title:
				remote_news.append(gnote)
				
		# News cache is updated at the end to prevent a parsing error
		# to invalidate the current news cache content.
		self._news_data = remote_news

	def getErrorcount(self):
		return self._loading_error_count

	def hasError(self):
		return self._loading_error_count > 0

	def getNewsCount(self):
		return len(self._news_data)

	def getNews(self):
		return self._news_data

	def _getColor(self, keep_color):
		return self.COLORS.get(str(keep_color), '#ffffff')

	def toJSON(self):
		json_news = ''

		for news in self._news_data:
			if json_news:
				json_news += ","
			else:
				json_news = ''
			json_news += '{{"id":"{}","title":"{}","content":"{}","color":"{}"}}'.format(news.id, news.title.replace('\n', '</br>').replace('  ', '&nbsp;&nbsp;'), news.text.replace('\n', '</br>').replace('  ', '&nbsp;&nbsp;'), self._getColor(news.color))

		return '{"news":[' + json_news + ']}'
