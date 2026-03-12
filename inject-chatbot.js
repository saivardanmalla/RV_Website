// utility to inject chatbot configuration into every HTML file under the workspace
// run with `node inject-chatbot.js`

const fs = require('fs');
const path = require('path');

const snippet = `
  <!-- RVIT AI Assistant - uses server proxy; API key set via OPENROUTER_API_KEY env -->
  <script>window.USE_PROXY = true;</script>
  <script src="/rvit-chatbot.js"></script>
`;

function recurse(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(ent => {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      recurse(full);
    } else if (ent.isFile() && full.endsWith('.html')) {
      let content = fs.readFileSync(full, 'utf8');
      if (content.includes('rvit-chatbot.js')) {
        return; // already has chatbot
      }
      if (content.includes('</body>')) {
        content = content.replace(/<\/body>/i, snippet + '</body>');
        fs.writeFileSync(full, content, 'utf8');
        console.log('injected', full);
      }
    }
  });
}

recurse(path.resolve(__dirname));
console.log('done');
