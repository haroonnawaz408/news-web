/**
 * High-definition Text-to-Speech & Neural Voice Engine for PulseNews.
 * Supports Studio-Grade English (ElevenLabs style) and Authentic Urdu News Anchors.
 */

export interface VoiceModel {
  id: string;
  name: string;
  nativeName: string;
  gender: 'male' | 'female';
  lang: 'en' | 'ur';
  description: string;
  tag: string;
  pitch: number;
  rate: number;
  bassBoost?: number;
  clarityBoost?: number;
}

export const VOICE_MODELS: VoiceModel[] = [
  // ================= Urdu Neural News Model (واحد مستند اردو ماڈل) =================
  {
    id: 'zainab',
    name: 'Urdu AI Anchor (اردو براڈکاسٹر)',
    nativeName: 'اردو نیوز اینکر — معیاری لائیو آواز',
    gender: 'female',
    lang: 'ur',
    description: 'روانی اور صاف معیاری تلفظ کے ساتھ خودکار اردو نیوز براڈکاسٹ',
    tag: '🇵🇰 اردو بلیٹن',
    pitch: 1.0,
    rate: 0.92,
    bassBoost: 1.0,
    clarityBoost: 3.0,
  },

  // ================= English Studio Models (ElevenLabs Grade) =================
  {
    id: 'adam',
    name: 'Adam (Studio Anchor)',
    nativeName: 'Adam — Prime Anchor',
    gender: 'male',
    lang: 'en',
    description: 'Deep, resonant, authoritative prime-time wire anchor voice',
    tag: '🎙️ Studio Anchor',
    pitch: 0.92,
    rate: 0.96,
    bassBoost: 4.5,
    clarityBoost: 2.5,
  },
  {
    id: 'rachel',
    name: 'Rachel (Natural Narrator)',
    nativeName: 'Rachel — Natural Narrator',
    gender: 'female',
    lang: 'en',
    description: 'Warm, expressive, articulate long-form and documentary narrator',
    tag: '🎙️ Studio Narrator',
    pitch: 1.03,
    rate: 0.98,
    bassBoost: 1.5,
    clarityBoost: 3.0,
  },
  {
    id: 'george',
    name: 'George (BBC Broadcaster)',
    nativeName: 'George — BBC Wire',
    gender: 'male',
    lang: 'en',
    description: 'Classic British broadcast wire reporter with measured rhythm',
    tag: '🎙️ BBC Wire',
    pitch: 0.90,
    rate: 0.94,
    bassBoost: 3.0,
    clarityBoost: 2.0,
  },
  {
    id: 'charlotte',
    name: 'Charlotte (Tech Analyst)',
    nativeName: 'Charlotte — Tech Analyst',
    gender: 'female',
    lang: 'en',
    description: 'Crisp, modern, fast-paced technical and business journalism tone',
    tag: '🎙️ Tech Desk',
    pitch: 1.08,
    rate: 1.04,
    bassBoost: 0,
    clarityBoost: 4.0,
  },
];

// Common acronyms that sound much better when spelled out or pronounced with pauses
const ACRONYM_MAP: Record<string, string> = {
  AI: 'A.I.',
  AGI: 'A.G.I.',
  API: 'A.P.I.',
  APIs: 'A.P.I.s',
  LLM: 'L.L.M.',
  LLMs: 'L.L.M.s',
  GPU: 'G.P.U.',
  GPUs: 'G.P.U.s',
  CPU: 'C.P.U.',
  CPUs: 'C.P.U.s',
  UI: 'U.I.',
  UX: 'U.X.',
  CEO: 'C.E.O.',
  CTO: 'C.T.O.',
  SEO: 'S.E.O.',
  RSS: 'R.S.S.',
  URL: 'U.R.L.',
  URLs: 'U.R.L.s',
  XML: 'X.M.L.',
  JSON: 'Jason',
  HTTP: 'H.T.T.P.',
  HTTPS: 'H.T.T.P.S.',
  SQL: 'Sequel',
  NoSQL: 'No Sequel',
  AWS: 'A.W.S.',
  SaaS: 'Sass',
  PaaS: 'Pass',
  ISPR: 'I.S.P.R.',
  LHC: 'L.H.C.',
  PSX: 'P.S.X.',
  PTA: 'P.T.A.',
};

