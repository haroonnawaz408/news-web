import React, { createContext, useContext, useState } from 'react';

export interface CountryInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  primaryCities: string[];
}

export const COUNTRIES: CountryInfo[] = [
  {
    code: 'pakistan',
    name: 'Pakistan',
    nativeName: 'پاکستان',
    flag: '🇵🇰',
    currency: 'PKR',
    currencySymbol: '₨',
    primaryCities: ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta', 'Rawalpindi'],
  },
  {
    code: 'global',
    name: 'Global / World',
    nativeName: 'عالمی خبریں',
    flag: '🌍',
    currency: 'USD',
    currencySymbol: '$',
    primaryCities: ['New York', 'London', 'Tokyo', 'Dubai', 'Geneva'],
  },
  {
    code: 'us',
    name: 'United States',
    nativeName: 'امریکہ',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    primaryCities: ['Washington DC', 'New York', 'Los Angeles', 'Chicago'],
  },
  {
    code: 'uk',
    name: 'United Kingdom',
    nativeName: 'برطانیہ',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    primaryCities: ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
  },
  {
    code: 'saudi',
    name: 'Middle East & Gulf',
    nativeName: 'خلیج و مشرقِ وسطیٰ',
    flag: '🇸🇦',
    currency: 'SAR',
    currencySymbol: 'SR',
    primaryCities: ['Riyadh', 'Jeddah', 'Dubai', 'Abu Dhabi', 'Doha'],
  },
  {
    code: 'canada',
    name: 'Canada',
    nativeName: 'کینیڈا',
    flag: '🇨🇦',
    currency: 'CAD',
    currencySymbol: 'C$',
    primaryCities: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'],
  },
];

interface CountryContextType {
  currentCountry: CountryInfo;
  setCountry: (code: string) => void;
  isPakistan: boolean;
  isGlobal: boolean;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'techpulse_selected_country';

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCountry, setCurrentCountry] = useState<CountryInfo>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const found = COUNTRIES.find((c) => c.code === saved);
        if (found) return found;
      }
    } catch {}
    // Default to Pakistan (National Priority)
    return COUNTRIES[0];
  });

  const setCountry = (code: string) => {
    const target = COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
    setCurrentCountry(target);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, target.code);
    } catch {}
  };

  const isPakistan = currentCountry.code === 'pakistan';
  const isGlobal = currentCountry.code === 'global';

  return (
    <CountryContext.Provider
      value={{
        currentCountry,
        setCountry,
        isPakistan,
        isGlobal,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};

export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
}
