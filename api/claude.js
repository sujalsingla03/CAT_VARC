// api/claude.js
// Proxies requests to the Gemini API. The API key stays server-side only.
// Requires a shared secret header so random visitors to your URL can't burn your API credits.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const appSecret = req.headers['x-app-secret'];
  if (!appSecret || appSecret !== process.env.APP_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Vercel env vars' });
  }

  const { prompt, maxTokens } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: maxTokens || 1800 }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text)
      .join('');

    if (!text) {
      return res.status(500).json({ error: 'No text in Gemini response', raw: data });
    }

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
