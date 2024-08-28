const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  // Import the CORS middleware

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for specific origin
app.use(cors({
    origin: 'https://www.vmoods.com', // Replace with your actual domain
    methods: 'GET,POST' // Specify which HTTP methods are allowed
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" directory

// Middleware to redirect HTTP to HTTPS only for www.vmoods.com
app.use((req, res, next) => {
    if (req.hostname === 'www.vmoods.com' && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(`https://${req.get('Host')}${req.url}`);
    }
    next();
});

// Middleware to redirect www.vmoods.com to /live.html
app.use((req, res, next) => {
    if (req.hostname === 'www.vmoods.com') {
        return res.redirect('/live.html');
    }
    next();
});

// Path to the JSON file where results will be stored
const resultsFilePath = path.join(__dirname, 'results.json');

// Initialize the results file if it doesn't exist
if (!fs.existsSync(resultsFilePath)) {
    fs.writeFileSync(resultsFilePath, JSON.stringify({ vmware: 0, hypervisor: 0, hyperscaler: 0 }, null, 2));
}

// Read results from the file
function getResults() {
    return JSON.parse(fs.readFileSync(resultsFilePath));
}

// Write results to the file
function saveResults(results) {
    fs.writeFileSync(resultsFilePath, JSON.stringify(results, null, 2));
}

// Endpoint to record a selection
app.post('/api/record', (req, res) => {
    const { selection } = req.body;
    if (['vmware', 'hypervisor', 'hyperscaler'].includes(selection)) {
        const results = getResults();
        results[selection]++;
        saveResults(results);
        res.status(200).send(results);
    } else {
        res.status(400).send('Invalid selection');
    }
});

// Endpoint to get the current results
app.get('/api/results', (req, res) => {
    const results = getResults();
    res.status(200).send(results);
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve admin.html for the admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});