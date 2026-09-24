import React from 'react';

export type AdVariant = 'banner' | 'rectangle' | 'sidebar' | 'inArticle' | 'stickySidebar';

interface AdPlaceholderProps {
  variant?: AdVariant;
  className?: string;
}

// Ad placeholders are disabled per editorial directive
export const AdPlaceholder: React.FC<AdPlaceholderProps> = () => {
  return null;
};
