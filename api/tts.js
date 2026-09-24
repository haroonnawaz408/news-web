import https from 'https';

export default function handler(req, res) {
  try {
    const text = req.query.text || '';
    const lang = req.query.lang || 'en';
    const voice = req.query.voice || '';

    if (!text.trim()) {
      res.status(400).json({ error: 'Missing text parameter' });
      return;
    }

    let tl = lang === 'ur' ? 'ur' : 'en';
    if (lang === 'en' && voice === 'george') tl = 'en-GB';
    if (lang === 'en' && voice === 'adam') tl = 'en-US';

    const safeText = text.slice(0, 160).trim();
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      safeText
    )}&tl=${tl}&client=tw-ob`;

    https.get(
      ttsUrl,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      },
      (proxyRes) => {
        if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
          res.status(proxyRes.statusCode).end(`Upstream TTS failed with status ${proxyRes.statusCode}`);
          return;
        }

        res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=86400',
        });
        proxyRes.pipe(res);
      }
    ).on('error', (e) => {
      res.status(500).end('TTS error: ' + e.message);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
