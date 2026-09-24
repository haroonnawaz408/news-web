import { Languages, Loader2 } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLang: 'en' | 'ur';
  onToggle: (lang: 'en' | 'ur') => void;
  isLoading?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLang,
  onToggle,
  isLoading = false,
}) => {
  return (
    <div className="inline-flex items-center p-0.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs shadow-xs text-xs font-semibold">
      <button
        onClick={() => onToggle('en')}
        disabled={isLoading}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
          currentLang === 'en'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        <span>English</span>
      </button>

      <button
        onClick={() => onToggle('ur')}
        disabled={isLoading}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
          currentLang === 'ur'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Languages className="w-3.5 h-3.5" />
        )}
        <span>{isLoading ? 'ترجمہ ہو رہا ہے...' : 'اردو (Urdu)'}</span>
      </button>
    </div>
  );
};
