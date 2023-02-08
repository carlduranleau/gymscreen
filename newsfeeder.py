import os
import pickle

class NewsFeeder:

	COLORS = { 'ColorValue.Teal': '#9ff0f4', 'ColorValue.Blue':'#b9ecf7', 'ColorValue.DarkBlue':'#a5c6ef', 'ColorValue.Gray':'#dee2e8', 'ColorValue.Purple':'#d7b5e5', 'ColorValue.Pink':'#fcc9f8', 'ColorValue.Brown':'#ddc1a6', 'ColorValue.Red':'#f79999', 'ColorValue.Orange':'#ffbd26', 'ColorValue.Yellow':'#f7eb85', 'ColorValue.Green':'#cff48d', 'ColorValue.White':'#ffffff' }

	def __init__(self, cache_path, filename):
		self._news_data = []
		self.cache_path = cache_path
		self.filename = filename

	def _load_from_disk(self):
		fullConfigPath = '{}/{}'.format(self.cache_path, self.filename)
		if os.path.exists(fullConfigPath):
			with open(fullConfigPath, "rb") as f:
				self._news_data = pickle.load(f)

	def _getColor(self, keep_color):
		return self.COLORS.get(str(keep_color), '#ffffff')

	def load(self):
		try:
			self._load_from_disk()
		except Exception as e:
			print(e)
			self._news_data = []

	def toJSON(self):
		json_news = ''

		for news in self._news_data:
			if json_news:
				json_news += ","
			else:
				json_news = ''
			json_news += '{{"id":"{}","title":"{}","content":"{}","color":"{}"}}'.format(news.id, news.title.replace('\n', '</br>').replace('  ', '&nbsp;&nbsp;'), news.text.replace('\n', '</br>').replace('  ', '&nbsp;&nbsp;'), self._getColor(news.color))

		return '{"news":[' + json_news + ']}'
