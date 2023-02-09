from flask import Flask, request
from flask_restful import Resource, Api
from configservice import ConfigService
from dataservice import DataService
from googleauthenticator import GoogleAuthenticator
from httpservice import HttpService
from httpimageservice import HttpImageService
from healthservice import HealthService
from updatethread import UpdateThread
from config import Config
from calendarupdater import CalendarUpdater
from configupdater import ConfigUpdater
from imagesupdater import ImagesUpdater
from newsupdater import NewsUpdater
from environment import Environment
import signal
import os

# Validate external drive for data caching. If external storage isn't available,
# a local storage path will be defined to prevent the system from working on a
# faulty USB storage.
if not os.path.exists(Config.CACHE_PATH):
	print("WARNING: '{}' isn't available.".format(Config.CACHE_PATH))
	Config.CACHE_PATH = os.path.expanduser('~') + '/cache/'
	if not os.path.exists(Config.CACHE_PATH):
		os.mkdir(Config.CACHE_PATH)
	print("Data will be stored in {}.".format(Config.CACHE_PATH))

app = Flask(__name__)
api = Api(app)

# Data feeders for News and Calendar
api.add_resource(DataService, Config.NEWS_URL, Config.CALENDAR_URL)

# Configuration service
api.add_resource(ConfigService, Config.CONFIG_URL);

# Images service
api.add_resource(HttpImageService, Config.IMAGES_URL, Config.IMAGES_URL + '/<path:path>')

# Console and Health service
api.add_resource(HealthService, Config.HEALTH_URL, Config.HEALTH_URL + '/<path:path>')

# Web server file service
api.add_resource(HttpService, '/', '/<path:path>')

# We authenticate on start to show the Google Authentication Web Page if not already logged in.
# This will save authentication token on disk for future uses. All authentications requests
# will then load the local credential files to use the available session.
GoogleAuthenticator().authenticate()

# Background updater thread
updaterThread = UpdateThread([
	CalendarUpdater(Config.CACHE_PATH, Config.CALENDAR_FILE, Config.CALENDAR_MONTH_RANGE),
	ConfigUpdater(Config.CACHE_PATH, Config.CONFIG_FILE),
	ImagesUpdater(Config.CACHE_PATH+Config.IMAGES_DIR, Config.IMAGE_EXTENSIONS),
	NewsUpdater(Config.CACHE_PATH, Config.NEWS_FILE)
], 10)
updaterThread.start()
signal.signal(signal.SIGTERM, updaterThread.shutdown)
signal.signal(signal.SIGINT, updaterThread.shutdown)
Environment.updaterThread = updaterThread

if __name__ == '__main__':
     app.run(port=Config.SERVER_PORT)