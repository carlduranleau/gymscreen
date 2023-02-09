#!/bin/bash

# Launch Server
sudo -u pi ./applauncher.sh &

sleep 5

# Launch display
sudo -u pi chromium --kiosk http://localhost:5002/ &
