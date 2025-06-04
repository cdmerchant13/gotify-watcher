import http from 'http';
import fetch from 'node-fetch'; // For making HTTP requests

// --- Configuration ---
const GOTIFY_URL = 'https://gotify.117820.xyz';
const APP_TOKEN = 'AShBsM2loEBAokH'; // Your Gotify Application Token
const PORT = 3000;

// Function to fetch messages from Gotify
async function getGotifyMessages() {
    try {
        const response = await fetch(`<span class="math-inline">\{GOTIFY\_URL\}/message?token\=</span>{APP_TOKEN}`);
        if (!response.ok) {
            // Not a 2xx response, handle error
            throw new Error(`Gotify API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.messages; // Assuming 'messages' array is directly under the root
    } catch (error) {
        console.error('Failed to fetch Gotify messages:', error.message);
        return []; // Return empty array on error
    }
}

// Create the HTTP server
const server = http.createServer(async (req, res) => {
    if (req.url === '/') {
        // Only respond to root URL
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
        // For any other URL
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Gotify message server running at http://localhost:${PORT}/`);
    console.log('Access this URL in your browser to see messages.');
});