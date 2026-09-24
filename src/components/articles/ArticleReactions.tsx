import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Sparkles } from 'lucide-react';

interface ReactionCount {
  [key: string]: number;
}

interface ArticleReactionsProps {
  postId: string;
}

const DEFAULT_REACTIONS = [
  { id: 'insightful', emoji: '🔥', label: 'Insightful' },
  { id: 'bullish', emoji: '🚀', label: 'Bullish' },
  { id: 'mindblown', emoji: '💡', label: 'Mind-Blown' },
  { id: 'skeptical', emoji: '🧐', label: 'Skeptical' },
];

export const ArticleReactions: React.FC<ArticleReactionsProps> = ({ postId }) => {
  const [counts, setCounts] = useState<ReactionCount>({
    insightful: 18,
    bullish: 12,
    mindblown: 9,
    skeptical: 2,
  });
  const [userVoted, setUserVoted] = useState<string[]>([]);

  useEffect(() => {
    // Load voted state from localStorage
    try {
      const votedKey = `voted_reactions_${postId}`;
      const saved = localStorage.getItem(votedKey);
      if (saved) setUserVoted(JSON.parse(saved));
    } catch {
      // Ignore
    }

    // If Supabase is configured, fetch live reaction counts
    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('post_reactions')
        .select('reaction_type, count')
        .eq('post_id', postId)
        .then(({ data }) => {
          if (data && data.length > 0) {
            const mapped: ReactionCount = { ...counts };
            data.forEach((r: any) => {
              mapped[r.reaction_type] = r.count;
            });
            setCounts(mapped);
          }
        });
    }
  }, [postId]);

  const handleReact = async (reactionId: string) => {
    if (userVoted.includes(reactionId)) return;

    // Optimistic UI update
    setCounts((prev) => ({
      ...prev,
      [reactionId]: (prev[reactionId] || 0) + 1,
    }));

    const nextVoted = [...userVoted, reactionId];
    setUserVoted(nextVoted);

    try {
      localStorage.setItem(`voted_reactions_${postId}`, JSON.stringify(nextVoted));
    } catch {
      // Ignore
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await (supabase as any).rpc('increment_post_reaction', {
          target_post_id: postId,
          target_reaction: reactionId,
        });
      } catch (err) {
        console.warn('Failed to increment reaction on Supabase:', err);
      }
    }
  };

  return (
    <div className="my-8 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#111827]">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
          Reader Pulse & Verdict
        </h4>
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
        What is your technical perspective on this story?
      </p>

      <div className="flex flex-wrap gap-2.5">
        {DEFAULT_REACTIONS.map((r) => {
          const hasVoted = userVoted.includes(r.id);
          return (
            <button
              key={r.id}
              onClick={() => handleReact(r.id)}
              disabled={hasVoted}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                hasVoted
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 scale-102'
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 hover:-translate-y-0.5'
              }`}
            >
              <span className="text-base leading-none">{r.emoji}</span>
              <span>{r.label}</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300">
                {counts[r.id] || 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
