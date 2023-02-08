from flask import Flask, request
from flask_restful import Resource, Api
from configservice import ConfigService
from dataservice import DataService
from googleauthenticator import GoogleAuthenticator
from httpservice import HttpService
from httpimageservice import HttpImageService
from updatethread import UpdateThread
from config import Config
from calendarupdater import CalendarUpdater
from configupdater import ConfigUpdater
from imagesupdater import ImagesUpdater
from newsupdater import NewsUpdater
import signal

app = Flask(__name__)
api = Api(app)

# Data feeders for News and Calendar
api.add_resource(DataService, Config.NEWS_URL, Config.CALENDAR_URL)

# Configuration service
api.add_resource(ConfigService, Config.CONFIG_URL);

# Images service
api.add_resource(HttpImageService, Config.IMAGES_URL, Config.IMAGES_URL + '/<path:path>')

# Web server file service
api.add_resource(HttpService, '/', '/<path:path>')

# We authenticate on start to show the Google Authentication Web Page if not already logged in.
# This will save authentication token on disk for future uses. All authentications requests
# will then load the local credential files to use the available session.
GoogleAuthenticator().authenticate()

# Background updater thread
updateThread = UpdateThread([
	CalendarUpdater(Config.CACHE_PATH, Config.CALENDAR_FILE, Config.CALENDAR_MONTH_RANGE),
	ConfigUpdater(Config.CACHE_PATH, Config.CONFIG_FILE),
	ImagesUpdater(Config.CACHE_PATH+Config.IMAGES_DIR, Config.IMAGE_EXTENSIONS),
	NewsUpdater(Config.CACHE_PATH, Config.NEWS_FILE)
], 10)
signal.signal(signal.SIGTERM, updateThread.shutdown)
signal.signal(signal.SIGINT, updateThread.shutdown)
updateThread.start()

if __name__ == '__main__':
     app.run(port=Config.SERVER_PORT)