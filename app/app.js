const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML configuration page
app.get('/', (req, res) => {
  // Get the list of available SSIDs
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
      `;

      // Include the form only if not connected
      if (isConnected) {
        htmlContent += `
            <p>Connected to <strong>${ssid}</strong></p>
            </body>
            </html>
        `;
        res.send(htmlContent);
      } else {
        // Render the form with a dropdown for available SSIDs
        htmlContent += `
            <p>Not Connected</p>
            <form action="/configure" method="post">
              <label for="ssid">Select SSID:</label>
              <select id="ssid" name="ssid" required>
        `;

        getAvailableSSIDs((availableSSIDs) => {
          // Check WiFi connection status
          // Populate the dropdown with available SSIDs
          availableSSIDs.forEach((availableSSID) => {
            htmlContent += `<option value="${availableSSID}">${availableSSID}</option>`;
          });

          // Close the form
          htmlContent += `
                </select>
                <br>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                <br>
                <button type="submit">Configure</button>
              </form>
              </body>
              </html>
          `;
          // Send the final HTML content
          res.send(htmlContent);
        })
      }
    });
});

// Handle form submission
app.post('/configure', (req, res) => {
  const { ssid, password } = req.body;

  // Set WiFi configuration using Network Manager
  setWifiConfiguration(ssid, password, (error) => {
    // Check WiFi connection status and display it on the web page
    checkWifiConnectionStatus((isConnected, connectedSSID) => {
      if (isConnected) {
        res.send(`Configuration successful. WiFi connection status: Connected to ${connectedSSID}`);
      } else {
        const errorMessage = error ? `Error: ${error}` : 'WiFi connection failed.';
        res.send(`
          Configuration failed. ${errorMessage}
          <form action="/" method="get">
            <button type="submit">OK</button>
          </form>
        `);
      }
    });
  });
});

function getAvailableSSIDs(callback) {
  const listCommand = 'nmcli device wifi list | awk \'/^\\*/ {print $3} !/^\\*/ {print $2}\'';

  exec(listCommand, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(`Error getting available SSIDs: ${error ? error.message : stderr}`);
      callback([], null);
      return;
    }

    const lines = stdout.split('\n');
    const ssids = [];

    // Assuming SSID is in the third column and marked with an asterisk (*) in the first column
    lines.forEach((line, index) => {
      const ssid = line.trim();
       // Exclude the title line, empty strings, and SSIDs with only "-" characters
       if (index > 0 && ssid && ssid !== '--') {
        ssids.push(ssid);
       }
    });

    callback(ssids);
  });
}

// Function to set WiFi configuration
function setWifiConfiguration(ssid, password, callback) {
  const command = `nmcli device wifi connect "${ssid}" password "${password}"`;

  exec(command, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(`Error setting WiFi configuration: ${error ? error.message : stderr}`);
      callback(stderr);
      return;
    }

    console.log(`WiFi configuration set successfully: ${stdout}`);
    callback(null);
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

      //DEBUG
      if (connectedSSID == "Soter333"){return callback(false, null)} 

      createFlagFile();
      
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