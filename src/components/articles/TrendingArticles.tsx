import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Eye } from 'lucide-react';
import { Post } from '@/types/article';
import { formatRelativeTime } from '@/lib/utils';

interface TrendingArticlesProps {
  posts: Post[];
  title?: string;
}

export const TrendingArticles: React.FC<TrendingArticlesProps> = ({
  posts,
  title = 'Most Read',
}) => {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827] p-5">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-neutral-100 dark:border-neutral-800">
        <Flame className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
          {title}
        </h3>
      </div>

      <div className="space-y-4">
        {posts.slice(0, 5).map((post, idx) => (
          <article key={post.id} className="group flex items-start gap-4">
            {/* Number 01 - 05 */}
            <span className="font-mono text-2xl font-black text-neutral-300 dark:text-neutral-700 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-none select-none pt-0.5 w-7 shrink-0 text-right">
              {idx < 9 ? `0${idx + 1}` : idx + 1}
            </span>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                {post.category}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                <Link to={`/news/${post.slug}`}>{post.title}</Link>
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                <span>{formatRelativeTime(post.created_at)}</span>
                {post.views > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views.toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
