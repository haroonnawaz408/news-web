import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/components/common/Toast';

interface WhatsAppShareButtonProps {
  title: string;
  slug: string;
  image?: string;
  className?: string;
  variant?: 'pill' | 'icon' | 'badge';
}

export const WhatsAppShareButton: React.FC<WhatsAppShareButtonProps> = ({
  title,
  slug,
  className = '',
  variant = 'pill',
}) => {
  const { toast } = useToast();

  const getFullUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/news/${slug}`;
    }
    return `https://pulsenews.com/news/${slug}`;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const fullUrl = getFullUrl();
    const shareText = `*${title.trim()}*\n\nRead full story with audio & photo:\n${fullUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

    // Open WhatsApp in new window
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    toast('Sharing to WhatsApp...', 'success');
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        className={`p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer ${className}`}
        title="Share to WhatsApp (Direct Picture & Link)"
        aria-label="Share story to WhatsApp"
      >
        <MessageCircle className="w-4 h-4 fill-emerald-600/10 stroke-emerald-600 dark:stroke-emerald-400" />
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer ${className}`}
      title="Share story to WhatsApp with Picture and Link"
      aria-label="Share story to WhatsApp"
    >
      <MessageCircle className="w-4 h-4 fill-white" />
      <span>Share on WhatsApp</span>
    </button>
  );
};
