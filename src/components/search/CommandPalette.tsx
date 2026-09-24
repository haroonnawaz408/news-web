import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, X, FileText, CornerDownLeft } from 'lucide-react';
import { getAllPostsAdmin } from '@/services/posts';
import { Post } from '@/types/article';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Fetch posts for instantaneous client-side spotlight searching
  useEffect(() => {
    async function loadData() {
      try {
        const all = await getAllPostsAdmin();
        setPosts(all.filter((p) => p.status === 'published'));
      } catch {
        // fallback handled in service
      }
    }
    loadData();
  }, []);

  // Autofocus input on open & lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setSelectedIndex(0);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Filter posts
  const filtered = React.useMemo(() => {
    if (!query.trim()) {
      return posts.slice(0, 5); // Show top 5 when empty
    }
    const q = query.toLowerCase();
    return posts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query, posts]);

  // Arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        navigate(`/news/${filtered[selectedIndex].slug}`);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Spotlight Command Search"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0E131B] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#0B0F14]/50">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search AI breakthroughs, semiconductors, quantum, stories... (Press Esc to exit)"
            className="flex-1 bg-transparent text-sm sm:text-base text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-200/80 dark:bg-neutral-800 text-neutral-500">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-neutral-100 dark:divide-neutral-800/40">
          {filtered.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                <span>{query ? 'Matched Articles' : 'Trending Stories'}</span>
                <span className="font-mono text-[10px]">{filtered.length} Results</span>
              </div>

              {filtered.map((item, idx) => {
                const isSelected = selectedIndex === idx;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigate(`/news/${item.slug}`);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                        : 'hover:bg-neutral-100/70 dark:hover:bg-neutral-850/50 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.featured_image}
                        alt={item.title}
                        className="w-11 h-11 rounded-lg object-cover shrink-0 border border-neutral-200 dark:border-neutral-800"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                            {item.category}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold truncate">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isSelected && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                          <span>Read</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-neutral-400">
              <FileText className="w-8 h-8 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
              <p className="font-medium text-neutral-600 dark:text-neutral-300">
                No matching stories found for "{query}"
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Try searching for keywords like "AI", "Quantum", "Semiconductor", or "Fusion".
              </p>
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#070A0E] flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-mono">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-mono">↵</kbd>
              <span>to select</span>
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
            <Sparkles className="w-3 h-3" />
            TechPulse Spotlight
          </span>
        </div>
      </div>
    </div>
  );
};
