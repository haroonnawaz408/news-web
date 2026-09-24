import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostsByCategory } from '@/services/posts';
import { Post } from '@/types/article';
import { CATEGORIES } from '@/lib/constants';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { SkeletonCard } from '@/components/common/SkeletonCard';
import { EmptyState } from '@/components/common/EmptyState';
import { SEO } from '@/components/seo/SEO';
import { ChevronRight, ArrowRight } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { category = '' } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const PAGE_SIZE = 12;

  // Find category metadata
  const categoryInfo = CATEGORIES.find(
    (c) => c.slug.toLowerCase() === category.toLowerCase()
  ) || {
    name: category.charAt(0).toUpperCase() + category.slice(1),
    slug: category,
    description: `Latest insights, breaking developments, and analysis on ${category}.`,
    color: 'blue',
  };

  useEffect(() => {
    async function loadCategoryPosts() {
      setLoading(true);
      setPage(1);
      window.scrollTo(0, 0);

      try {
        const res = await getPostsByCategory(categoryInfo.name, PAGE_SIZE, 0);
        setPosts(res.posts);
        setTotal(res.total);
      } catch (err) {
        console.error('Error loading category posts:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCategoryPosts();
  }, [category, categoryInfo.name]);

  const handleLoadMore = async () => {
    if (loadingMore || posts.length >= total) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const offset = (nextPage - 1) * PAGE_SIZE;

    try {
      const res = await getPostsByCategory(categoryInfo.name, PAGE_SIZE, offset);
      setPosts((prev) => [...prev, ...res.posts]);
      setPage(nextPage);
    } catch (err) {
      console.error('Error loading more category posts:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title={`${categoryInfo.name} News & Analysis | Latest ${categoryInfo.name} Headlines`}
        description={`Get the latest ${categoryInfo.name} news, breaking stories, and in-depth analysis. Stay updated with real-time ${categoryInfo.name} coverage from Pakistan and around the world.`}
        canonical={`https://pulsenews.pk/category/${category}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: categoryInfo.name, url: `/category/${category}` },
        ]}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
        <Link to="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-600 dark:text-neutral-300 capitalize">
          {categoryInfo.name}
        </span>
      </nav>

      {/* Category Header */}
      <header className="pb-8 mb-8 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-2">
              Domain Coverage
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              {categoryInfo.name}
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mt-2 leading-relaxed">
              {categoryInfo.description}
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400 shrink-0">
            {total} Stories Published
          </span>
        </div>
      </header>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title={`No Articles in ${categoryInfo.name} Yet`}
          description="Our editorial team is currently drafting investigations for this category. Check back soon!"
          actionText="Browse All News"
          actionHref="/"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>


          {/* Load More Pagination */}
          {posts.length < total && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-semibold text-neutral-800 dark:text-neutral-100 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm cursor-pointer disabled:opacity-50 group"
              >
                {loadingMore ? (
                  <div className="w-4 h-4 border-2 border-neutral-400 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Load More {categoryInfo.name} Articles</span>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
