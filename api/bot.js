const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// Commands
bot.start((ctx) => ctx.reply("Welcome to your Telegram bot! 🚀"));
bot.help((ctx) => ctx.reply("Send me a message and I will echo it back!"));
bot.on("text", (ctx) => ctx.reply(`You said: ${ctx.message.text}`));

// Vercel API handler
module.exports = async (req, res) => {
  try {
    if (req.method === "POST") {
      await bot.handleUpdate(req.body);
      return res.status(200).json({ ok: true });
    }

    if (req.method === "GET") {
      return res.status(200).send("🤖 Bot is running on Vercel!");
    }

    return res.status(405).send("Method Not Allowed");
  } catch (err) {
    console.error("❌ Error handling update:", err);
    return res.status(500).send("Internal Server Error");
  }
};
