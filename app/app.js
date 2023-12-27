const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML configuration page
app.get('/', (req, res) => {
  // Check WiFi connection status
  checkWifiConnectionStatus((isConnected, ssid) => {
    // Render HTML with connection status
    let htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dunebugger WiFi Configuration</title>
        </head>
        <body>
          <h1>Dunebugger WiFi Configuration</h1>
          <p>${isConnected ? `Connected to <strong>${ssid}</strong>` : 'Not Connected'}</p>
    `;

    // Include the form only if not connected
    if (!isConnected) {
      htmlContent += `
          <form action="/configure" method="post">
            <label for="ssid">SSID:</label>
            <input type="text" id="ssid" name="ssid" required>
            <br>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            <br>
            <button type="submit">Configure</button>
          </form>
      `;
    }

    htmlContent += `
        </body>
      </html>
    `;

    res.send(htmlContent);
  });
});

// Handle form submission
app.post('/configure', (req, res) => {
  const { ssid, password } = req.body;

  // Set WiFi configuration using Network Manager
  setWifiConfiguration(ssid, password);

  // Check WiFi connection status and display it on the web page
  checkWifiConnectionStatus((isConnected, connectedSSID) => {
    if (isConnected) {
      res.send(`Configuration successful. WiFi connection status: Connected to ${connectedSSID}`);
    } else {
      res.send('Configuration successful, but WiFi connection failed.');
    }
  });
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
  });
}

function checkWifiConnectionStatus(callback) {
  const statusCommand = "nmcli connection show --active";

  exec(statusCommand, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(`Error checking WiFi connection status: ${error ? error.message : stderr}`);
      callback(false, null);
      return;
    }

    const lines = stdout.split('\n');
    const isConnected = lines.some(line => line.includes('wifi') && !line.includes('loopback'));

    if (isConnected) {
      // Extract the SSID from the connected line
      const connectedLine = lines.find(line => line.includes('wifi') && !line.includes('loopback'));
      const connectedSSID = connectedLine.split(/\s+/)[0]; // Assuming SSID is the first field

      callback(true, connectedSSID);
    } else {
      callback(false, null);
    }
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