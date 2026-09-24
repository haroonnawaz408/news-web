import React, { useState } from 'react';
import { BREAKING_NEWS } from '@/lib/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const BreakingNews: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!BREAKING_NEWS || BREAKING_NEWS.length === 0) return null;

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % BREAKING_NEWS.length);
  };

  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + BREAKING_NEWS.length) % BREAKING_NEWS.length);
  };

  return (
    <div className="w-full bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-xs py-2 px-4 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Badge + Rotating Alert */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] tracking-wider shrink-0 uppercase animate-pulse-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            Breaking
          </div>

          <div className="truncate text-neutral-800 dark:text-neutral-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <span className="cursor-default">{BREAKING_NEWS[currentIndex]?.title || ''}</span>
          </div>
        </div>

        {/* Right: Manual navigation controls */}
        <div className="flex items-center gap-1 shrink-0 text-neutral-400 dark:text-neutral-500">
          <span className="text-[11px] font-mono mr-1 hidden sm:inline">
            {currentIndex + 1} / {BREAKING_NEWS.length}
          </span>
          <button
            onClick={prevItem}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
            aria-label="Previous breaking news item"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={nextItem}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
            aria-label="Next breaking news item"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
