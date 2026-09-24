import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, TrendingUp } from 'lucide-react';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { formatRelativeTime, calculateReadingTime } from '@/lib/utils';
import { Post } from '@/types/article';

interface FeaturedArticleProps {
  featured: Post;
  trending: Post[];
}

export const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ featured, trending }) => {
  const readTime = calculateReadingTime(featured.content);

  const isUrdu = /[\u0600-\u06FF]/.test(featured.title);

  return (
    <section className="my-6 lg:my-8" aria-label="Hero Spotlight and Trending Coverage">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left: Dominant Featured Article (8 cols) */}
        <div className="lg:col-span-8 flex flex-col group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827] overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300">
          <Link to={`/news/${featured.slug}`} className="block relative aspect-[16/9] overflow-hidden">
            <OptimizedImage
              src={featured.featured_image}
              alt={featured.title}
              aspectRatio="video"
              className="w-full h-full group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md ${
                featured.category.toLowerCase() === 'pakistan'
                  ? 'bg-emerald-600 text-white shadow-emerald-950/40'
                  : 'bg-blue-600 text-white'
              }`}>
                {featured.category.toLowerCase() === 'pakistan' ? '🇵🇰 Pakistan Breaking' : featured.category}
              </span>
            </div>
          </Link>

          <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between">
            <div>
              <div className="flex items-center gap-3 text-xs text-neutral-400 mb-3">
                <span className="font-medium text-neutral-900 dark:text-neutral-200">
                  By {featured.author_name}
                </span>
                <span>•</span>
                <span>{formatRelativeTime(featured.created_at)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {readTime} min read
                </span>
              </div>

              <h2
                dir={isUrdu ? 'rtl' : 'ltr'}
                className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-4 ${
                  isUrdu ? 'urdu-headline text-right' : 'tracking-tight leading-tight'
                }`}
              >
                <Link to={`/news/${featured.slug}`}>{featured.title}</Link>
              </h2>

              <p
                dir={isUrdu ? 'rtl' : 'ltr'}
                className={`text-sm sm:text-base text-neutral-600 dark:text-neutral-300 line-clamp-3 mb-6 ${
                  isUrdu ? 'urdu-lead text-right' : 'leading-relaxed'
                }`}
              >
                {featured.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {featured.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <Link
                to={`/news/${featured.slug}`}
                className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center gap-1"
              >
                Read Analysis →
              </Link>
            </div>
          </div>
        </div>

        {/* Right: 3 Trending Sub-Features (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white font-bold text-sm tracking-wider uppercase">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Trending Stories</span>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {trending.slice(0, 3).map((post, idx) => (
              <article
                key={post.id}
                className="group flex gap-4 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827] hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex-1"
              >
                <Link to={`/news/${post.slug}`} className="w-24 h-24 shrink-0 rounded-lg overflow-hidden relative">
                  <OptimizedImage
                    src={post.featured_image}
                    alt={post.title}
                    aspectRatio="square"
                    className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1 left-1 w-5 h-5 rounded bg-black/70 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                    0{idx + 1}
                  </div>
                </Link>

                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      post.category.toLowerCase() === 'pakistan'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      {post.category.toLowerCase() === 'pakistan' ? '🇵🇰 Pakistan' : post.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mt-1 leading-snug">
                      <Link to={`/news/${post.slug}`}>{post.title}</Link>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-2">
                    <span>{formatRelativeTime(post.created_at)}</span>
                    <span>•</span>
                    <span>{calculateReadingTime(post.content)}m read</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
