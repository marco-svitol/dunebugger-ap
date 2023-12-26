const express = require('express');
const bodyParser = require('body-parser');
const exec = require('child_process').exec;

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

    // TODO: Switch to client mode and connect to specified WiFi

    res.send('Configuration successful. Please reboot your Raspberry Pi.');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
