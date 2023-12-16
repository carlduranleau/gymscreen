#!/bin/bash
isrunning=$(ps aux | grep app.py | grep -v grep | wc -l)
if [ "${isrunning}" != "0" ]; then
	echo "Already running."
	exit 1
fi
cd ~/gymnamic
errorcode=0
touch /home/pi/gymnamic/app.lock
while [ $errorcode -eq 0 ] && [ -f /home/pi/gymnamic/app.lock ]; do python app.py; errorcode=$?; sleep 1; done

