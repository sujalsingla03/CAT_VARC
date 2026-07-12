// api/claude.js
// Proxies requests to the Anthropic API. The API key stays server-side only.
// Requires a shared secret header so random visitors to your URL can't burn your API credits.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const appSecret = req.headers['x-app-secret'];
  if (!appSecret || appSecret !== process.env.APP_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { prompt, maxTokens } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens || 1800,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
