#!/bin/bash
isrunning=$(ps aux | grep app.py | grep -v grep | wc -l)
if [ "${isrunning}" != "0" ]; then
	echo "Already running."
	exit 1
fi
cd ~/gymnamic
while true; do python app.py; sleep 1; done

