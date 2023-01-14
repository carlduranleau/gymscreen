from flask import Flask, request
from flask_restful import Resource, Api
from configservice import ConfigService
from fileservice import FileService
from dataservice import DataService
from googleauthenticator import GoogleAuthenticator
from httpservice import HttpService
from httpimageservice import HttpImageService

app = Flask(__name__)
api = Api(app)

api.add_resource(DataService, '/feed', '/calendarfeed')
api.add_resource(FileService, '/files')
api.add_resource(ConfigService, '/config');
api.add_resource(HttpService, '/', '/<path:path>')
api.add_resource(HttpImageService, '/images/<path:path>')

# We authenticate on start to show the Google Authentication Web Page if not already logged in.
# This will save authentication token on disk for future uses. All authentications requests
# will then load the local credential files to use the available session.
GoogleAuthenticator().authenticate()

if __name__ == '__main__':
     app.run(port='5002')
