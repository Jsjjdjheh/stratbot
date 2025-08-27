import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const token = req.query.t;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const chat_id = payload.chat_id;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Demo Login</title>
        <style>
          body { font-family: Arial; background:#111; color:#eee; display:flex; justify-content:center; align-items:center; height:100vh; }
          .box { background:#222; padding:30px; border-radius:12px; width:300px; text-align:center; }
          input { width:90%; padding:8px; margin:10px 0; border:none; border-radius:6px; }
          button { padding:10px 15px; background:#4CAF50; color:white; border:none; border-radius:6px; cursor:pointer; }
          .warn { color:red; font-size:12px; margin-bottom:10px; }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>Demo Login Page</h2>
          <p class="warn">⚠️ DEMO ONLY — DO NOT ENTER REAL CREDENTIALS</p>
          <form method="POST" action="/api/submit">
            <input type="hidden" name="chat_id" value="${chat_id}">
            <input type="text" name="username" placeholder="Username"><br>
            <input type="password" name="password" placeholder="Password"><br>
            <button type="submit">Login</button>
          </form>
        </div>
      </body>
      </html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (err) {
    res.status(400).send("❌ Invalid or expired link");
  }
      }
