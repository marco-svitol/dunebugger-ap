const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML configuration page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/config.html');
});

// Handle form submission
app.post('/configure', (req, res) => {
  const { ssid, password } = req.body;

  // Set WiFi configuration using Network Manager
  setWifiConfiguration(ssid, password);

  res.send('Configuration successful. Please reboot your device.');
});

function setWifiConfiguration(ssid, password) {
  const command = `nmcli device wifi connect "${ssid}" password "${password}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error setting WiFi configuration: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`Error setting WiFi configuration: ${stderr}`);
      return;
    }

    console.log(`WiFi configuration set successfully: ${stdout}`);

    // Create the flag file indicating WiFi configuration is completed
    createFlagFile();
  });
}

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

function createFlagFile() {
    const flagFilePath = '/etc/wifi_configured_flag';
  
    fs.writeFile(flagFilePath, '', (err) => {
      if (err) {
        console.error(`Error creating flag file: ${err.message}`);
      } else {
        console.log(`Flag file created: ${flagFilePath}`);
      }
    });
  }