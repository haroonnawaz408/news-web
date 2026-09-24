import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  placeholder?: string;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search by keywords, models, technologies or categories...',
  isLoading = false,
}) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
        <Search className="w-5 h-5" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827] text-neutral-900 dark:text-white placeholder:text-neutral-400 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        autoFocus
      />

      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-2">
        {isLoading && (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        )}

        {value && !isLoading && (
          <button
            onClick={onClear}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
            aria-label="Clear search input"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
