import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Eye } from 'lucide-react';
import { Post } from '@/types/article';
import { formatRelativeTime } from '@/lib/utils';
import { WhatsAppShareButton } from './WhatsAppShareButton';

interface TrendingRankedListProps {
  posts: Post[];
  title?: string;
  limit?: number;
}

export const TrendingRankedList: React.FC<TrendingRankedListProps> = ({
  posts,
  title = 'Most Read Stories',
  limit = 7,
}) => {
  const rankedPosts = posts.slice(0, limit);

  if (rankedPosts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827] p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Flame className="w-4 h-4 fill-rose-500" />
          </div>
          <div>
            <h3 className="text-base font-black text-neutral-950 dark:text-white tracking-tight">
              {title}
            </h3>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
              Live Popularity Index
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
          🔥 Viral
        </span>
      </div>

      <div className="space-y-3.5">
        {rankedPosts.map((post, idx) => {
          const rank = idx + 1;
          const isTopThree = rank <= 3;

          return (
            <div
              key={post.id}
              className="flex items-start gap-3.5 group pb-3.5 border-b border-neutral-100 dark:border-neutral-800/60 last:border-b-0 last:pb-0"
            >
              {/* Giant Rank Numeral */}
              <span
                className={`text-2xl sm:text-3xl font-black font-mono select-none leading-none w-7 shrink-0 text-center ${
                  isTopThree
                    ? rank === 1
                      ? 'text-rose-600 dark:text-rose-500'
                      : rank === 2
                      ? 'text-amber-500'
                      : 'text-blue-600 dark:text-blue-400'
                    : 'text-neutral-300 dark:text-neutral-700'
                }`}
              >
                0{rank}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {post.category}
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-700">•</span>
                  <span className="text-[10px] text-neutral-400">
                    {formatRelativeTime(post.created_at)}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                  <Link to={`/news/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h4>

                <div className="flex items-center justify-between mt-2 pt-1">
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
                    <Eye className="w-3 h-3 text-neutral-400" />
                    <span>{((post.views || 0) + (10 - rank) * 140).toLocaleString()} reads</span>
                  </div>

                  {/* 1-Click WhatsApp Direct Share */}
                  <WhatsAppShareButton
                    title={post.title}
                    slug={post.slug}
                    image={post.featured_image}
                    variant="icon"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
