import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/common/Toast';
import { Header } from '@/components/layout/Header';
import { MarketTicker } from '@/components/layout/MarketTicker';
import { Footer } from '@/components/layout/Footer';
import { BreakingNews } from '@/components/layout/BreakingNews';
import { CountryProvider } from '@/context/CountryContext';
import { AppRoutes } from '@/routes/AppRoutes';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B0F14] text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Global Header */}
      <Header />

      {/* Live Financial & Crypto Markets Ticker */}
      {!isAdminPath && <MarketTicker />}

      {/* Breaking News Ticker (Shown on public pages) */}
      {!isAdminPath && <BreakingNews />}

      {/* Main Dynamic View */}
      <div className="flex-1">
        <AppRoutes />
      </div>

      {/* Editorial Footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CountryProvider>
          <ToastProvider>
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </ToastProvider>
        </CountryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
