import React from 'react';
import { Type } from 'lucide-react';

interface ReadingControlsProps {
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  setFontSize: (size: 'sm' | 'base' | 'lg' | 'xl') => void;
  fontFamily: 'sans' | 'serif';
  setFontFamily: (family: 'sans' | 'serif') => void;
}

export const ReadingControls: React.FC<ReadingControlsProps> = ({
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
}) => {
  const sizes: Array<'sm' | 'base' | 'lg' | 'xl'> = ['sm', 'base', 'lg', 'xl'];

  const handleNextSize = () => {
    const currentIdx = sizes.indexOf(fontSize);
    const nextIdx = (currentIdx + 1) % sizes.length;
    setFontSize(sizes[nextIdx]);
  };

  const toggleFamily = () => {
    setFontFamily(fontFamily === 'sans' ? 'serif' : 'sans');
  };

  return (
    <div className="inline-flex items-center gap-1.5 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs shadow-xs text-xs">
      {/* Font Size Pill */}
      <button
        onClick={handleNextSize}
        className="px-2.5 py-1 rounded-lg font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        title="Adjust text size"
        aria-label="Adjust text size"
      >
        <span className="text-[10px] uppercase font-mono mr-1">Text:</span>
        <span className="font-bold uppercase">{fontSize}</span>
      </button>

      <span className="w-px h-3.5 bg-neutral-200 dark:bg-neutral-800" />

      {/* Font Family Toggle */}
      <button
        onClick={toggleFamily}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        title="Toggle Serif or Sans-serif font"
        aria-label="Toggle font family"
      >
        <Type className="w-3.5 h-3.5" />
        <span className="capitalize">{fontFamily}</span>
      </button>
    </div>
  );
};
