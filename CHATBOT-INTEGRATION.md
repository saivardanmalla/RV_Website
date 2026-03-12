# RVIT Chatbot – Integration Guide

This guide covers the RVIT AI Assistant chatbot for RV Institute of Technology, Chebrolu, Guntur. The chatbot answers admissions, courses, placements, and general college inquiries using OpenRouter (stepfun/step-3.5-flash:free).

---

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set API key** (recommended for production)
   ```bash
   # Windows (PowerShell)
   $env:OPENROUTER_API_KEY = "your-openrouter-api-key"

   # Linux/macOS
   export OPENROUTER_API_KEY="your-openrouter-api-key"
   ```

3. **Run the server**
   ```bash
   npm start
   ```

4. **Open** `http://localhost:8080` or `http://localhost:8080/www.rvit.edu.in/` for the RVIT site.

---

## Architecture

| Component | Purpose |
|-----------|---------|
| `rvit-chatbot.js` | Client-side widget: UI, chat logic, OpenRouter calls |
| `server.js` | Express server: static files + `/api/chat` proxy |
| `/api/chat` | Proxies requests to OpenRouter; keeps API key on server |

The chatbot uses **proxy mode**: the client sends messages to `/api/chat`, and the server adds the API key before calling OpenRouter. This keeps the key off the browser.

---

## Integration on Existing Pages

Add before `</body>` on any HTML page:

```html
<script>window.USE_PROXY = true;</script>
<script src="/rvit-chatbot.js"></script>
```

For pages in subfolders (e.g. `www.rvit.edu.in/`):

```html
<script>window.USE_PROXY = true;</script>
<script src="../rvit-chatbot.js"></script>
```

Or use absolute path from server root:

```html
<script>window.USE_PROXY = true;</script>
<script src="/rvit-chatbot.js"></script>
```

---

## Bulk Injection

To inject the chatbot into all HTML files under the project:

```bash
node inject-chatbot.js
```

This adds the script snippet before `</body>` in every `.html` file that doesn’t already include it.

---

## Design & UX

- **Floating button** – Bottom-right; pulse animation
- **Chat panel** – Dark, rounded; backdrop blur
- **Quick chips** – Topics: Admissions, Courses, Scholarships, Placements, Contact, Hostel & Transport
- **Links** – URLs in responses are clickable (open in new tab)
- **Typing indicator** – Shown while the model responds
- **Responsive** – Layout adapts for mobile

---

## Configuration

| Variable | Description |
|----------|-------------|
| `window.USE_PROXY` | If `true`, use `/api/chat` instead of OpenRouter directly |
| `window.OPENROUTER_API_KEY` | Only if NOT using proxy (client-side key; not recommended) |

---

## Production Deployment

1. Set `OPENROUTER_API_KEY` in your hosting environment (Vercel, Railway, Heroku, etc.).
2. Ensure `rvit-chatbot.js` is served from your domain.
3. Ensure `/api/chat` is available and forwards to OpenRouter with the API key.

---

## Knowledge Base

The chatbot is tuned for:

- **Admissions**: B.Tech (EAPCET), M.Tech (GATE/PGECET), MCA (ICET), BCA, Diploma (POLYCET)
- **Courses**: CSE, CSE-AI/ML, CSE-Data Science, ECE, VLSI, M.Tech, MCA, BCA, Diploma
- **Campus**: Hostel, transport, scholarships, placements, incubation center
- **Contact**: Phone, email, address, directions

To change behaviour, edit the `SYSTEM_PROMPT` constant in `rvit-chatbot.js`.

---

## Troubleshooting

**"Sorry, I couldn't get a response" or "Request failed"**

1. **Restart the server** after code changes: stop it (Ctrl+C) and run `npm start` again.

2. **Test the API**:
   ```bash
   node test-proxy.js
   ```
   If you see `Status: 200` and a reply, the API is working. If you see `502` or `Failed to contact OpenRouter`, the server cannot reach OpenRouter (check firewall, proxy, or internet).

3. **401 Unauthorized** – API key is invalid or expired. Create a new key at [openrouter.ai/keys](https://openrouter.ai/keys) and set `OPENROUTER_API_KEY`.

4. **402 Payment Required** – OpenRouter credits exhausted. Add credits or switch to a free model.

5. **502 / Network error** – OpenRouter is unreachable (firewall, corporate proxy, or connectivity issue). Check the server console for the exact error message.
