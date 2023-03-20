from config import Config
import bcrypt

token = None
authFilePath = '{}/{}'.format(Config.CACHE_PATH, 'token')
with open(authFilePath, 'rb') as f:
	token = f.read()

if not token is None:
	print("Enter password:")
	p = input()

	if bcrypt.hashpw(p.encode('utf-8'), token) == token:
		print("Access granted.")
	else:
		print("Access denied.")
else:
	print("ERROR: No credential token found")

