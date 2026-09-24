import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useCountry, COUNTRIES } from '@/context/CountryContext';

interface CountryDropdownProps {
  className?: string;
  variant?: 'minimal' | 'full';
}

export const CountryDropdown: React.FC<CountryDropdownProps> = ({
  className = '',
  variant = 'full',
}) => {
  const { currentCountry, setCountry } = useCountry();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCountry = (code: string) => {
    setCountry(code);
    setIsOpen(false);
    if (code === 'pakistan') {
      navigate('/country/pakistan');
    } else if (code === 'global') {
      navigate('/');
    } else {
      navigate(`/country/${code}`);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors shadow-2xs cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none select-none">{currentCountry.flag}</span>
        {variant === 'full' && (
          <span className="hidden sm:inline font-bold">
            {currentCountry.name}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-56 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
              Select Regional Edition
            </span>
            <Globe className="w-3.5 h-3.5 text-blue-500" />
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {COUNTRIES.map((country) => {
              const isSelected = country.code === currentCountry.code;
              return (
                <button
                  key={country.code}
                  onClick={() => handleSelectCountry(country.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none select-none">{country.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {country.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-urdu">
                        {country.nativeName}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
