from filecredential import FileCredential
from datafeeder import DataFeeder


feeder = DataFeeder(FileCredential('token'))
feeder.load()

