#!/bin/bash

FLAG_FILE="/etc/wifi_configured_flag"

if [ -e "$FLAG_FILE" ]; then
  echo "WiFi configuration completed. Exiting script."
  exit 0
else
  echo "WiFi configuration not completed. Starting hostapd."
  systemctl start hostapd
  echo "Starting Node.js application..."
  sudo -u pi node /home/marco/dunebugger-ap/app/app.js &
fi