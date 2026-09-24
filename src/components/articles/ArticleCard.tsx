import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Bookmark } from 'lucide-react';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { formatRelativeTime, calculateReadingTime } from '@/lib/utils';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Post } from '@/types/article';
import { WhatsAppShareButton } from './WhatsAppShareButton';

interface ArticleCardProps {
  post: Post;
  variant?: 'standard' | 'compact' | 'horizontal';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ post, variant = 'standard' }) => {
  const readTime = calculateReadingTime(post.content);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(post.id);
  const isUrdu = /[\u0600-\u06FF]/.test(post.title);

  if (variant === 'compact') {
    return (
      <article className="group flex items-start gap-4 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0">
        <Link to={`/news/${post.slug}`} className="w-20 h-20 shrink-0 rounded-lg overflow-hidden">
          <OptimizedImage
            src={post.featured_image}
            alt={post.title}
            aspectRatio="square"
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={`/category/${post.category.toLowerCase()}`}
            className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:underline"
          >
            {post.category}
          </Link>
          <h4
            dir={isUrdu ? 'rtl' : 'ltr'}
            className={`text-sm font-bold text-neutral-900 dark:text-white line-clamp-2 mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
              isUrdu ? 'urdu-card-title text-right' : ''
            }`}
          >
            <Link to={`/news/${post.slug}`}>{post.title}</Link>
          </h4>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            {formatRelativeTime(post.created_at)}
          </span>
        </div>
      </article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <article className="group grid grid-cols-1 sm:grid-cols-12 gap-5 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827] hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
        <div className="sm:col-span-4 rounded-lg overflow-hidden">
          <Link to={`/news/${post.slug}`}>
            <OptimizedImage
              src={post.featured_image}
              alt={post.title}
              aspectRatio="video"
              className="w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
        <div className="sm:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                to={`/category/${post.category.toLowerCase()}`}
                className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              >
                {post.category}
              </Link>
              <span className="text-[11px] text-neutral-400">
                {formatRelativeTime(post.created_at)}
              </span>
            </div>
            <h3
              dir={isUrdu ? 'rtl' : 'ltr'}
              className={`text-lg font-bold text-neutral-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 ${
                isUrdu ? 'urdu-card-title text-right' : ''
              }`}
            >
              <Link to={`/news/${post.slug}`}>{post.title}</Link>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-400 pt-3 mt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span>By {post.author_name}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {readTime} min read
            </span>
            {post.views > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {post.views.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Standard 3-column card
  return (
    <article className="group flex flex-col rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827] overflow-hidden hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:-translate-y-1 transition-all duration-300">
      <Link to={`/news/${post.slug}`} className="block relative overflow-hidden aspect-[16/9]">
        <OptimizedImage
          src={post.featured_image}
          alt={post.title}
          aspectRatio="video"
          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-white/90 dark:bg-black/80 backdrop-blur text-blue-600 dark:text-blue-400 shadow-sm">
            {post.category}
          </span>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
          <span>{formatRelativeTime(post.created_at)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {readTime} min read
          </span>
        </div>

        <h3
          dir={isUrdu ? 'rtl' : 'ltr'}
          className={`text-base sm:text-lg font-bold text-neutral-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 ${
            isUrdu ? 'urdu-card-title text-right' : 'leading-snug'
          }`}
        >
          <Link to={`/news/${post.slug}`}>{post.title}</Link>
        </h3>

        <p
          dir={isUrdu ? 'rtl' : 'ltr'}
          className={`text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-4 flex-1 ${
            isUrdu ? 'urdu-lead text-right text-[13px]' : 'leading-relaxed'
          }`}
        >
          {post.excerpt}
        </p>

        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span className="font-medium text-neutral-600 dark:text-neutral-300">
            {post.author_name}
          </span>
          <div className="flex items-center gap-3">
            {post.views > 0 && (
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Eye className="w-3.5 h-3.5" />
                {post.views.toLocaleString()}
              </span>
            )}
            <button
              onClick={() => toggleBookmark(post.id)}
              className={`p-1 rounded-md transition-colors ${
                bookmarked
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              title={bookmarked ? 'Remove from bookmarks' : 'Save for later'}
              aria-label="Bookmark article"
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
            <WhatsAppShareButton
              title={post.title}
              slug={post.slug}
              image={post.featured_image}
              variant="icon"
            />
          </div>
        </div>
      </div>
    </article>
  );
};
