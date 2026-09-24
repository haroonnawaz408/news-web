import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getHomepageFeed, getLatestPosts, getCached, HomepageFeedData } from '@/services/posts';
import { Post } from '@/types/article';
import { FeaturedArticle } from '@/components/articles/FeaturedArticle';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { TrendingRankedList } from '@/components/articles/TrendingRankedList';
import { InteractivePollWidget } from '@/components/common/InteractivePollWidget';
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup';
import { FeaturedSkeleton, SkeletonCard } from '@/components/common/SkeletonCard';
import { LiveUpdateBanner } from '@/components/layout/LiveUpdateBanner';
import { useLiveRefresh } from '@/hooks/useLiveRefresh';
import { SEO } from '@/components/seo/SEO';
import { CATEGORIES } from '@/lib/constants';
import { useCountry } from '@/context/CountryContext';
import { Sparkles, ArrowRight, Layers, Landmark, Trophy, Briefcase, Flag, Clock } from 'lucide-react';

export const Home: React.FC = () => {
  // Read instant cache if available for immediate 0ms render
  const initialCache = getCached<HomepageFeedData>('homepage_feed_v7_pakistan_first');
  const { isPakistan, currentCountry } = useCountry();

  const [featuredPost, setFeaturedPost] = useState<Post | null>(initialCache?.featured || null);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>(initialCache?.trending || []);
  const [latestPosts, setLatestPosts] = useState<Post[]>(initialCache?.latest || []);
  const [allFeedPosts, setAllFeedPosts] = useState<Post[]>(initialCache?.allPosts || []);
  const [pakistanPosts, setPakistanPosts] = useState<Post[]>(initialCache?.pakistan || []);
  const [politicsPosts, setPoliticsPosts] = useState<Post[]>(initialCache?.politics || []);
  const [sportsPosts, setSportsPosts] = useState<Post[]>(initialCache?.sports || []);
  const [businessPosts, setBusinessPosts] = useState<Post[]>(initialCache?.business || []);
  const [aiPosts, setAiPosts] = useState<Post[]>(initialCache?.ai || []);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [totalPosts, setTotalPosts] = useState(initialCache?.total || 0);
  const [loading, setLoading] = useState(!initialCache);
  const [loadingMore, setLoadingMore] = useState(false);

  // --- Live Refresh callback ---
  const handleFeedUpdate = useCallback((feed: HomepageFeedData) => {
    setFeaturedPost(feed.featured);
    setTrendingPosts(feed.trending);
    setLatestPosts(feed.latest);
    setAllFeedPosts(feed.allPosts || []);
    setTotalPosts(feed.total);
    setPakistanPosts(feed.pakistan);
    setPoliticsPosts(feed.politics);
    setSportsPosts(feed.sports);
    setBusinessPosts(feed.business);
    setAiPosts(feed.ai);
  }, []);

  const { secondsUntilRefresh, isRefreshing, newArticleCount, showBanner, triggerRefresh, dismissBanner, lastUpdated } =
    useLiveRefresh(handleFeedUpdate);

  useEffect(() => {
    async function loadInitialData() {
      if (!initialCache) {
        setLoading(true);
      }
      try {
        const feed = await getHomepageFeed();
        handleFeedUpdate(feed);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [handleFeedUpdate]);

  // Lightning fast 0ms client-side filter across the full in-memory article pool
  const displayedPosts = React.useMemo(() => {
    if (selectedCategory === 'All') {
      return latestPosts;
    }
    const pool = allFeedPosts.length > 0 ? allFeedPosts : latestPosts;
    return pool.filter(
      (p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory, latestPosts, allFeedPosts]);

  const handleLoadMore = async () => {
    if (loadingMore || latestPosts.length >= totalPosts) return;

    setLoadingMore(true);
    const currentCount = latestPosts.length;

    // Instant 0ms memory slice if more articles are already pre-cached
    if (allFeedPosts.length > currentCount) {
      const nextBatch = allFeedPosts.slice(currentCount, currentCount + 12);
      setLatestPosts((prev) => [...prev, ...nextBatch]);
      setLoadingMore(false);
      return;
    }

    try {
      const res = await getLatestPosts(12, currentCount);
      setLatestPosts((prev) => [...prev, ...res.posts]);
    } catch (err) {
      console.error('Error loading more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Breaking Wire: articles published in the last 30 minutes
  const breakingWirePosts = React.useMemo(() => {
    const cutoff = Date.now() - 30 * 60 * 1000;
    return allFeedPosts
      .filter(p => new Date(p.created_at).getTime() > cutoff)
      .slice(0, 3);
  }, [allFeedPosts]);

  // 80/20 Pakistan-first display pool (worldPool reserved for future World section)

  return (
    <div className="min-h-screen">
      <LiveUpdateBanner
        show={showBanner}
        newCount={newArticleCount}
        secondsLeft={secondsUntilRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        onRefresh={triggerRefresh}
        onDismiss={dismissBanner}
      />
      <SEO
        title={
          isPakistan
            ? 'PulseNews Pakistan — Breaking National, Cricket & Political Headlines'
            : `${currentCountry.name} & Global News Wire — PulseNews`
        }
        description="Comprehensive 24/7 verified journalism tracking national politics, cricket dispatches, inflation indicators, and international developments."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <FeaturedSkeleton />
        ) : featuredPost ? (
          <FeaturedArticle featured={featuredPost} trending={trendingPosts} />
        ) : null}


        {/* Main Content + Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-10">
          
          {/* Main Feed: 8 Cols */}
          <main className="lg:col-span-8 space-y-12">

            {/* ===== BREAKING WIRE STRIP (Last 30 min) ===== */}
            {breakingWirePosts.length > 0 && (
              <section aria-label="Breaking Wire">
                <div className="flex items-center gap-2 mb-3">
                  <span className="live-dot-pulse" />
                  <span className="text-xs font-bold text-red-500 tracking-widest uppercase">Breaking Wire</span>
                  <span className="text-xs text-neutral-400 ml-1">— abhi abhi</span>
                </div>
                <div className="space-y-2">
                  {breakingWirePosts.map(post => (
                    <Link
                      key={post.id}
                      to={`/news/${post.slug}`}
                      className="breaking-wire-card flex items-start gap-3 group"
                    >
                      {post.featured_image && (
                        <img
                          src={post.featured_image}
                          alt=""
                          className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div>
                        <span className="pk-badge mb-1">{post.category}</span>
                        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 leading-snug line-clamp-2">
                          {post.title}
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(post.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                          {post.source_name && <> · {post.source_name}</>}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Pakistan National Wire Section (Top Priority — 80% Focus) */}
            {pakistanPosts.length > 0 && (
              <section aria-label="Pakistan National Wire" className="rounded-2xl border border-emerald-500/25 bg-emerald-950/5 dark:bg-emerald-950/20 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
                      <Flag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-neutral-950 dark:text-white tracking-tight">
                          Pakistan National Wire
                        </h2>
                        <span className="pk-badge">80% focus</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                          🇵🇰 National Lead
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Dawn, The Express Tribune, ARY News, Samaa TV — Verified Dispatches
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/country/pakistan"
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    All Pakistan Hub →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {pakistanPosts.slice(0, 12).map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}
            
            {/* Latest News Grid with Instant Filter Pills */}
            <section aria-label="Latest News Wire">
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                    Latest Dispatches
                  </h2>
                </div>
                <span className="text-xs text-neutral-400 font-mono">
                  {totalPosts} Articles Available
                </span>
              </div>

              {/* Instant Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
                {['All', 'Pakistan', 'Politics', 'Sports', 'Business', 'Technology', 'World', 'AI', 'Entertainment'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? cat === 'Pakistan'
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25 ring-2 ring-emerald-600/20'
                          : 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-600/20'
                        : cat === 'Pakistan'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                        : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {cat === 'All' ? '⚡ All News' : cat === 'Pakistan' ? '🇵🇰 Pakistan' : cat === 'Sports' ? '🏏 Cricket & Sports' : cat}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {displayedPosts.map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                  {displayedPosts.length === 0 && (
                    <div className="col-span-full py-10 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Explore full {selectedCategory} archives in the dedicated section below or visit{' '}
                        <Link to={`/category/${selectedCategory.toLowerCase()}`} className="text-blue-600 font-semibold underline">
                          {selectedCategory} Page →
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Load More Pagination */}
              {latestPosts.length < totalPosts && (
                <div className="text-center mt-10">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-semibold text-neutral-800 dark:text-neutral-100 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm cursor-pointer disabled:opacity-50 group"
                  >
                    {loadingMore ? (
                      <div className="w-4 h-4 border-2 border-neutral-400 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Load More Articles</span>
                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </section>


            {/* 🏏 Cricket & Sports Arena Section */}
            {sportsPosts.length > 0 && (
              <section aria-label="Sports Arena">
                <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-neutral-950 dark:text-white tracking-tight">
                        🏏 Cricket Central & Sports Arena
                      </h2>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        PCB, PSL, Babar Azam, Champions Trophy, match results, and global sports
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/category/sports"
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    All Sports →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sportsPosts.map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* 🏛️ Politics & Governance Section */}
            {politicsPosts.length > 0 && (
              <section aria-label="Politics and Policy">
                <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-neutral-950 dark:text-white tracking-tight">
                        Politics & State Affairs
                      </h2>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        National Assembly, Supreme Court verdicts, cabinet rulings, and political diplomacy
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/category/politics"
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                  >
                    All Politics →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {politicsPosts.map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* 💰 Economy, Markets & Pocket Watch */}
            {businessPosts.length > 0 && (
              <section aria-label="Business and Economy">
                <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-neutral-950 dark:text-white tracking-tight">
                        Economy, Inflation & Markets
                      </h2>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        IMF reviews, fuel pricing, gold rates, PSX movements, and global trade
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/category/business"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    All Business →
                  </Link>
                </div>

                <div className="space-y-4">
                  {businessPosts.map((post) => (
                    <ArticleCard key={post.id} post={post} variant="horizontal" />
                  ))}
                </div>
              </section>
            )}

            {/* Frontier AI & Technology Section */}
            {aiPosts.length > 0 && (
              <section aria-label="AI Special Report">
                <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-neutral-950 dark:text-white tracking-tight">
                        Frontier Tech & AI
                      </h2>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Autonomous models, neural computing, PTA 5G trials, and software startups
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/category/technology"
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
                  >
                    All Tech →
                  </Link>
                </div>

                <div className="space-y-4">
                  {aiPosts.map((post) => (
                    <ArticleCard key={post.id} post={post} variant="horizontal" />
                  ))}
                </div>
              </section>
            )}

            {/* Mid-Page Newsletter Section */}
            <NewsletterSignup variant="card" />

          </main>

          {/* Sidebar: 4 Cols */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Top 7 Ranked Trending Stories with Numeral Countdowns */}
            <TrendingRankedList posts={trendingPosts.length > 0 ? trendingPosts : latestPosts} />

            {/* Interactive Community Pulse Poll */}
            <InteractivePollWidget />


            {/* Sidebar Compact Newsletter */}
            <NewsletterSignup variant="sidebar" />

            {/* Popular Categories Widget */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827] p-5 shadow-2xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800">
                Explore Domains
              </h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>


          </aside>

        </div>
      </div>
    </div>
  );
};
