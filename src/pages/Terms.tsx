import React from 'react';
import { SEO } from '@/components/seo/SEO';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <SEO
        title="Terms of Service"
        description="Terms and conditions governing reader access, intellectual property, and community conduct on PulseNews Pakistan."
      />

      <div className="space-y-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight pb-4 border-b border-neutral-200 dark:border-neutral-800">
          Terms of Service
        </h1>
        <p className="text-xs text-neutral-400 font-mono">Last revised: January 1, 2026</p>

        <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-4">
          <p>
            By accessing or utilizing the PulseNews Pakistan digital portal and associated live feeds, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please discontinue use of our site.
          </p>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-6">1. Intellectual Property</h2>
          <p>
            All original journalism, news dispatches, graphics, and branding published on PulseNews Pakistan are the intellectual property of PulseNews Media or licensed appropriately.
          </p>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-6">2. Accuracy and Disclaimers</h2>
          <p>
            PulseNews Pakistan delivers verified news, political investigations, and economic analysis for informational and civic purposes. While we strive for rigorous journalistic accuracy, articles do not constitute formal financial, legal, or investment advice.
          </p>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-6">3. Community Standards</h2>
          <p>
            Readers engaging in discussion sections are expected to maintain civil, constructive discourse. Hate speech, defamation, and malicious disinformation will result in immediate comment removal and access suspension.
          </p>
        </div>
      </div>
    </div>
  );
};
