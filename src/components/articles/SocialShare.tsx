import React from 'react';
import { Share2, Link2, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/common/Toast';

interface SocialShareProps {
  title: string;
  url?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ title, url }) => {
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast('Article link copied to clipboard!', 'success');
    } catch {
      toast('Failed to copy link.', 'error');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch (err) {
        // User canceled or failed
        console.debug('Native share dismissed:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n\n${shareUrl}`)}`;

  return (
    <div className="flex items-center flex-wrap gap-2 py-3 border-y border-neutral-200 dark:border-neutral-800">
      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mr-2">
        Share
      </span>

      {/* Native Share (mobile) */}
      <button
        onClick={handleNativeShare}
        className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
        aria-label="Share via device options"
      >
        <Share2 className="w-3.5 h-3.5 text-blue-500" />
        <span>Share</span>
      </button>

      {/* Twitter / X */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
        aria-label="Share on X"
      >
        <Twitter className="w-3.5 h-3.5 text-[#1DA1F2]" />
        <span className="hidden sm:inline">X</span>
      </a>

      {/* LinkedIn */}
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
        <span className="hidden sm:inline">LinkedIn</span>
      </a>

      {/* WhatsApp Button (High-Priority Viral Channel) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
        aria-label="Share story with picture on WhatsApp"
        title="Share to WhatsApp (Sends direct photo & link)"
      >
        <MessageCircle className="w-3.5 h-3.5 fill-white" />
        <span>Share on WhatsApp</span>
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors ml-auto cursor-pointer"
        aria-label="Copy article link to clipboard"
      >
        <Link2 className="w-3.5 h-3.5 text-neutral-500" />
        <span>Copy Link</span>
      </button>
    </div>
  );
};
