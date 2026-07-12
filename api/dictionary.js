// api/dictionary.js
// Free dictionary lookups via dictionaryapi.dev — no API key needed.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const word = (req.query.word || '').trim().toLowerCase();
  if (!word) return res.status(400).json({ error: 'Missing word' });

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: `No definition found for "${word}"` });
      }
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const entries = await response.json();
    const entry = entries[0] || {};
    const meaningBlock = entry.meanings?.[0];
    const definition = meaningBlock?.definitions?.[0] || {};

    const synonyms = new Set();
    (entry.meanings || []).forEach((m) => {
      (m.definitions || []).forEach((d) => {
        (d.synonyms || []).forEach((s) => synonyms.add(s));
      });
      (m.synonyms || []).forEach((s) => synonyms.add(s));
    });

    return res.status(200).json({
      word: entry.word || word,
      meaning: definition.definition || 'No definition available.',
      example: definition.example || '',
      synonyms: [...synonyms].slice(0, 6),
      mnemonic: meaningBlock?.partOfSpeech
        ? `Part of speech: ${meaningBlock.partOfSpeech}`
        : ''
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
