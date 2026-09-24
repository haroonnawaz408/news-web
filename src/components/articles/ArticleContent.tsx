import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { slugify } from '@/lib/utils';
import { HeadingItem } from '@/types/article';
import { Maximize2 } from 'lucide-react';

interface ArticleContentProps {
  content: string;
  onHeadingsExtracted?: (headings: HeadingItem[]) => void;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  fontFamily?: 'sans' | 'serif';
  isUrdu?: boolean;
  onImageClick?: (src: string, alt: string) => void;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({
  content,
  onHeadingsExtracted,
  fontSize = 'base',
  fontFamily = 'sans',
  isUrdu = false,
  onImageClick,
}) => {
  // Extract headings for Table of Contents
  React.useEffect(() => {
    if (!content || !onHeadingsExtracted) return;

    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const headings: HeadingItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = slugify(text);
      headings.push({ id, text, level });
    }

    onHeadingsExtracted(headings);
  }, [content, onHeadingsExtracted]);

  const sizeClasses = {
    sm: isUrdu ? 'text-base leading-[2.2]' : 'text-sm sm:text-base leading-relaxed',
    base: isUrdu ? 'text-lg sm:text-xl leading-[2.3]' : 'text-base sm:text-lg leading-[1.8] sm:leading-[1.85]',
    lg: isUrdu ? 'text-xl sm:text-2xl leading-[2.4]' : 'text-lg sm:text-xl leading-[1.85] sm:leading-[1.9]',
    xl: isUrdu ? 'text-2xl sm:text-3xl leading-[2.5]' : 'text-xl sm:text-2xl leading-[1.9] sm:leading-[2]',
  };

  const familyClasses = {
    sans: isUrdu ? 'font-urdu' : 'font-sans',
    serif: isUrdu ? 'font-urdu' : 'font-serif',
  };

  return (
    <div
      dir={isUrdu ? 'rtl' : 'ltr'}
      className={`article-body max-w-[760px] mx-auto text-neutral-800 dark:text-neutral-200 transition-all ${
        sizeClasses[fontSize]
      } ${familyClasses[fontFamily]} ${isUrdu ? 'font-urdu text-right' : ''}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => {
            const text = String(children);
            const id = slugify(text);
            return (
              <h2
                id={id}
                className={`text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white mt-10 mb-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 scroll-mt-24 ${
                  isUrdu ? 'urdu-headline text-right' : 'tracking-tight'
                }`}
              >
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = String(children);
            const id = slugify(text);
            return (
              <h3
                id={id}
                className={`text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-8 mb-3 scroll-mt-24 ${
                  isUrdu ? 'urdu-headline text-right text-lg sm:text-xl' : 'tracking-tight'
                }`}
              >
                {children}
              </h3>
            );
          },
          p: ({ children }) => <p className="mb-6">{children}</p>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-600 dark:border-blue-500 pl-5 my-6 italic text-neutral-700 dark:text-neutral-300 font-serif bg-blue-50/40 dark:bg-blue-950/20 py-3 rounded-r-lg">
              {children}
            </blockquote>
          ),
          img: ({ src, alt }) => (
            <span
              className="block my-6 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm group cursor-pointer relative"
              onClick={() => onImageClick && src && onImageClick(String(src), String(alt || ''))}
            >
              <img
                src={src}
                alt={alt}
                className="w-full object-cover group-hover:scale-101 transition-transform duration-300"
              />
              <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/75 text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md">
                <Maximize2 className="w-3 h-3" />
                Zoom
              </span>
            </span>
          ),
          ul: ({ children }) => <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 font-medium underline underline-offset-4 decoration-blue-500/40 hover:decoration-blue-500 transition-colors"
            >
              {children}
            </a>
          ),
          code: ({ className, children }) => {
            const isBlock = Boolean(className);
            return isBlock ? (
              <div className="my-6 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-lg text-sm font-mono">
                <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <span>Source Code</span>
                  <span className="uppercase text-[10px] tracking-wider text-neutral-500">
                    {className?.replace('language-', '') || 'code'}
                  </span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <code>{children}</code>
                </div>
              </div>
            ) : (
              <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-blue-600 dark:text-blue-400 font-mono text-sm">
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="my-8 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
              <table className="w-full text-left text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold border-b border-neutral-200 dark:border-neutral-700">
              {children}
            </thead>
          ),
          th: ({ children }) => <th className="p-3 text-xs uppercase tracking-wider">{children}</th>,
          td: ({ children }) => (
            <td className="p-3 border-b border-neutral-100 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
