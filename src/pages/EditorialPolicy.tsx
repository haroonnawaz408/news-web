import React from 'react';
import { SEO } from '@/components/seo/SEO';
import { CheckCircle, Sparkles } from 'lucide-react';

export const EditorialPolicy: React.FC = () => {
  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <SEO
        title="Editorial Policy & Standards"
        description="Guidelines on technical accuracy, source attribution, AI automation usage, corrections, and conflict of interest."
      />

      <div className="space-y-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight pb-4 border-b border-neutral-200 dark:border-neutral-800">
          Editorial Standards & AI Policy
        </h1>
        <p className="text-xs text-neutral-400 font-mono">Published for reader transparency</p>

        <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-6">
          <p>
            At PulseNews Pakistan, our primary commitment is to rigorous journalistic accuracy and public trust. Maintaining reader confidence requires absolute clarity regarding how we report, verify, and publish stories.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 not-prose">
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111827]">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white mb-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Original Synthesis & Integrity</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                All articles are synthesized by our editorial desk with deep context, background analysis, and verified facts. We uphold zero tolerance for plagiarism or copyright infringement.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111827]">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span>Fact Verification</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Wire inputs and official statements are rigorously cross-checked with primary records before publication to eliminate unconfirmed rumors.
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-8">Corrections and Retractions</h2>
          <p>
            If a factual error occurs, we correct it promptly and transparently. Substantive updates are marked with an updated timestamp and an explanatory note.
          </p>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-8">Editorial Independence</h2>
          <p>
            PulseNews Pakistan maintains strict separation between editorial content and commercial advertising. Sponsored placements are visibly labeled and never influence our news reporting.
          </p>
        </div>
      </div>
    </div>
  );
};
