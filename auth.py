from config import Config
import bcrypt

print("Enter new password:")
p = input()
salt = bcrypt.gensalt()
token = bcrypt.hashpw(p.encode('utf-8'), salt)
authFilePath = '{}/{}'.format(Config.CACHE_PATH, 'token')
with open(authFilePath, 'wb') as f:
	f.write(token)
print("Password updated.")

