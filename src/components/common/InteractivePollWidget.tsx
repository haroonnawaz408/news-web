import React, { useState, useEffect } from 'react';
import { CheckCircle2, BarChart3, Users } from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export const InteractivePollWidget: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', text: 'Yes — Pakistan has home advantage & solid squad', votes: 1420 },
    { id: '2', text: 'No — Tough competition from Australia & India', votes: 610 },
    { id: '3', text: 'Depends on Babar Azam & pace attack form', votes: 940 },
  ]);

  const POLL_ID = 'champions_trophy_poll_2026';

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`poll_${POLL_ID}`);
      if (saved) {
        setSelectedOption(saved);
        setHasVoted(true);
      }
    } catch {}
  }, []);

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  const handleVote = (optionId: string) => {
    if (hasVoted) return;

    setSelectedOption(optionId);
    setHasVoted(true);
    setOptions((prev) =>
      prev.map((opt) => (opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt))
    );

    try {
      localStorage.setItem(`poll_${POLL_ID}`, optionId);
    } catch {}
  };

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827] p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-neutral-950 dark:text-white tracking-tight">
              Community Pulse Poll
            </h3>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
              رائے شماری • Voice Your Opinion
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
          Live
        </span>
      </div>

      <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3.5 leading-snug">
        Will Pakistan win the upcoming ICC Champions Trophy on home soil?
      </p>

      <div className="space-y-2.5">
        {options.map((opt) => {
          const percent = Math.round((opt.votes / Math.max(1, totalVotes)) * 100);
          const isUserPick = selectedOption === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={hasVoted}
              className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isUserPick
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/40'
              }`}
            >
              {/* Animated fill bar when voted */}
              {hasVoted && (
                <div
                  className="absolute top-0 bottom-0 left-0 bg-emerald-500/15 dark:bg-emerald-500/25 transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  {opt.text}
                </span>
                {hasVoted && (
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    {isUserPick && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{percent}%</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span className="font-mono">{totalVotes.toLocaleString()} votes cast</span>
        </div>
        <span className="text-[10px] text-neutral-400 font-semibold">
          {hasVoted ? '✓ Vote recorded' : 'Click to vote'}
        </span>
      </div>
    </div>
  );
};
