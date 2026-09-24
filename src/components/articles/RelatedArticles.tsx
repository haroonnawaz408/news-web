import React from 'react';
import { Post } from '@/types/article';
import { ArticleCard } from './ArticleCard';
import { Compass } from 'lucide-react';

interface RelatedArticlesProps {
  posts: Post[];
}

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({ posts }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="mt-14 pt-10 border-t border-neutral-200 dark:border-neutral-800" aria-label="Related Coverage">
      <div className="flex items-center gap-2 mb-6">
        <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          Related Coverage
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};
