import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface KeyTakeawaysProps {
  excerpt?: string;
  content: string;
  isUrdu?: boolean;
}

/**
 * Strips markdown symbols, datelines, and code syntax into pure readable text.
 */
function cleanProse(raw: string): string {
  if (!raw) return '';
  return raw
    // Remove datelines like ISLAMABAD — or KARACHI —
    .replace(/^[A-Z\s]{3,20}\s*[-—–]\s*/i, '')
    .replace(/^[\u0600-\u06FF\s]{3,25}\s*[-—–]\s*/, '')
    // Remove Markdown links
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Remove Markdown images
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    // Remove bold/italics
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    // Remove any remaining stray markdown characters
    .replace(/[*_~`#]/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquotes / list marks
    .replace(/^[>\s*+-]+\s*/gm, '')
    // Remove raw URLs
    .replace(/https?:\/\/\S+/gi, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Collapse spaces
    .replace(/\s+/g, ' ')
    .trim();
}

export const KeyTakeaways: React.FC<KeyTakeawaysProps> = ({
  excerpt = '',
  content,
  isUrdu = false,
}) => {
  // Detect Urdu if either prop is true or text is heavily Arabic/Urdu script
  const detectedUrdu = isUrdu || /[\u0600-\u06FF]/.test(excerpt || content.slice(0, 200));

  // Extract 3 substantive, clean takeaways
  const takeaways = React.useMemo(() => {
    const list: string[] = [];

    // 1. Process excerpt first (split if it has 2 sentences)
    if (excerpt && excerpt.trim()) {
      const cleanExcerpt = cleanProse(excerpt);
      const excerptSentences = cleanExcerpt.match(/[^.!?۔؟]+[.!?۔؟]+/g) || [cleanExcerpt];
      for (const s of excerptSentences) {
        const t = s.trim();
        if (t.length >= 35 && !list.includes(t)) {
          list.push(t);
          if (list.length >= 2) break;
        }
      }
    }

    // 2. Extract substantive sentences from the content body (EXCLUDING HEADINGS)
    // Strip out code blocks and markdown headings first so headings are NEVER bullets
    const bodyOnly = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/^#{1,6}\s+.*$/gm, '') // Remove all # headings completely
      .replace(/^[-*_]{3,}\s*$/gm, '');

    const rawSentences = bodyOnly.match(/[^.!?۔؟\n]+[.!?۔؟]+(?:\s+|$)/g) || [];

    for (const raw of rawSentences) {
      const clean = cleanProse(raw);
      // Filter for substantive sentence length (not too short, not a run-on block)
      if (
        clean.length >= 50 &&
        clean.length <= 180 &&
        !list.some((existing) => existing.includes(clean) || clean.includes(existing))
      ) {
        list.push(clean);
        if (list.length >= 3) break;
      }
    }

    // Fallback if content was unusually formatted
    if (list.length === 0 && excerpt) {
      list.push(cleanProse(excerpt));
    }

    return list.slice(0, 3);
  }, [excerpt, content]);

  if (takeaways.length === 0) return null;

  return (
    <div
      dir={detectedUrdu ? 'rtl' : 'ltr'}
      className={`rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/70 via-indigo-50/20 to-transparent dark:from-blue-950/20 dark:via-neutral-900/60 dark:to-neutral-950 p-5 sm:p-6 my-8 shadow-xs transition-all ${
        detectedUrdu ? 'text-right' : 'text-left'
      }`}
    >
      <div className={`flex items-center gap-2.5 mb-4 ${detectedUrdu ? 'flex-row-reverse justify-end' : ''}`}>
        <div className="w-7 h-7 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3
            className={`text-sm font-bold text-neutral-950 dark:text-white uppercase tracking-wider ${
              detectedUrdu ? 'font-urdu text-base' : ''
            }`}
          >
            {detectedUrdu ? 'فوری خلاصہ اور اہم نکات' : 'Executive Brief & Key Takeaways'}
          </h3>
          <span
            className={`text-[11px] text-neutral-500 dark:text-neutral-400 block ${
              detectedUrdu ? 'font-urdu text-xs mt-0.5' : ''
            }`}
          >
            {detectedUrdu
              ? 'اہم ترین حقائق اور مصدقہ پیش رفت کا خلاصہ'
              : 'Confirmed developments & core intelligence'}
          </span>
        </div>
      </div>

      <ul className="space-y-3 text-sm text-neutral-700 dark:text-neutral-200">
        {takeaways.map((item, idx) => (
          <li
            key={idx}
            className={`flex items-start gap-2.5 leading-relaxed ${
              detectedUrdu ? 'flex-row-reverse text-right font-urdu text-[15px] leading-loose' : ''
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
