#!/bin/bash

CONFIG_FILE="/etc/wpa_supplicant/wpa_supplicant.conf"

if [ -e "$CONFIG_FILE" ]; then
  echo "WiFi configuration found. Starting in client mode."
  exit 0
else
  echo "No WiFi configuration found. Starting in AP mode."
  exit 1
fi

