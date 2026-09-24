import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Github, Twitter, Linkedin } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#070B0E] text-neutral-600 dark:text-neutral-400 text-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-black tracking-tight text-neutral-950 dark:text-white">
                PULSE<span className="text-blue-600 dark:text-blue-400">NEWS</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
              An independent digital newsroom delivering authoritative, 24/7 breaking reporting, financial markets data, and in-depth investigative coverage across Pakistan and worldwide.
            </p>
            <div className="flex items-center space-x-2.5 pt-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-neutral-100 hover:bg-[#1DA1F2] dark:bg-neutral-800 dark:hover:bg-[#1DA1F2] border border-neutral-200 dark:border-neutral-700 text-neutral-700 hover:text-white dark:text-neutral-200 dark:hover:text-white transition-all shadow-xs"
                aria-label="Twitter / X"
                title="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-neutral-100 hover:bg-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-700 hover:text-white dark:text-neutral-200 dark:hover:text-white transition-all shadow-xs"
                aria-label="GitHub"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-neutral-100 hover:bg-[#0A66C2] dark:bg-neutral-800 dark:hover:bg-[#0A66C2] border border-neutral-200 dark:border-neutral-700 text-neutral-700 hover:text-white dark:text-neutral-200 dark:hover:text-white transition-all shadow-xs"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Section: Coverage / Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Coverage
            </h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Editorial & Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Editorial
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  About PulseNews
                </Link>
              </li>
              <li>
                <Link to="/editorial-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Editorial Standards
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Contact & Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Section: Legal & Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/editorial-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Corrections & Retractions
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} PulseNews Media. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built for speed, accuracy & editorial clarity.</p>
        </div>
      </div>
    </footer>
  );
};
