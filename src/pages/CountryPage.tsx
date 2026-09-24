import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getHomepageFeed } from '@/services/posts';
import { Post } from '@/types/article';
import { COUNTRIES, CountryInfo } from '@/context/CountryContext';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { SkeletonCard } from '@/components/common/SkeletonCard';
import { SEO } from '@/components/seo/SEO';
import { Flag, ArrowRight, ChevronRight, Search, Activity, Coins } from 'lucide-react';

export const CountryPage: React.FC = () => {
  const { countryCode = 'pakistan' } = useParams<{ countryCode: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubcat, setSelectedSubcat] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  const countryInfo: CountryInfo = useMemo(() => {
    return (
      COUNTRIES.find((c) => c.code.toLowerCase() === countryCode.toLowerCase()) ||
      COUNTRIES[0]
    );
  }, [countryCode]);

  useEffect(() => {
    async function loadCountryFeed() {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const feed = await getHomepageFeed();
        let pool = feed.allPosts || feed.latest || [];
        
        // Filter strictly for this country if not global
        if (countryInfo.code === 'pakistan') {
          pool = pool.filter((p) => {
            const cat = (p.category || '').toLowerCase();
            const tags = (p.tags || []).map((t) => t.toLowerCase());
            return cat === 'pakistan' || tags.includes('pakistan') || cat === 'politics' || cat === 'sports';
          });
        }
        setPosts(pool);
      } catch (err) {
        console.error('Error loading country posts:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCountryFeed();
  }, [countryInfo]);

  // Client-side instant filter by sub-topic
  const filteredPosts = useMemo(() => {
    let result = posts;
    if (selectedSubcat !== 'All') {
      result = result.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        const target = selectedSubcat.toLowerCase();
        return cat.includes(target) || title.includes(target);
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, selectedSubcat, searchQuery]);

  const displayedPosts = filteredPosts.slice(0, visibleCount);

  const subcategories = countryInfo.code === 'pakistan'
    ? ['All', 'Politics', 'Sports', 'Cricket', 'Business', 'Technology', 'Entertainment']
    : ['All', 'Politics', 'Business', 'Technology', 'World', 'Sports'];

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title={`${countryInfo.name} News Wire — Breaking National & Regional Coverage`}
        description={`Real-time verified news from ${countryInfo.name} covering politics, economy, cricket, business, and national developments.`}
        canonical={`/country/${countryInfo.code}`}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
        <Link to="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-600 dark:text-neutral-300 font-semibold">
          {countryInfo.name}
        </span>
      </nav>

      {/* Country Hub Hero Header */}
      <header className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 to-white dark:from-[#0B0F14] dark:to-neutral-900 p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="text-5xl sm:text-6xl select-none leading-none drop-shadow-sm">
              {countryInfo.flag}
            </span>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
                  {countryInfo.name} News Wire
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                  National Hub
                </span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-2xl leading-relaxed">
                Complete 24/7 verified coverage across politics, cricket, economic indicators, provincial cities, and breaking national developments.
              </p>
            </div>
          </div>

          {/* Quick Pakistan Market / Key Indicator Badge */}
          {countryInfo.code === 'pakistan' && (
            <div className="grid grid-cols-2 gap-2 shrink-0 bg-white dark:bg-neutral-800/80 p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 text-xs">
              <div className="flex items-center gap-1.5 pr-2 border-r border-neutral-100 dark:border-neutral-700">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <div>
                  <span className="text-[10px] text-neutral-400 block">USD / PKR</span>
                  <span className="font-bold font-mono text-neutral-900 dark:text-white">₨278.40</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 pl-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <div>
                  <span className="text-[10px] text-neutral-400 block">Gold Tola</span>
                  <span className="font-bold font-mono text-neutral-900 dark:text-white">₨285.4k</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Pills + Search Bar */}
        <div className="mt-8 pt-6 border-t border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {subcategories.map((subcat) => (
              <button
                key={subcat}
                onClick={() => {
                  setSelectedSubcat(subcat);
                  setVisibleCount(12);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSubcat === subcat
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-600/20'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {subcat === 'All' ? '⚡ All Stories' : subcat === 'Cricket' ? '🏏 Cricket' : subcat}
              </button>
            ))}
          </div>

          {/* Quick Search in Country Wire */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${countryInfo.name} news...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>

      {/* Main Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : displayedPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPosts.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <Flag className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            No articles found matching this filter
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Try choosing "All Stories" or clearing your search query.
          </p>
        </div>
      )}

      {/* Load More Pagination */}
      {visibleCount < filteredPosts.length && (
        <div className="text-center mt-12">
          <button
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-semibold text-neutral-800 dark:text-neutral-100 hover:border-blue-500 transition-all shadow-sm cursor-pointer group"
          >
            <span>Load More {countryInfo.name} News</span>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:text-blue-500 transition-all" />
          </button>
        </div>
      )}

    </div>
  );
};