/**
 * Decodes all HTML named and numeric entities so the TTS engine
 * doesn't spell them out as literal punctuation.
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, ' and ')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, ' ')
    .replace(/&gt;/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&mdash;/g, ' — ')
    .replace(/&ndash;/g, ' - ')
    .replace(/&hellip;/g, '...')
    .replace(/&#(\d+);/g, (_, code) => {
      try {
        const char = String.fromCharCode(parseInt(code, 10));
        return char || ' ';
      } catch {
        return ' ';
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => {
      try {
        const char = String.fromCharCode(parseInt(code, 16));
        return char || ' ';
      } catch {
        return ' ';
      }
    });
}

/**
 * Sanitizes markdown/HTML text into natural conversational prose for TTS.
 * Handles both English and Urdu scripts with authentic punctuation preservation.
 */
export function sanitizeArticleForSpeech(
  title: string,
  markdownOrHtml: string,
  lang: 'en' | 'ur' = 'en'
): string[] {
  let text = markdownOrHtml;

  // 1. Decode HTML entities first
  text = decodeHtmlEntities(text);

  // 2. Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // 3. Remove script and style elements and their content
  text = text.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');

  // 4. Remove raw HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // 5. Remove Markdown code blocks
  text = text.replace(/```[\s\S]*?```/g, lang === 'ur' ? ' کوڈ کی تفصیلات۔ ' : ' Code snippet omitted. ');

  // 6. Remove inline code fences
  text = text.replace(/`([^`]+)`/g, '$1');

  // 7. Remove Markdown images
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');

  // 8. Replace Markdown links with just the link text
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // 9. Remove raw URLs
  text = text.replace(/https?:\/\/\S+/gi, '');

  // 10. Remove Markdown headings (#, ##, ###, etc.)
  text = text.replace(/^#{1,6}\s+/gm, '');

  // 11. Remove Markdown blockquotes
  text = text.replace(/^>\s+/gm, '');

  // 12. Remove Markdown tables
  text = text.replace(/^\|[\s\S]*?\|$/gm, '');
  text = text.replace(/\|/g, ' ');

  // 13. Remove horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // 14. Remove bullet points and numbered list markers
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+[\.)]\s+/gm, '');

  // 15. Remove bold / italic / strikethrough markers
  text = text.replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1');

  // 16. Language-specific replacements
  if (lang === 'en') {
    Object.entries(ACRONYM_MAP).forEach(([key, value]) => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      text = text.replace(regex, value);
    });
    text = text.replace(/&/g, ' and ');
  } else {
    // Urdu naturalizations & Pakistani newsroom phonetics
    text = text
      // Datelines
      .replace(/\bISLAMABAD\b\s*[-—–]\s*/gi, 'اسلام آباد — ')
      .replace(/\bKARACHI\b\s*[-—–]\s*/gi, 'کراچی — ')
      .replace(/\bLAHORE\b\s*[-—–]\s*/gi, 'لاہور — ')
      .replace(/\bRAWALPINDI\b\s*[-—–]\s*/gi, 'راولپنڈی — ')
      .replace(/\bPESHAWAR\b\s*[-—–]\s*/gi, 'پشاور — ')
      .replace(/\bQUETTA\b\s*[-—–]\s*/gi, 'کوئٹہ — ')
      // Currencies & Units
      .replace(/PKR|Rs\.?|₨/gi, ' روپے ')
      .replace(/USD|\$/g, ' امریکی ڈالر ')
      .replace(/SAR\b/g, ' سعودی ریال ')
      .replace(/AED\b/g, ' اماراتی درہم ')
      .replace(/EUR|€/g, ' یورو ')
      .replace(/GBP|£/g, ' پاؤنڈ ')
      .replace(/\bpts\b|\bpoints\b/gi, ' پوائنٹس ')
      .replace(/\btola\b/gi, ' تولہ ')
      .replace(/\/L\b|\/litre\b|\/liter\b/gi, ' فی لیٹر ')
      // Financial & Governance Institutions
      .replace(/\bKSE-?100\b/gi, 'کے ایس ای ہنڈرڈ')
      .replace(/\bPSX\b/gi, 'پاکستان اسٹاک ایکسچینج')
      .replace(/\bSBP\b/gi, 'اسٹیٹ بینک')
      .replace(/\bFBR\b/gi, 'ایف بی آر')
      .replace(/\bIMF\b/gi, 'آئی ایم ایف')
      .replace(/\bOGRA\b/gi, 'اوگرا')
      .replace(/\bNEPRA\b/gi, 'نیپرا')
      .replace(/\bECC\b/gi, 'ای سی سی')
      .replace(/\bISPR\b/gi, 'آئی ایس پی آر')
      .replace(/\bGDP\b/gi, 'جی ڈی پی')
      .replace(/\bPM\b/g, 'وزیر اعظم')
      .replace(/\bCM\b/g, 'وزیر اعلیٰ')
      .replace(/\bGovt\.?\b/gi, 'حکومت')
      .replace(/\bBillion\b/gi, 'ارب')
      .replace(/\bTrillion\b/gi, 'کھرب')
      .replace(/\bMillion\b/gi, 'دس لاکھ')
      .replace(/\bCrore\b/gi, 'کروڑ')
      .replace(/\bLakh\b/gi, 'لاکھ')
      // Symbols
      .replace(/&/g, ' اور ')
      .replace(/%/g, ' فیصد ')
      .replace(/\+/g, ' جمع ');
  }

  // 17. Remove weird brackets, hashtags, unneeded symbols that hinder flow
  text = text.replace(/[\{\}\[\]\(\)<>\#\$\^\*_~`\\]/g, ' ');

  // 18. Collapse multiple spaces and blank lines
  text = text.replace(/\s+/g, ' ').trim();

  // Combine title and sanitized prose with authentic pause
  const cleanTitle = decodeHtmlEntities(title).replace(/\s+/g, ' ').trim();
  const fullText = lang === 'ur' ? `${cleanTitle}۔ ${text}` : `${cleanTitle}. ${text}`;

  // 19. Split into natural sentence chunks (guaranteed <= 140 chars per chunk)
  return splitIntoSpeechChunks(fullText, lang);
}

