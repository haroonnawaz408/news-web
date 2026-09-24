import React from 'react';
import { SEO } from '@/components/seo/SEO';
import { Activity, Award, Shield, Zap } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <SEO
        title="About PulseNews Pakistan"
        description="Learn about the editorial mission, 24/7 verified wire, and national reporting team behind PulseNews Pakistan."
      />

      <div className="space-y-8">
        <div className="text-center sm:text-left pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Activity className="w-4 h-4" />
            Our Mission
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            About PulseNews Pakistan
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 mt-3 leading-relaxed">
            PulseNews Pakistan is an independent digital news organization delivering 24/7 verified breaking news, national politics, cricket, financial markets, and strategic global dispatches.
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Editorial Philosophy</h2>
          <p>
            In an era of rapid digital information and unverified rumors, PulseNews Pakistan adheres to rigorous journalistic standards. Our newsroom operates 24/7 with reporting desks across Islamabad, Lahore, Karachi, and global wire hubs. We verify official sources, scrutinize policy announcements, analyze economic indicators, and synthesize original, in-depth reports before publication.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8 not-prose">
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111827]">
              <Zap className="w-6 h-6 text-emerald-600 mb-2" />
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">10-Minute Live Wire</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Continuous real-time updates keep readers informed on developing national and international events.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111827]">
              <Shield className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">Verified Accuracy</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Cross-verified journalism and first-principles fact checking guide every published story.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111827]">
              <Award className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">Unbiased Coverage</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Balanced reporting on national politics, economy, cricket, technology, and civil society.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Our Core Desks</h2>
          <p>
            Our newsroom produces original reporting across five central verticals: <strong>Pakistan Affairs & National Politics</strong>, <strong>Cricket & Sports</strong>, <strong>Business & Pakistan Stock Exchange</strong>, <strong>Technology & Knowledge Economy</strong>, and <strong>World Strategic Wire</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
