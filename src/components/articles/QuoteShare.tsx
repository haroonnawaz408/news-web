import React, { useState } from 'react';
import { Quote, Twitter, Linkedin, Copy, Check } from 'lucide-react';

interface QuoteShareProps {
  quote: string;
  author?: string;
  sourceUrl?: string;
}

export const QuoteShare: React.FC<QuoteShareProps> = ({ quote, author, sourceUrl }) => {
  const [copied, setCopied] = useState(false);

  const currentUrl = sourceUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${quote}" ${author ? `— ${author}` : ''} via TechPulse (${currentUrl})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`"${quote}"\n\n`);
    const url = encodeURIComponent(currentUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}&via=techpulse`, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(currentUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative my-8 p-6 rounded-2xl border-l-4 border-l-blue-600 border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 backdrop-blur-xs">
      <Quote className="w-8 h-8 text-blue-600/30 dark:text-blue-400/30 mb-2" />
      <blockquote className="text-base sm:text-lg italic font-serif text-neutral-800 dark:text-neutral-200 leading-relaxed mb-4">
        "{quote}"
      </blockquote>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-200/70 dark:border-neutral-800 text-xs">
        {author && (
          <span className="font-semibold text-neutral-600 dark:text-neutral-400">
            — {author}
          </span>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            title="Copy quote"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleTwitterShare}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-colors"
            title="Share quote on X / Twitter"
          >
            <Twitter className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleLinkedInShare}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors"
            title="Share quote on LinkedIn"
          >
            <Linkedin className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
