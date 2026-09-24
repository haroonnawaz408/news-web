import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Pages
import { Home } from '@/pages/Home';
import { ArticlePage } from '@/pages/ArticlePage';
import { CategoryPage } from '@/pages/CategoryPage';
import { SearchPage } from '@/pages/SearchPage';
import { BookmarksPage } from '@/pages/BookmarksPage';
import { About } from '@/pages/About';
import { Contact } from '@/pages/Contact';
import { Privacy } from '@/pages/Privacy';
import { Terms } from '@/pages/Terms';
import { EditorialPolicy } from '@/pages/EditorialPolicy';
import { CountryPage } from '@/pages/CountryPage';

// Admin Pages
import { AdminLogin } from '@/pages/admin/Login';
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { AdminPosts } from '@/pages/admin/Posts';
import { AdminNewPost } from '@/pages/admin/NewPost';
import { AdminEditPost } from '@/pages/admin/EditPost';

// 404 Page
import { EmptyState } from '@/components/common/EmptyState';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="Verifying staff credentials..." />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/news/:slug" element={<ArticlePage />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/country/:countryCode" element={<CountryPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/saved" element={<BookmarksPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/editorial-policy" element={<EditorialPolicy />} />

      {/* Admin Authentication */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/posts"
        element={
          <ProtectedRoute>
            <AdminPosts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/posts/new"
        element={
          <ProtectedRoute>
            <AdminNewPost />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/posts/:id/edit"
        element={
          <ProtectedRoute>
            <AdminEditPost />
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <div className="max-w-4xl mx-auto px-4 py-20">
            <EmptyState
              title="404 — Page Not Found"
              description="The story you requested could not be located in the PulseNews Pakistan index."
              actionText="Return to Homepage"
              actionHref="/"
            />
          </div>
        }
      />
    </Routes>
  );
};
