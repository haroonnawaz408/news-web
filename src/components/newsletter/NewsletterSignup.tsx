import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { subscribeToNewsletter } from '@/services/newsletter';
import { useToast } from '@/components/common/Toast';

interface NewsletterSignupProps {
  variant?: 'card' | 'inline' | 'sidebar';
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ variant = 'card' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const res = await subscribeToNewsletter(email);
      if (res.success) {
        setIsSuccess(true);
        setEmail('');
        toast(res.message, 'success');
      } else {
        setError(res.message);
        toast(res.message, 'error');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      toast('Failed to subscribe. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-xl p-6 border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
        <h4 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
          You're on the list!
        </h4>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          Check your inbox every Tuesday & Thursday for curated tech breakdowns.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        variant === 'sidebar'
          ? 'rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111827]'
          : 'rounded-2xl p-8 sm:p-10 border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-white relative overflow-hidden'
      }
    >
      {variant !== 'sidebar' && (
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
        <Mail className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">TechPulse Dispatch</span>
      </div>

      <h3
        className={
          variant === 'sidebar'
            ? 'text-lg font-bold text-neutral-900 dark:text-white mb-2'
            : 'text-2xl sm:text-3xl font-extrabold text-white mb-3'
        }
      >
        Stay ahead of the tech world.
      </h3>

      <p
        className={
          variant === 'sidebar'
            ? 'text-xs text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed'
            : 'text-sm text-neutral-300 mb-6 max-w-xl leading-relaxed'
        }
      >
        Curated engineering breakthroughs, frontier AI models, silicon roadmaps, and venture insights delivered straight to your inbox. No spam, unsubscribe anytime.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className={variant === 'sidebar' ? 'space-y-2' : 'flex flex-col sm:flex-row gap-2 max-w-md'}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your work email..."
            required
            aria-label="Email address for newsletter"
            className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors disabled:opacity-50 shrink-0 cursor-pointer shadow-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </form>
    </div>
  );
};
