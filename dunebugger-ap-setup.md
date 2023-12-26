sudo apt-get update
sudo apt-get install hostapd dnsmasq

Configure dnsmasq:
Create a configuration file for dnsmasq:
```
sudo nano /etc/dnsmasq.conf
```

Add the following lines to the file:
```
interface=wlan0       # Use the interface used by your WiFi adapter
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
```

Configure hostapd:
Create a configuration file for hostapd:
```
sudo nano /etc/hostapd/hostapd.conf
```

Add the following lines to the file:
```
interface=wlan0       # Use the interface used by your WiFi adapter
ssid=dunebugger-%d    # SSID for your WiFi network with a random number suffix
hw_mode=g
channel=7
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=YourSecurePassword   # Set a secure password
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
shell_cmd=/etc/hostapd/check_wifi_config.sh
```

Update hostapd Configuration:
Edit the hostapd default configuration file:
```
sudo nano /etc/default/hostapd
```

Find the line #DAEMON_CONF="" and change it to:

```
DAEMON_CONF="/etc/hostapd/hostapd.conf -dd -t -f /dev/urandom"
```

Enable IPv4 Forwarding:
Edit the sysctl configuration file:
```
sudo nano /etc/sysctl.conf
```

Uncomment the line:

```
net.ipv4.ip_forward=1
```

Apply the changes:

```
sudo sysctl -p
```

Set Up Static IP for the AP Interface:
Edit the DHCP configuration file:

```
sudo nano /etc/dhcpcd.conf
```

Add the following lines at the end:
```
interface wlan0
    static ip_address=192.168.4.1/24
    nohook wpa_supplicant
```

Start Services and Reboot:
```
sudo systemctl start hostapd
sudo systemctl start dnsmasq
sudo systemctl enable hostapd
sudo systemctl enable dnsmasq
sudo reboot
```


Create a new systemd service file for the Access Point:
```
sudo nano /etc/systemd/system/hostapd.service
```

Add the following content:
```
[Unit]
Description=Advanced IEEE 802.11 AP and IEEE 802.1X/WPA/WPA2/EAP Authenticator
After=syslog.target
After=network.target

[Service]
Type=forking
PIDFile=/var/run/hostapd.pid
ExecStartPre=/sbin/iw dev wlan0 interface add ap0 type __ap
ExecStartPre=/bin/sleep 2
ExecStart=/usr/sbin/hostapd -B -P /var/run/hostapd.pid /etc/hostapd/hostapd.conf
ExecStartPost=/usr/sbin/iw dev wlan0 set power_save off
ExecStop=/sbin/iw dev ap0 del
ExecStopPost=/bin/sleep 2
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the new service:
```
sudo systemctl enable hostapd
sudo systemctl start hostapd
```


If you haven't already, configure the networking service to handle WiFi connections. Edit the /etc/network/interfaces file:
```
sudo nano /etc/network/interfaces
```

Make sure it includes the following for the wlan0 interface:
```
auto wlan0
iface wlan0 inet manual
wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf
```


reboot