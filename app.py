from flask import Flask, request
from flask_restful import Resource, Api
from configservice import ConfigService
from fileservice import FileService
from restservice import RestService
from imagefeeder import ImageFeeder
from httpservice import HttpService
from httpimageservice import HttpImageService

app = Flask(__name__)
api = Api(app)

api.add_resource(RestService, '/feed')
api.add_resource(FileService, '/files')
api.add_resource(ConfigService, '/config');
api.add_resource(HttpService, '/', '/<path:path>')
api.add_resource(HttpImageService, '/images/<path:path>')

ImageFeeder('credentials.json').authenticate()

if __name__ == '__main__':
     app.run(port='5002')
