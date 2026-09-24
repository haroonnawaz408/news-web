/**
 * High-performance, production-grade Urdu Translation Engine for TechPulse.
 * Features:
 * - Dynamic neural translation via high-speed API
 * - LocalStorage + In-memory caching for 0ms re-renders
 * - Markdown & code fence preservation
 * - Offline fallback dictionary with extensive technical terms
 */

const TRANSLATION_CACHE_KEY_PREFIX = 'techpulse_ur_cache_';
const memoryCache = new Map<string, string>();

/**
 * Technical terms glossary for offline fallback or domain-specific preservation
 */
const TECH_GLOSSARY: Record<string, string> = {
  'Artificial Intelligence': 'مصنوعی ذہانت (AI)',
  'AI': 'مصنوعی ذہانت',
  'Machine Learning': 'مشین لرننگ',
  'Deep Learning': 'ڈیپ لرننگ',
  'Neural Network': 'نیورل نیٹ ورک',
  'Autonomous Reasoning': 'خود مختار استدلال',
  'Software Engineering': 'سافٹ ویئر انجینئرنگ',
  'Semiconductors': 'سیمی کنڈکٹرز',
  'Silicon Photonics': 'سلیکان فوٹونکس',
  'Process Nodes': 'پروسیس نوڈز',
  'Nuclear Fusion': 'نیوکلیئر فیوژن',
  'Superconducting': 'سپر کنڈکٹنگ',
  'Quantum Computing': 'کوانٹم کمپیوٹنگ',
  'Cybersecurity': 'سائبر سیکیورٹی',
  'Cryptocurrency': 'کرپٹو کرنسی',
  'Datacenter': 'ڈیٹا سینٹر',
  'Infrastructure': 'انفراسٹرکچر',
  'Startups': 'اسٹارٹ اپس',
};

/**
 * Translates a single text string (sentence or paragraph) from English to Urdu.
 */
export async function translateTextToUrdu(text: string): Promise<string> {
  if (!text || !text.trim()) return '';

  const cacheKey = TRANSLATION_CACHE_KEY_PREFIX + text.trim().slice(0, 80);

  // 1. Check in-memory cache
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  // 2. Check localStorage cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      memoryCache.set(cacheKey, cached);
      return cached;
    }
  } catch {
    // ignore storage quota issues
  }

  // 3. Perform dynamic translation via Google Translate gtx endpoint
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ur&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Translation network request failed');

    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0].map((item: unknown[]) => item[0]).join('');

      if (translated) {
        memoryCache.set(cacheKey, translated);
        try {
          localStorage.setItem(cacheKey, translated);
        } catch {
          // ignore
        }
        return translated;
      }
    }
  } catch (err) {
    console.warn('Network translation unavailable, utilizing local glossary fallback:', err);
  }

  // 4. Fallback: Glossary keyword translation
  let fallback = text;
  Object.entries(TECH_GLOSSARY).forEach(([en, ur]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    fallback = fallback.replace(regex, ur);
  });

  return fallback;
}

export interface TranslatedArticleData {
  title: string;
  excerpt: string;
  content: string;
}

/**
 * Translates an entire article while preserving Markdown structure (headers, lists, quotes, code).
 */
export async function translateArticle(
  title: string,
  excerpt: string,
  content: string
): Promise<TranslatedArticleData> {
  // Translate title and excerpt concurrently
  const [translatedTitle, translatedExcerpt] = await Promise.all([
    translateTextToUrdu(title),
    translateTextToUrdu(excerpt),
  ]);

  // Split markdown into lines/paragraphs to preserve code blocks and markdown headings
  const lines = content.split('\n');
  const translatedLines: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    // Preserve code blocks verbatim
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      translatedLines.push(line);
      continue;
    }
    if (inCodeBlock) {
      translatedLines.push(line);
      continue;
    }

    // Preserve empty lines
    if (!line.trim()) {
      translatedLines.push('');
      continue;
    }

    // Preserve Markdown Heading levels (#, ##, ###)
    const headingMatch = line.match(/^(#{1,6}\s+)(.*)$/);
    if (headingMatch) {
      const prefix = headingMatch[1];
      const headingText = headingMatch[2];
      const transH = await translateTextToUrdu(headingText);
      translatedLines.push(`${prefix}${transH}`);
      continue;
    }

    // Preserve blockquotes (>)
    const quoteMatch = line.match(/^>\s+(.*)$/);
    if (quoteMatch) {
      const quoteText = quoteMatch[1];
      const transQ = await translateTextToUrdu(quoteText);
      translatedLines.push(`> ${transQ}`);
      continue;
    }

    // Preserve unordered list bullets (- or *)
    const listMatch = line.match(/^([\s]*[-*+]\s+)(.*)$/);
    if (listMatch) {
      const prefix = listMatch[1];
      const itemText = listMatch[2];
      const transItem = await translateTextToUrdu(itemText);
      translatedLines.push(`${prefix}${transItem}`);
      continue;
    }

    // Standard prose line
    const transLine = await translateTextToUrdu(line);
    translatedLines.push(transLine);
  }

  return {
    title: translatedTitle,
    excerpt: translatedExcerpt,
    content: translatedLines.join('\n'),
  };
}
