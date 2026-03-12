# RVIT Website Mirror with AI Chatbot

Local mirror of **RV Institute of Technology (RVIT)**, Chebrolu, Guntur, with an AI chatbot for admissions, courses, placements, and general college inquiries.

## Quick Start

1. **Install and run**:
   ```powershell
   npm install
   npm start
   ```

2. **Open** `http://localhost:8080` or `http://localhost:8080/www.rvit.edu.in/`

3. **Click the floating chat button** (bottom-right) to open the RVIT AI Assistant.

## Chatbot Features

- **Admissions**: B.Tech (EAPCET), M.Tech (GATE/PGECET), MCA (ICET), BCA, Diploma (POLYCET)
- **Courses**: CSE, CSE-AI/ML, CSE-Data Science, ECE, VLSI, M.Tech, MCA, BCA, Diploma (with intake details)
- **Quick chips**: Admissions, Courses, Scholarships, Placements, Contact, Hostel & Transport
- **Links**: URLs in responses are clickable

## API Key

The server uses `OPENROUTER_API_KEY` from the environment. A fallback key is set for local testing. For production, set the env variable:

```powershell
$env:OPENROUTER_API_KEY = "your-key"   # PowerShell
```

## Integration

See **[CHATBOT-INTEGRATION.md](CHATBOT-INTEGRATION.md)** for:

- Adding the chatbot to other pages
- Bulk injection (`node inject-chatbot.js`)
- Design and configuration details

## Troubleshooting

- **Network error**: Load the site via the HTTP server (not `file://`)
- **No response**: Ensure the server is running and `OPENROUTER_API_KEY` is set