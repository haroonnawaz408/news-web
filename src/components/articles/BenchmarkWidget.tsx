import React, { useState } from 'react';
import { Cpu, Award } from 'lucide-react';

interface BenchmarkMetric {
  name: string;
  category: string;
  scores: {
    model: string;
    score: number; // 0 to 100
    displayScore: string;
    isLeader?: boolean;
  }[];
}

const BENCHMARK_DATA: BenchmarkMetric[] = [
  {
    name: 'SWE-bench Verified (Autonomous Coding)',
    category: 'Software Engineering',
    scores: [
      { model: 'o3-mini (High Reasoning)', score: 71.3, displayScore: '71.3%', isLeader: true },
      { model: 'Claude 3.7 Sonnet', score: 70.3, displayScore: '70.3%' },
      { model: 'Gemini 2.0 Flash Thinking', score: 58.2, displayScore: '58.2%' },
      { model: 'GPT-4o (Standard)', score: 38.8, displayScore: '38.8%' },
    ],
  },
  {
    name: 'MATH-500 (Complex Mathematical Proofs)',
    category: 'Reasoning',
    scores: [
      { model: 'o3-mini (High Reasoning)', score: 97.9, displayScore: '97.9%', isLeader: true },
      { model: 'Claude 3.7 Sonnet', score: 96.2, displayScore: '96.2%' },
      { model: 'Gemini 2.0 Flash Thinking', score: 92.4, displayScore: '92.4%' },
      { model: 'GPT-4o (Standard)', score: 74.6, displayScore: '74.6%' },
    ],
  },
  {
    name: 'Inference Efficiency & Tokens/Sec',
    category: 'Throughput',
    scores: [
      { model: 'Gemini 2.0 Flash Thinking', score: 94.0, displayScore: '142 t/s', isLeader: true },
      { model: 'Claude 3.7 Sonnet', score: 82.0, displayScore: '95 t/s' },
      { model: 'o3-mini (High Reasoning)', score: 78.0, displayScore: '86 t/s' },
      { model: 'GPT-4o (Standard)', score: 85.0, displayScore: '104 t/s' },
    ],
  },
];

export const BenchmarkWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const current = BENCHMARK_DATA[activeTab];

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0E131B] shadow-xs p-5 sm:p-6 my-8 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Frontier Model Benchmark Matrix
            </h3>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Verified independent technical evaluation
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl text-xs overflow-x-auto scrollbar-none">
          {BENCHMARK_DATA.map((b, idx) => (
            <button
              key={b.name}
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === idx
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {b.category}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Title */}
      <div className="mb-4">
        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Target Metric: <strong className="text-neutral-950 dark:text-white">{current.name}</strong>
        </span>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="space-y-3.5">
        {current.scores.map((item) => (
          <div key={item.model} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                {item.model}
                {item.isLeader && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    <Award className="w-2.5 h-2.5" />
                    Frontier Leader
                  </span>
                )}
              </span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {item.displayScore}
              </span>
            </div>

            {/* Visual Bar */}
            <div className="h-2.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  item.isLeader
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-500 shadow-xs shadow-blue-500/50'
                    : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <div className="pt-4 mt-5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
        <span>Evaluated under zero-shot chain-of-thought protocols.</span>
        <span className="font-mono">Updated Sep 2026</span>
      </div>
    </div>
  );
};
