import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label = 'Loading...',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-4 gap-3', className)} role="status" aria-label={label}>
      <div
        className={cn(
          'rounded-full border-neutral-200 dark:border-neutral-800 border-t-blue-600 dark:border-t-blue-500 animate-spin',
          sizeClasses[size]
        )}
      />
      {label && <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</span>}
    </div>
  );
};
