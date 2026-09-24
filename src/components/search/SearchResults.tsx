import React from 'react';
import { Post } from '@/types/article';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonCard } from '@/components/common/SkeletonCard';

interface SearchResultsProps {
  query: string;
  results: Post[];
  isLoading: boolean;
  onReset: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  isLoading,
  onReset,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <EmptyState
        title={`No results found for "${query}"`}
        description="Try refining your query, checking for spelling errors, or searching by a broader category like AI or Semiconductors."
        actionText="Clear Search"
        onReset={onReset}
      />
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span>
          Showing {results.length} result{results.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((post) => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};
