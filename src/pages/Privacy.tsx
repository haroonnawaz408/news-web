import React from 'react';
import { SEO } from '@/components/seo/SEO';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <SEO
        title="Privacy Policy"
        description="Learn how PulseNews Pakistan collects, protects, and respects your privacy and personal data."
      />

      <div className="space-y-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight pb-4 border-b border-neutral-200 dark:border-neutral-800">
          Privacy Policy
        </h1>
        <p className="text-xs text-neutral-400 font-mono">Last revised: January 1, 2026</p>

        <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-4">
          <p>
            PulseNews Pakistan ("we", "our", or "us") is dedicated to safeguarding the privacy and digital security of our readers. This Privacy Policy details the types of information we may collect when you access PulseNews Pakistan, how that information is utilized, and your privacy choices.
          </p>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-6">1. Information We Collect</h2>
          <p>
            <strong>Direct Submissions:</strong> When you subscribe to our newsletter or send a message through our contact form, we collect your email address and any voluntary communications.
          </p>
          <p>
            <strong>Automated Analytics & Log Data:</strong> We collect non-personally identifiable log metrics such as page views, browser type, referring URLs, device type, and session duration to ensure platform stability and optimize reading performance.
          </p>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-6">2. Cookies and Advertising Technologies</h2>
          <p>
            PulseNews Pakistan and our advertising partners may utilize standard HTTP cookies, web beacons, and local storage to serve relevant advertisements based on your visits to this and other websites. You may disable cookies through your browser settings at any time without impacting your ability to browse articles.
          </p>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-6">3. Data Sharing & Third Parties</h2>
          <p>
            We do not sell, rent, or trade your personal email address to third-party data brokers. Data is processed solely through trusted infrastructure partners bound by strict confidentiality obligations.
          </p>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-6">4. Data Subject Rights</h2>
          <p>
            You maintain statutory rights to inspect, rectify, export, or request deletion of any personal data maintained by PulseNews Pakistan. To exercise these rights, submit a request via our Contact page.
          </p>
        </div>
      </div>
    </div>
  );
};
