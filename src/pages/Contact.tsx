import React, { useState } from 'react';
import { SEO } from '@/components/seo/SEO';
import { Mail, CheckCircle2, Send } from 'lucide-react';
import { useToast } from '@/components/common/Toast';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate sending message (ready for Resend, SendGrid, or Formspree integration)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
      toast('Your message has been received! Our team will respond shortly.', 'success');
    } catch {
      setError('Failed to transmit message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <SEO
        title="Contact & Editorial Tips"
        description="Get in touch with the PulseNews Pakistan editorial desk for news tips, corrections, press inquiries, and advertising."
      />

      <div className="max-w-2xl mx-auto">
        <div className="text-center pb-8 border-b border-neutral-200 dark:border-neutral-800 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Mail className="w-4 h-4" />
            Get In Touch
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Contact & Editorial Desk
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2">
            Have a breaking tip, leak, correction, or commercial inquiry? We welcome confidential tips and press releases.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              Message Transmitted
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
              Thank you for reaching out. An editor on the relevant desk will review your inquiry within 24 business hours.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', subject: '', message: '' });
              }}
              className="px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Elena Vance"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#111827] text-neutral-900 dark:text-white placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="elena@company.com"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#111827] text-neutral-900 dark:text-white placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                Inquiry Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Breaking Tip / Correction / Partnership"
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#111827] text-neutral-900 dark:text-white placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                Your Message / News Tip *
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Provide details regarding the news tip, event, or press dispatch..."
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#111827] text-neutral-900 dark:text-white placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
