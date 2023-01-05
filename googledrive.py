from __future__ import print_function
import pickle
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from downloadthread import DownloadThread
import os
import signal

class GoogleDrive:

	# If modifying these scopes, delete the file token.pickle.
	SCOPES = ['https://www.googleapis.com/auth/drive']

	def __init__(self, credential_file):
		self.credential_file = credential_file
		self.files = None
		self.results = None
		self.service = None

	def authenticate(self):
		creds = None
		# The file token.pickle stores the user's access and refresh tokens, and is
		# created automatically when the authorization flow completes for the first
		# time.
		if os.path.exists('token.pickle'):
			with open('token.pickle', 'rb') as token:
				creds = pickle.load(token)
		# If there are no (valid) credentials available, let the user log in.
		if not creds or not creds.valid:
			if creds and creds.expired and creds.refresh_token:
				creds.refresh(Request())
			else:
				flow = InstalledAppFlow.from_client_secrets_file(
		    		self.credential_file, self.SCOPES)
				creds = flow.run_local_server()
			# Save the credentials for the next run
			with open('token.pickle', 'wb') as token:
				pickle.dump(creds, token)	

		self.service = build('drive', 'v3', credentials=creds)

		return creds

	def toJSON(self):
		json_output = ''
		if self.results:
			for file in self.files:
				if self.download_thread.is_available(file):
					if json_output:
						json_output += ","
					else:
						json_output = ''
					json_output += '{{"name":"{}","url":"/{}/{}"}}'.format(file, self.PERSIST_PATH, file)
		return '{"files":[' + json_output + ']}'

