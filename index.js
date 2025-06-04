import http from 'http';
import fetch from 'node-fetch';
import dotenv from 'dotenv'; // Import dotenv

// Load environment variables from .env file
dotenv.config();

// --- Configuration from Environment Variables ---
const GOTIFY_URL = process.env.GOTIFY_URL;
const APP_TOKEN = process.env.GOTIFY_APP_TOKEN;
const PORT = process.env.SERVER_PORT || 443; // Use port from .env or default to 3000

// Basic validation to ensure environment variables are loaded
if (!GOTIFY_URL || !APP_TOKEN) {
    console.error('Error: GOTIFY_URL and GOTIFY_APP_TOKEN must be set in your .env file.');
    process.exit(1); // Exit if critical variables are missing
}


// Function to fetch messages from Gotify
async function getGotifyMessages() {
    try {
        const response = await fetch(`<span class="math-inline">\{GOTIFY\_URL\}/message?token\=</span>{APP_TOKEN}`);
        if (!response.ok) {
            throw new Error(`Gotify API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.messages;
    } catch (error) {
        console.error('Failed to fetch Gotify messages:', error.message);
        return [];
    }
}

// Create the HTTP server
const server = http.createServer(async (req, res) => {
    if (req.url === '/') {
        const messages = await getGotifyMessages();

        res.writeHead(200, { 'Content-Type': 'text/plain' });

        if (messages.length === 0) {
            res.end('No messages found or failed to retrieve messages.');
        } else {
            let output = '--- Gotify Messages ---\n\n';
            messages.forEach(msg => {
                output += `Title: ${msg.title || 'N/A'}\n`;
                output += `Message: ${msg.message || 'N/A'}\n`;
                output += `Date: ${new Date(msg.date).toLocaleString()}\n`;
                output += `Priority: ${msg.priority || 'N/A'}\n`;
                output += '-----------------------\n\n';
            });
            res.end(output);
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Gotify message server running at http://localhost:${PORT}/`);
    console.log('Access this URL in your browser to see messages.');
    console.log('Gotify URL:', GOTIFY_URL); // For debugging, remove in production
});