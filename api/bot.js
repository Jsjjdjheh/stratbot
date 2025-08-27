import jwt from "jsonwebtoken";

const BOT_TOKEN = process.env.BOT_TOKEN;
const APP_BASE_URL = process.env.APP_BASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;

async function sendMessage(chat_id, text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text, parse_mode: "HTML" })
  });
}

function makeLoginLink(chat_id) {
  const token = jwt.sign({ chat_id }, JWT_SECRET, { expiresIn: "15m" });
  return `${APP_BASE_URL}/api/login?t=${encodeURIComponent(token)}`;
}

export default async function handler(req, res) {
  const update = req.body;
  const msg = update?.message;
  const chat_id = msg?.chat?.id;
  const text = msg?.text?.trim() || "";

  if (!chat_id) return res.status(200).end("ok");

  if (text.startsWith("/start")) {
    await sendMessage(
      chat_id,
      "👋 Welcome to Educational Demo Bot!\nType /create to get your unique demo login link."
    );
  } else if (text.startsWith("/create")) {
    const link = makeLoginLink(chat_id);
    await sendMessage(chat_id, `🔗 Here is your demo link (valid 15 min):\n${link}`);
  } else {
    await sendMessage(chat_id, "Unknown command. Try /create");
  }

  return res.status(200).json({ ok: true });
    }
