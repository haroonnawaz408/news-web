import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES } from '@/lib/constants';
import { Search, X, ChevronRight } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div className="relative w-4/5 max-w-xs ml-auto h-full bg-white dark:bg-[#0B0F14] border-l border-neutral-200 dark:border-neutral-800 flex flex-col justify-between shadow-2xl p-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Navigation</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Search */}
          <Link
            to="/search"
            onClick={onClose}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-sm font-medium"
          >
            <Search className="w-4 h-4 text-neutral-400" />
            <span>Search articles...</span>
          </Link>

          {/* Category List */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-2 block mb-2">
              Categories
            </span>
            {CATEGORIES.map((cat) => {
              const isActive = location.pathname === `/category/${cat.slug}`;
              return (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span>{cat.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 opacity-60" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1 pt-2">
            <Link to="/about" onClick={onClose} className="hover:underline">About</Link>
            <Link to="/contact" onClick={onClose} className="hover:underline">Contact</Link>
            <Link to="/privacy" onClick={onClose} className="hover:underline">Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

