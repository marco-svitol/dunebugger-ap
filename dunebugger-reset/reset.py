import RPi.GPIO as GPIO
import os
import subprocess
import time

# GPIO pin for the reset button
RESET_BUTTON_PIN = 17

# File path for the flag file
FLAG_FILE_PATH = '/etc/wifi_configured_flag'

# Set up GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(RESET_BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

def remove_flag_file():
    try:
        os.remove(FLAG_FILE_PATH)
        print(f'Flag file removed: {FLAG_FILE_PATH}')
        # Reboot after removing the flag file
        subprocess.run(['sudo', 'reboot'])
    except Exception as e:
        print(f'Error removing flag file: {str(e)}')

def on_reset_button_press(channel):
    if GPIO.input(channel) == GPIO.LOW:
        print('Reset button pressed. Removing flag file...')
        remove_flag_file()

# Add event listener for reset button press
GPIO.add_event_detect(RESET_BUTTON_PIN, GPIO.FALLING, callback=on_reset_button_press, bouncetime=5000)

try:
    print('GPIO input reset script is running. Press Ctrl+C to exit.')
    while True:
        time.sleep(1)

except KeyboardInterrupt:
    print('GPIO input reset script terminated.')

finally:
    GPIO.cleanup()
