import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchPosts } from '@/services/posts';
import { Post } from '@/types/article';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { SEO } from '@/components/seo/SEO';
import { Sparkles } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(initialQuery);
  const debouncedQuery = useDebounce(inputVal, 300);
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function performSearch() {
      const q = debouncedQuery.trim();
      if (!q) {
        setResults([]);
        setLoading(false);
        setSearchParams({}, { replace: true });
        return;
      }

      setSearchParams({ q }, { replace: true });
      setLoading(true);

      try {
        const found = await searchPosts(q);
        setResults(found);
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [debouncedQuery, setSearchParams]);

  const handleClear = () => {
    setInputVal('');
    setResults([]);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO
        title={debouncedQuery ? `Search results for "${debouncedQuery}"` : 'Search Articles'}
        description="Search through PulseNews Pakistan's complete digital archive for breaking news, national politics, cricket, economy, and world wire."
      />

      <div className="max-w-3xl mx-auto text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight mb-3">
          Search PulseNews Archive
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          Query our full database of verified news, investigative reports, and breaking wire stories across Pakistan and the world.
        </p>

        {/* Search Bar */}
        <SearchBar
          value={inputVal}
          onChange={setInputVal}
          onClear={handleClear}
          isLoading={loading}
        />

        {/* Quick Suggestion Pills */}
        {!debouncedQuery && (
          <div className="flex items-center justify-center flex-wrap gap-2 mt-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Popular:
            </span>
            {['Reasoning Models', 'Silicon Photonics', 'Rust', 'Fusion', 'Zk-SNARKs'].map((term) => (
              <button
                key={term}
                onClick={() => setInputVal(term)}
                className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results View */}
      <SearchResults
        query={debouncedQuery}
        results={results}
        isLoading={loading}
        onReset={handleClear}
      />
    </div>
  );
};
