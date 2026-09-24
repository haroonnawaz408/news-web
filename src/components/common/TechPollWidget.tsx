import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle2, Users } from 'lucide-react';

interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export const TechPollWidget: React.FC = () => {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [options, setOptions] = useState<PollOption[]>([
    { id: 'opt-1', label: 'By late 2026', votes: 420 },
    { id: 'opt-2', label: 'Between 2027 – 2028', votes: 890 },
    { id: 'opt-3', label: '2029 or later', votes: 310 },
    { id: 'opt-4', label: 'Autonomous AGI is overhyped', votes: 140 },
  ]);

  const POLL_STORAGE_KEY = 'techpulse_poll_autonomous_coding_2026';

  useEffect(() => {
    const savedVote = localStorage.getItem(POLL_STORAGE_KEY);
    if (savedVote) {
      setHasVoted(true);
      setSelectedOption(savedVote);
    }
  }, []);

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = (id: string) => {
    if (hasVoted) return;

    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt))
    );
    setSelectedOption(id);
    setHasVoted(true);
    localStorage.setItem(POLL_STORAGE_KEY, id);
  };

  return (
    <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#111827] p-5 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          <BarChart3 className="w-4 h-4" />
          <span>Community Pulse Poll</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live
        </span>
      </div>

      <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug mb-4">
        When will AI achieve full autonomous software engineering capability?
      </h3>

      <div className="space-y-2.5">
        {options.map((opt) => {
          const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          const isSelected = selectedOption === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={hasVoted}
              className={`w-full relative text-left p-3 rounded-xl border text-xs font-semibold transition-all overflow-hidden cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              {/* Progress bar background on voted */}
              {hasVoted && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                    isSelected
                      ? 'bg-blue-500/15 dark:bg-blue-500/25'
                      : 'bg-neutral-200/50 dark:bg-neutral-800/60'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  <span className="truncate">{opt.label}</span>
                </div>
                {hasVoted && (
                  <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0">
                    {percent}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400">
        <span className="flex items-center gap-1 font-mono">
          <Users className="w-3 h-3" />
          {totalVotes.toLocaleString()} Votes cast
        </span>
        <span>{hasVoted ? 'Thank you for voting!' : 'Select an option to vote'}</span>
      </div>
    </div>
  );
};
