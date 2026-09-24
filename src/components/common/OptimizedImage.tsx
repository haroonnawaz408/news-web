import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  className?: string;
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80';

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  aspectRatio = 'video',
  className,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const aspectClasses = {
    video: 'aspect-[16/9]',
    square: 'aspect-square',
    wide: 'aspect-[21/9]',
    auto: '',
  };

  const imageSrc = error || !src ? fallbackSrc : src;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-neutral-100 dark:bg-neutral-800',
        aspectClasses[aspectRatio],
        className
      )}
    >
      {/* Background loading pulse until image finishes loading */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      )}

      {error && !fallbackSrc ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
          <ImageOff className="w-8 h-8 mb-1" />
          <span className="text-xs">Image unavailable</span>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (!error) {
              setError(true);
            }
          }}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
    </div>
  );
};