/**
 * Splits text into natural sentence-level speech chunks with Urdu & English support.
 * Guaranteed: NO chunk ever exceeds 140 characters, preserving word boundaries.
 */
function splitIntoSpeechChunks(text: string, _lang: 'en' | 'ur' = 'en'): string[] {
  // Regex supporting both English (. ! ?) and Urdu (۔ ؟) sentence delimiters
  const sentenceRegex = /[^.!?۔؟\n]+[.!?۔؟]+(?:\s+|$)|[^.!?۔؟\n]+$/g;
  const rawSentences = text.match(sentenceRegex) || [text];
  const chunks: string[] = [];

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed || trimmed.length < 2) continue;

    // If within safe length, push directly
    if (trimmed.length <= 140) {
      chunks.push(trimmed);
      continue;
    }

    // First attempt: split by clause delimiters (Urdu comma '،', semicolon, English comma)
    const clauses = trimmed.split(/([,;،:\s—–-]\s*)/);
    let currentChunk = '';

    for (const part of clauses) {
      if ((currentChunk + part).length > 140 && currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = part;
      } else {
        currentChunk += part;
      }
    }

    if (currentChunk.trim()) {
      // If a run-on chunk is still > 140 chars (rare case: long unbroken word sequence)
      if (currentChunk.trim().length > 140) {
        const words = currentChunk.trim().split(/\s+/);
        let wordSub = '';
        for (const word of words) {
          if ((wordSub + ' ' + word).length > 140 && wordSub.trim()) {
            chunks.push(wordSub.trim());
            wordSub = word;
          } else {
            wordSub = wordSub ? `${wordSub} ${word}` : word;
          }
        }
        if (wordSub.trim()) {
          chunks.push(wordSub.trim());
        }
      } else {
        chunks.push(currentChunk.trim());
      }
    }
  }

  return chunks.filter((c) => c.length > 1);
}

/**
 * Returns the audio URL for a given chunk of text using the Studio Neural Stream.
 */
export function getAudioStreamUrl(
  text: string,
  lang: 'en' | 'ur',
  voiceId: string,
  apiKey?: string
): string {
  // Never exceed 150 chars to stay safely under Google TTS 200 char threshold
  const safeText = text.slice(0, 150).trim();
  const params = new URLSearchParams({
    text: safeText,
    lang: lang === 'ur' ? 'ur' : 'en',
    voice: voiceId,
  });

  if (apiKey) {
    params.set('apiKey', apiKey);
  }

  return `/api/tts?${params.toString()}`;
}
