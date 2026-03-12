/* ═══════════════════════════════════════════════════════════════════
   RVIT AI Assistant – Premium Chatbot Widget
   RV Institute of Technology, Chebrolu, Guntur
   ═══════════════════════════════════════════════════════════════════
   Drop-in script: add before </body> on any page.
   Uses OpenRouter API (proxied through /api/chat).
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── configuration ─────────────────────────────────────────────── */
  const API_KEY   = window.OPENROUTER_API_KEY || '';
  const MODEL     = 'stepfun/step-3.5-flash:free';
  const USE_PROXY = !!window.USE_PROXY;

  if (!API_KEY && !USE_PROXY) {
    console.warn('[RVIT Chatbot] Set window.USE_PROXY=true (use server proxy) or window.OPENROUTER_API_KEY');
    return;
  }

  /* ── RVIT knowledge base (system prompt) ───────────────────────── */
  const SYSTEM_PROMPT = `You are the official AI Assistant of RV Institute of Technology (RVIT), Chebrolu, Guntur, Andhra Pradesh. Answer ONLY questions related to RVIT. For unrelated queries, politely redirect users back to RVIT topics.

ABOUT RVIT:
• Full name: RV Institute of Technology (formerly Chebrolu Engineering College)
• Established: 2008 | Sponsored by: Sri Visweswaraiah Educational Society
• Location: Chebrolu (V&M), Guntur District, Andhra Pradesh – 522212
• Status: UGC Autonomous, NAAC 'A' Grade, AICTE Approved, JNTUK Affiliated
• Recognitions: NIRF Innovation, IIC Recognized, SIRO Recognized, Careers360 Rated, UGC 2(f) & 12(B), APPSSDC Partner, MSME Recognized

COURSES OFFERED (with intake):
B.Tech (4-year, EAPCET Code: RVIT):
• Computer Science and Engineering (CSE) – 360 seats (est. 2008)
• CSE – Artificial Intelligence & ML – 120 seats (est. 2020)
• CSE – Data Science – 180 seats (est. 2020)
• Electronics and Communication (ECE) – 60 seats (est. 2008)
• Electronics Engg. (VLSI Design & Tech) – 60 seats (est. 2023)
M.Tech (via GATE/PGECET): CSE (18), VLSI & Embedded Systems (18), Power Systems (18)
MCA: Master of Computer Applications – 300 seats (via AP ICET)
BCA: Bachelor of Computer Applications – 180 seats (Direct admission)
Diploma (via AP POLYCET): Computer Engineering (180), AI & ML (120), ECE (60), EEE (30)

ADMISSION PROCEDURE:
• Step 1: Check eligibility for your program
• Step 2: Appear for EAPCET (B.Tech), GATE/PGECET (M.Tech), AP ICET (MCA), or AP POLYCET (Diploma)
• Step 3: In counselling, select RVIT (EAPCET code: RVIT)
• Step 4: Submit documents and join
• Seat allocation: 70% Convener (Cat-A), 30% Management (Cat-B)
• Lateral entry: Diploma holders can join B.Tech 2nd year via ECET (10% seats)
• Scholarships: 100+ merit scholarships available
• Apply online: https://rvit.edu.in/admission_management_system/students.php

ELIGIBILITY:
• B.Tech: Intermediate (10+2) with Maths, Physics, Chemistry; min marks as per AP Govt (usually 45%/40% reserved)
• M.Tech: B.E/B.Tech in relevant branch from AICTE-approved institution
• MCA: Bachelor's degree (3+ years) with Mathematics
• BCA: 10+2 or equivalent
• Diploma: SSC (10th) with minimum 35%

DOCUMENTS REQUIRED: SSC Marks Memo, Inter/Diploma Marks, Rank Card & Hall Ticket, Study Certificates (VI–XII), Transfer Certificate, Caste/Income Cert, Aadhar Card, Photos, EWS Certificate (if any). Bring originals + 3 sets of photocopies.

CAMPUS FACILITIES:
• Hostel: Separate boys & girls hostels, hygienic food, 24/7 security
• Transport: College buses from major points in Guntur and surrounding areas

PLACEMENTS & INCUBATION:
• Strong placement record with top-tier recruiters
• Incubation Center: 50+ startups, ₹10 Crore+ funding, seed funding, workspace, industry mentorship
• Placements: https://rvit.edu.in/placements.php | Incubation: https://rvit.edu.in/incubationcenter.php

CONTACT:
• Address: RV Institute of Technology, Chebrolu (V&M), Guntur 522212
• Phone: +91 99512 22268, +91 99512 22238, +91 95504 31211
• Email: principal@rvit.edu.in, admissions@rvit.edu.in
• Website: https://rvit.edu.in | Directions: https://maps.app.goo.gl/SBjhqDKXvAHTf6ZR7

KEY LINKS: Admissions https://rvit.edu.in/admissionprocedure.php | Courses https://rvit.edu.in/courses-offered.php | Fee https://rvit.edu.in/feestructure.php | Scholarships https://rvit.edu.in/scholarships.php | Virtual Tour https://rvit.edu.in/virtualtour360.php

RESPONSE STYLE: Be warm, professional, helpful. Use bullet points for readability. Include relevant URLs when answering (format as https://... so they render as links). Keep responses concise (under 200 words when possible).`;

  /* ── conversation history ──────────────────────────────────────── */
  const history = [{ role: 'system', content: SYSTEM_PROMPT }];

  /* ── Google Font ───────────────────────────────────────────────── */
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(fontLink);

  /* ── CSS ────────────────────────────────────────────────────────── */
  const css = document.createElement('style');
  css.textContent = `
/* ── reset scope ──────────────────────────────────────────────── */
#rvit-chat-widget, #rvit-chat-widget * {
  box-sizing: border-box;
  margin: 0; padding: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* ── floating button ─────────────────────────────────────────── */
#rvit-fab {
  position: fixed;
  bottom: 28px; right: 28px;
  width: 62px; height: 62px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  z-index: 99999;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(102,126,234,.45),
              0 0 0 0 rgba(102,126,234,.4);
  transition: transform .25s cubic-bezier(.4,0,.2,1);
  animation: rvit-pulse 2.4s infinite;
}
#rvit-fab:hover { transform: scale(1.1); }
#rvit-fab.open  { animation: none; transform: rotate(45deg) scale(1.05); }
@keyframes rvit-pulse {
  0%   { box-shadow: 0 4px 20px rgba(102,126,234,.45), 0 0 0 0   rgba(102,126,234,.45); }
  70%  { box-shadow: 0 4px 20px rgba(102,126,234,.45), 0 0 0 14px rgba(102,126,234,0);   }
  100% { box-shadow: 0 4px 20px rgba(102,126,234,.45), 0 0 0 0   rgba(102,126,234,0);   }
}

/* ── panel ────────────────────────────────────────────────────── */
#rvit-panel {
  position: fixed;
  bottom: 100px; right: 28px;
  width: 380px;
  max-height: 560px;
  border-radius: 20px;
  display: flex; flex-direction: column;
  background: rgba(18,18,30,.82);
  backdrop-filter: blur(24px) saturate(1.6);
  -webkit-backdrop-filter: blur(24px) saturate(1.6);
  border: 1px solid rgba(255,255,255,.12);
  box-shadow: 0 16px 48px rgba(0,0,0,.45);
  z-index: 99999;
  overflow: hidden;
  opacity: 0;
  transform: translateY(24px) scale(.96);
  pointer-events: none;
  transition: opacity .3s ease, transform .35s cubic-bezier(.4,0,.2,1);
}
#rvit-panel.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}
@media (max-width: 480px) {
  #rvit-panel { width: calc(100vw - 24px); right: 12px; bottom: 96px; max-height: 70vh; }
  #rvit-fab   { bottom: 18px; right: 18px; }
}

/* ── header ───────────────────────────────────────────────────── */
#rvit-header {
  padding: 16px 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex; align-items: center; gap: 12px;
  position: relative;
  flex-shrink: 0;
}
#rvit-header-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,.22);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
#rvit-header-info { flex: 1; }
#rvit-header-title {
  font-size: 15px; font-weight: 700; color: #fff;
}
#rvit-header-sub {
  font-size: 11px; color: rgba(255,255,255,.72); margin-top: 2px;
  display: flex; align-items: center; gap: 5px;
}
#rvit-header-sub .dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #4ade80; display: inline-block;
  animation: rvit-blink 1.6s infinite;
}
@keyframes rvit-blink { 0%,100%{opacity:1} 50%{opacity:.35} }
#rvit-close {
  position: absolute; top: 12px; right: 14px;
  background: rgba(255,255,255,.18); border: none;
  color: #fff; width: 28px; height: 28px; border-radius: 50%;
  font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .2s;
}
#rvit-close:hover { background: rgba(255,255,255,.35); }

/* ── messages ─────────────────────────────────────────────────── */
#rvit-messages {
  flex: 1;
  padding: 16px 14px 10px;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 10px;
  scroll-behavior: smooth;
}
#rvit-messages::-webkit-scrollbar { width: 5px; }
#rvit-messages::-webkit-scrollbar-track { background: transparent; }
#rvit-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 10px; }

.rvit-msg {
  max-width: 82%;
  padding: 11px 15px;
  border-radius: 16px;
  font-size: 13.5px;
  line-height: 1.55;
  word-wrap: break-word;
  animation: rvit-msgIn .3s ease;
}
@keyframes rvit-msgIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.rvit-msg.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.rvit-msg.bot {
  align-self: flex-start;
  background: rgba(255,255,255,.08);
  color: #e4e4ef;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(255,255,255,.06);
}
.rvit-msg.bot .rvit-link {
  color: #93c5fd;
  text-decoration: underline;
  word-break: break-all;
}
.rvit-msg.bot .rvit-link:hover { color: #bfdbfe; }

/* ── typing indicator ─────────────────────────────────────────── */
.rvit-typing {
  display: flex; align-items: center; gap: 5px;
  padding: 12px 16px;
  align-self: flex-start;
  background: rgba(255,255,255,.08);
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  animation: rvit-msgIn .3s ease;
}
.rvit-typing span {
  width: 7px; height: 7px;
  background: rgba(255,255,255,.4);
  border-radius: 50%;
  animation: rvit-dot 1.4s infinite ease-in-out;
}
.rvit-typing span:nth-child(2) { animation-delay: .16s; }
.rvit-typing span:nth-child(3) { animation-delay: .32s; }
@keyframes rvit-dot {
  0%,80%,100% { transform: scale(.6); opacity:.4; }
  40%         { transform: scale(1);   opacity:1;  }
}

/* ── quick chips ──────────────────────────────────────────────── */
#rvit-chips {
  display: flex; flex-wrap: wrap; gap: 8px;
  padding: 6px 14px 12px;
  flex-shrink: 0;
}
.rvit-chip {
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid rgba(102,126,234,.5);
  background: rgba(102,126,234,.12);
  color: #a5b4fc;
  font-size: 12px; font-weight: 500;
  cursor: pointer;
  transition: all .2s;
  white-space: nowrap;
}
.rvit-chip:hover {
  background: rgba(102,126,234,.28);
  color: #fff;
  border-color: rgba(102,126,234,.7);
  transform: translateY(-1px);
}

/* ── input bar ────────────────────────────────────────────────── */
#rvit-input-bar {
  display: flex; align-items: center;
  padding: 10px 12px;
  border-top: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.04);
  flex-shrink: 0;
  gap: 8px;
}
#rvit-input {
  flex: 1;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13.5px;
  background: rgba(255,255,255,.06);
  color: #eee;
  outline: none;
  transition: border-color .2s;
}
#rvit-input::placeholder { color: rgba(255,255,255,.32); }
#rvit-input:focus { border-color: rgba(102,126,234,.55); }
#rvit-send {
  width: 40px; height: 40px;
  border-radius: 12px; border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; font-size: 18px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: opacity .2s, transform .15s;
  flex-shrink: 0;
}
#rvit-send:hover { opacity: .88; transform: scale(1.06); }
#rvit-send:disabled { opacity: .4; cursor: default; transform: none; }

/* ── powered-by footer ────────────────────────────────────────── */
#rvit-footer {
  text-align: center;
  padding: 5px 0 8px;
  font-size: 10px;
  color: rgba(255,255,255,.22);
  flex-shrink: 0;
}
`;
  document.head.appendChild(css);

  /* ── build DOM ──────────────────────────────────────────────────── */

  // wrapper
  const widget = document.createElement('div');
  widget.id = 'rvit-chat-widget';

  // FAB
  const fab = document.createElement('button');
  fab.id = 'rvit-fab';
  fab.setAttribute('aria-label', 'Open RVIT AI Assistant');
  fab.innerHTML = '💬';
  widget.appendChild(fab);

  // panel
  const panel = document.createElement('div');
  panel.id = 'rvit-panel';

  // header
  const header = document.createElement('div');
  header.id = 'rvit-header';
  header.innerHTML = `
    <div id="rvit-header-avatar">🎓</div>
    <div id="rvit-header-info">
      <div id="rvit-header-title">RVIT AI Assistant</div>
      <div id="rvit-header-sub"><span class="dot"></span> Online — ask me anything</div>
    </div>`;
  panel.appendChild(header);

  const closeBtn = document.createElement('button');
  closeBtn.id = 'rvit-close';
  closeBtn.innerHTML = '✕';
  header.appendChild(closeBtn);

  // messages
  const messages = document.createElement('div');
  messages.id = 'rvit-messages';
  panel.appendChild(messages);

  // chips
  const chipsBox = document.createElement('div');
  chipsBox.id = 'rvit-chips';
  const chipLabels = [
    { label: '🎓 Admissions',   q: 'How do I apply for admission at RVIT?' },
    { label: '📚 Courses',      q: 'What courses and branches does RVIT offer?' },
    { label: '💰 Scholarships', q: 'What scholarships are available at RVIT?' },
    { label: '💼 Placements',   q: 'Tell me about placements at RVIT' },
    { label: '📍 Contact',      q: 'What is the contact information and address of RVIT?' },
    { label: '🏫 Hostel & Transport', q: 'Does RVIT have hostel and transport facilities?' },
  ];
  chipLabels.forEach(c => {
    const chip = document.createElement('button');
    chip.className = 'rvit-chip';
    chip.textContent = c.label;
    chip.onclick = () => sendMessage(c.q);
    chipsBox.appendChild(chip);
  });
  panel.appendChild(chipsBox);

  // input bar
  const inputBar = document.createElement('div');
  inputBar.id = 'rvit-input-bar';
  const input = document.createElement('input');
  input.id = 'rvit-input';
  input.type = 'text';
  input.placeholder = 'Ask about RVIT…';
  input.autocomplete = 'off';
  const sendBtn = document.createElement('button');
  sendBtn.id = 'rvit-send';
  sendBtn.innerHTML = '➤';
  sendBtn.setAttribute('aria-label', 'Send');
  inputBar.appendChild(input);
  inputBar.appendChild(sendBtn);
  panel.appendChild(inputBar);

  // footer
  const footer = document.createElement('div');
  footer.id = 'rvit-footer';
  footer.textContent = 'Powered by RVIT AI · stepfun';
  panel.appendChild(footer);

  widget.appendChild(panel);
  document.body.appendChild(widget);

  /* ── welcome message ───────────────────────────────────────────── */
  appendMsg('bot', 'Hi there! 👋 I\'m the RVIT AI Assistant. Ask me anything about admissions, courses, placements, or campus life at RV Institute of Technology, Chebrolu!');

  /* ── helpers ────────────────────────────────────────────────────── */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
    return escapeHtml(text).replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="rvit-link">$1</a>');
  }
  function appendMsg(role, text) {
    const div = document.createElement('div');
    div.className = `rvit-msg ${role}`;
    if (role === 'bot') {
      div.innerHTML = linkify(text).replace(/\n/g, '<br>');
    } else {
      div.textContent = text;
    }
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'rvit-typing';
    t.id = 'rvit-typing-indicator';
    t.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(t);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('rvit-typing-indicator');
    if (t) t.remove();
  }

  /* ── toggle panel ──────────────────────────────────────────────── */
  function togglePanel() {
    const open = panel.classList.toggle('visible');
    fab.classList.toggle('open', open);
    fab.innerHTML = open ? '✕' : '💬';
    if (open) input.focus();
  }
  fab.onclick = togglePanel;
  closeBtn.onclick = () => {
    panel.classList.remove('visible');
    fab.classList.remove('open');
    fab.innerHTML = '💬';
  };

  /* ── send message ──────────────────────────────────────────────── */
  let busy = false;

  async function sendMessage(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    busy = true;
    sendBtn.disabled = true;

    // hide chips after first user message
    if (chipsBox.parentNode) chipsBox.remove();

    appendMsg('user', text);
    input.value = '';
    showTyping();

    history.push({ role: 'user', content: text });

    try {
      const endpoint = USE_PROXY ? '/api/chat' : 'https://openrouter.ai/api/v1/chat/completions';
      const headers  = { 'Content-Type': 'application/json' };
      if (!USE_PROXY) headers['Authorization'] = `Bearer ${API_KEY}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ model: MODEL, messages: history })
      });

      const data = await res.json().catch(() => ({}));

      // Handle API errors (OpenRouter returns { error: { message: "..." } })
      if (!res.ok || data?.error) {
        console.warn('[RVIT Chatbot] API error:', res.status, data);
        const errObj = data?.error;
        const errMsg = (typeof errObj === 'string' ? errObj : errObj?.message) || `Request failed (${res.status}). Please try again.`;
        if (res.status === 401) {
          appendMsg('bot', '⚠️ API authentication error. Please contact the site administrator.');
        } else if (res.status === 402) {
          appendMsg('bot', '⚠️ API credits exhausted. Please try again later.');
        } else {
          appendMsg('bot', '⚠️ ' + String(errMsg).slice(0, 200));
        }
        hideTyping();
        return;
      }

      const reply = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? '';
      if (!reply || typeof reply !== 'string') {
        appendMsg('bot', '⚠️ No response from the AI. Please try again.');
        hideTyping();
        return;
      }

      history.push({ role: 'assistant', content: reply });
      hideTyping();
      appendMsg('bot', reply);
    } catch (err) {
      console.error('[RVIT Chatbot]', err);
      hideTyping();
      appendMsg('bot', '⚠️ Network error — please check your connection and try again.');
    } finally {
      busy = false;
      sendBtn.disabled = false;
    }
  }

  sendBtn.onclick = () => sendMessage(input.value);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage(input.value);
  });
})();
