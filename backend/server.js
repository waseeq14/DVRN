const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Matches the hardcoded PREMIUM_API_KEY shipped in every DVRN variant's JS
// bundle (VB-02). A real backend would never hand out entitlement based on a
// static key like this - it's here because DVRN's client hardcodes it too.
const PREMIUM_API_KEY = 'sk_live_dvrn_9f8a2c1b4e7d';

app.post('/api/login', (req, res) => {
  const { username } = req.body || {};
  const token = `dvrn_sess_${username || 'anon'}_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;

  res.json({
    token,
    isPremium: false,
  });
});

app.get('/api/premium', (req, res) => {
  const apiKey = req.header('x-api-key');

  if (apiKey !== PREMIUM_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  res.json({
    content: 'This is exclusive premium content, gated only by a static API key.',
  });
});

app.get('/help', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html>
  <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
  <body style="font-family: sans-serif; padding: 16px;">
    <h1>DVRN Help</h1>
    <p>This is a plain help page embedded in the app via WebView. It doesn't do anything unusual - it's the app's own trust of whatever content ends up here that's the actual bug (VB-05).</p>
  </body>
</html>`);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`DVRN backend listening on http://localhost:${PORT}`);
});
