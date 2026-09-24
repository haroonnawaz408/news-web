import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827] overflow-hidden animate-pulse">
      {/* Thumbnail */}
      <div className="aspect-[16/9] w-full bg-neutral-200 dark:bg-neutral-800" />
      
      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Category & Date */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-3 w-3 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* Title */}
        <div className="h-6 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-6 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />

        {/* Excerpt */}
        <div className="space-y-2 pt-1 flex-1">
          <div className="h-3.5 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-3.5 w-5/6 rounded bg-neutral-100 dark:bg-neutral-800" />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="h-3.5 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-3.5 w-12 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
    </div>
  );
};

export const FeaturedSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
      <div className="lg:col-span-8 flex flex-col rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827] overflow-hidden">
        <div className="aspect-[16/9] w-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="p-6 sm:p-8 space-y-4">
          <div className="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-9 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-4 w-2/3 rounded bg-neutral-100 dark:bg-neutral-800" />
        </div>
      </div>
      <div className="lg:col-span-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827] space-y-3">
            <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-5 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-28 rounded bg-neutral-100 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ArticleDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-6">
      <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-10 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-5 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
      <div className="aspect-[21/9] w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
      <div className="space-y-4 pt-6">
        <div className="h-4 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-4 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-4 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-8 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800 pt-4" />
        <div className="h-4 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
      </div>
    </div>
  );
};
