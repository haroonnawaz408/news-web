import { defineConfig, Plugin, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import https from 'https';

function ttsProxyPlugin(): Plugin {
  return {
    name: 'tts-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/tts', (req, res) => {
        try {
          const parsedUrl = new URL(req.url || '', 'http://localhost:5173');
          const text = parsedUrl.searchParams.get('text') || '';
          const lang = parsedUrl.searchParams.get('lang') || 'en';
          const voice = parsedUrl.searchParams.get('voice') || '';
          const apiKey = parsedUrl.searchParams.get('apiKey') || process.env.VITE_ELEVENLABS_API_KEY || '';

          if (!text.trim()) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing text parameter' }));
            return;
          }

          // If ElevenLabs API Key is present and voice maps to an ElevenLabs voice
          if (apiKey && apiKey.length > 20) {
            const elevenVoiceMap: Record<string, string> = {
              adam: 'pNInz6obpgDQGcFmaJgB',
              rachel: '21m00Tcm4TlvDq8ikWAM',
              george: 'JBFqnCBsd6RMkjVDRZzb',
              charlotte: 'XB0fDUnXU5powFXDhCwa',
              hamza: 'ErXwobaYiN019PkySvjV', // Antoni multilingual
              zainab: 'LcfcDJNigL5wcS5zKzJN', // Emily multilingual
            };
            const elevenVoiceId = elevenVoiceMap[voice] || 'pNInz6obpgDQGcFmaJgB';

            const postData = JSON.stringify({
              text: text.slice(0, 500),
              model_id: 'eleven_multilingual_v2',
              voice_settings: { stability: 0.5, similarity_boost: 0.75 },
            });

            const elReq = https.request(
              `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`,
              {
                method: 'POST',
                headers: {
                  'xi-api-key': apiKey,
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(postData),
                },
              },
              (elRes) => {
                if (elRes.statusCode === 200) {
                  res.writeHead(200, {
                    'Content-Type': 'audio/mpeg',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=86400',
                  });
                  elRes.pipe(res);
                  return;
                }
                // Fallback to high-def streaming if ElevenLabs quota exhausted
                streamGoogleTTS(text, lang, voice, res);
              }
            );
            elReq.on('error', () => streamGoogleTTS(text, lang, voice, res));
            elReq.write(postData);
            elReq.end();
            return;
          }

          // Native Studio Neural Stream
          streamGoogleTTS(text, lang, voice, res);
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

function streamGoogleTTS(text: string, lang: string, voice: string, res: any) {
  // Select target regional voice code
  let tl = lang === 'ur' ? 'ur' : 'en';
  if (lang === 'en' && voice === 'george') tl = 'en-GB';
  if (lang === 'en' && voice === 'adam') tl = 'en-US';

  // Google TTS tw-ob strictly enforces max ~180-200 chars. Cap at 160 for guaranteed 200 OK.
  const safeText = text.slice(0, 160).trim();
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    safeText
  )}&tl=${tl}&client=tw-ob`;

  https.get(
    ttsUrl,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    },
    (proxyRes) => {
      // If upstream fails (e.g., rate limit or 400), do NOT pipe HTML as audio/mpeg
      if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
        res.statusCode = proxyRes.statusCode;
        res.end(`Upstream TTS failed with status ${proxyRes.statusCode}`);
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
      });
      proxyRes.pipe(res);
  }).on('error', (e) => {
    res.statusCode = 500;
    res.end('TTS error: ' + e.message);
  });
}

function socialCrawlerPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'social-crawler-plugin',
    transformIndexHtml: {
      order: 'pre',
      async handler(html, ctx) {
        const pathUrl = ctx.originalUrl || ctx.path || '';
        const match = pathUrl.match(/^\/news\/([a-zA-Z0-9_-]+)/);

        if (match) {
          const slug = match[1];
          try {
            const supabaseUrl = env.VITE_SUPABASE_URL || 'https://mgmixyzldchetjiwczco.supabase.co';
            const supabaseKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RCHo8MrLT6k7gi0gmh9wzw_USl7b26n';
            const fetchRes = await fetch(`${supabaseUrl}/rest/v1/posts?slug=eq.${slug}&select=title,excerpt,featured_image`, {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
            });
            const posts = await fetchRes.json();
            if (Array.isArray(posts) && posts.length > 0) {
              const post = posts[0];
              const title = (post.title || 'Breaking News | PulseNews').replace(/"/g, '&quot;');
              const description = (post.excerpt || 'Read the full story on PulseNews.').replace(/"/g, '&quot;');
              const image = post.featured_image || 'https://images.unsplash.com/photo-1586183185324-5d5d836551b8?w=1200&q=80';
              const host = ctx.req?.headers.host || 'localhost:5173';
              const protocol = ctx.req?.headers['x-forwarded-proto'] || 'http';
              const url = `${protocol}://${host}/news/${slug}`;

              const ogTags = `
    <!-- Dynamic WhatsApp & Social Preview Image Cards -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="PulseNews" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />`;

              return html.replace('</head>', `${ogTags}\n  </head>`);
            }
          } catch {
            // Fall through if fetch fails
          }
        }
        return html;
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };

  return {
    plugins: [react(), ttsProxyPlugin(), socialCrawlerPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            markdown: ['react-markdown', 'remark-gfm'],
            icons: ['lucide-react'],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  };
});
