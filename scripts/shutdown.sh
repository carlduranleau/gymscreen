#!/bin/bash
rm -f /home/pi/gymnamic/app.lock
pid=$(ps aux | grep app.py | grep -v grep | cut -d" " -f 9)
kill $pid

