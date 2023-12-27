#!/bin/bash

CONFIG_FILE="/etc/wpa_supplicant/wpa_supplicant.conf"

if [ -e "$CONFIG_FILE" ]; then
  echo "WiFi configuration found. Exiting script."
  exit 0
else
  echo "No WiFi configuration found. Starting hostapd."
  systemctl start hostapd
fi
