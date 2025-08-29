const { Telegraf } = require('telegraf');
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);

// Handle Telegram updates
bot.start((ctx) => ctx.reply('Welcome to your Telegram bot!'));
bot.help((ctx) => ctx.reply('Send me a message and I will echo it back!'));
bot.on('text', (ctx) => ctx.reply(`You said: ${ctx.message.text}`));

// Set up webhook handling
app.post('/api/bot', async (req, res) => {
  try {
    await bot.handleUpdate(req.body, res);
  } catch (error) {
    console.error('Error handling update:', error);
    res.status(500).send('Error processing update');
  }
});

// Handle verification requests
app.get('/api/bot', (req, res) => {
  res.send('Bot is running');
});

module.exports = app;
