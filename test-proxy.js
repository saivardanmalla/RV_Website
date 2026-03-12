// Quick test of /api/chat – run with: node test-proxy.js
// Start the server first: npm start
(async () => {
  const { default: fetch } = await import('node-fetch');
  const port = process.env.PORT || 8080;
  const url = `http://localhost:${port}/api/chat`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'stepfun/step-3.5-flash:free',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello in one word.' }
        ]
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    if (data.error) console.log('Error:', data.error);
    if (data.choices?.[0]?.message?.content) {
      console.log('Reply:', data.choices[0].message.content);
    } else {
      console.log('Full response:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error:', err.message);
    console.log('Make sure the server is running: npm start');
  }
})();
