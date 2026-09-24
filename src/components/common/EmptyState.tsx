import React from 'react';
import { FileQuestion, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Articles Found',
  description = 'There are currently no articles matching your selection. Please check back soon or try another category.',
  actionText = 'Explore Latest News',
  actionHref = '/',
  onReset,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 my-8 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
      <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
        <FileQuestion className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mb-6">{description}</p>
      
      {onReset ? (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {actionText}
        </button>
      ) : actionHref ? (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          {actionText}
        </Link>
      ) : null}
    </div>
  );
};
