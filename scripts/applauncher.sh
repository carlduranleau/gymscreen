#!/bin/bash
isrunning=$(ps aux | grep app.py | grep -v grep | wc -l)
if [ "${isrunning}" != "0" ]; then
	echo "Already running."
	exit 1
fi
cd ~/gymnamic
errorcode=0
while [ $errorcode -eq 0 ]; do python app.py; errorcode=$?; sleep 1; done

