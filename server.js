// simple static file server for the RVIT website mirror
// run `npm install` once, then `npm start` or `npm run dev`

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// parse JSON bodies (for proxy)
app.use(express.json());

// serve all files from workspace root
app.use(express.static(path.join(__dirname)));

// simple proxy to OpenRouter chat endpoint so key stays on server
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY || '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';
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'OPENROUTER_API_KEY not set on server' } });
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': req.get('origin') || 'https://rvit.edu.in'
      },
      body: JSON.stringify(req.body)
    });
    clearTimeout(timeout);
    const data = await response.json();
    if (!response.ok) {
      const msg = data?.error?.message || data?.error?.code || `HTTP ${response.status}`;
      console.error('[OpenRouter]', response.status, msg);
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    const msg = err.message || String(err);
    console.error('[OpenRouter] proxy error:', msg);
    res.status(502).json({
      error: { message: msg }
    });
  }
});

app.listen(port, () => {
  console.log(`RVIT mirror running at http://localhost:${port}`);
});
