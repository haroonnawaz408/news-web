import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '@/types/article';
import { ArrowRight, X, Sparkles } from 'lucide-react';

interface NextStoryDockProps {
  nextPost?: Post | null;
}

export const NextStoryDock: React.FC<NextStoryDockProps> = ({ nextPost }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!nextPost || isDismissed) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Trigger when user scrolls past 60% of the article
      if (totalHeight > 0 && scrollY / totalHeight >= 0.55) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [nextPost, isDismissed]);

  if (!nextPost || !isVisible || isDismissed) return null;

  return (
    <div
      className="fixed bottom-5 right-5 sm:right-8 z-40 max-w-sm w-[calc(100vw-2.5rem)] rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white/95 dark:bg-[#0E131B]/95 backdrop-blur-md shadow-2xl p-4 animate-in slide-in-from-bottom-6 fade-in duration-300 transition-all"
      role="complementary"
      aria-label="Next Recommended Story"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          <Sparkles className="w-3 h-3" />
          <span>Up Next • {nextPost.category}</span>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Dismiss next story recommendation"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <Link
        to={`/news/${nextPost.slug}`}
        className="flex items-center gap-3 group"
        onClick={() => window.scrollTo(0, 0)}
      >
        <img
          src={nextPost.featured_image}
          alt={nextPost.title}
          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-neutral-800 group-hover:scale-105 transition-transform"
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {nextPost.title}
          </h4>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1">
            Read Story
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </Link>
    </div>
  );
};
