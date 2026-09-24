import React, { useEffect, useState } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { getAllPostsAdmin } from '@/services/posts';
import { Post } from '@/types/article';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { EmptyState } from '@/components/common/EmptyState';
import { SEO } from '@/components/seo/SEO';
import { Bookmark, Trash2 } from 'lucide-react';

export const BookmarksPage: React.FC = () => {
  const { bookmarks, toggleBookmark } = useBookmarks();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      setLoading(true);
      try {
        const all = await getAllPostsAdmin();
        const filtered = all.filter((p) => bookmarks.includes(p.id));
        setSavedPosts(filtered);
      } catch (err) {
        console.error('Failed to load saved posts:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSaved();
  }, [bookmarks]);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title="Saved Reading List"
        description="Your personal reading list and saved stories on PulseNews Pakistan."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Bookmark className="w-4 h-4" />
            Personal Library
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Saved Articles & Reading List
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Articles bookmarked for offline inspection and research.
          </p>
        </div>

        <span className="text-xs font-mono text-neutral-400">
          {savedPosts.length} Item{savedPosts.length === 1 ? '' : 's'} Stored
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-neutral-400">Loading your reading list...</div>
      ) : savedPosts.length === 0 ? (
        <EmptyState
          title="No Articles Saved Yet"
          description="Bookmark technical analyses and breaking reports while browsing to read them later in one place."
          actionText="Discover Latest Stories"
          actionHref="/"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPosts.map((post) => (
            <div key={post.id} className="relative group/saved">
              <ArticleCard post={post} />
              <button
                onClick={() => toggleBookmark(post.id)}
                className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white/90 dark:bg-neutral-900/90 backdrop-blur text-red-500 hover:text-red-700 shadow-md opacity-0 group-hover/saved:opacity-100 transition-opacity"
                title="Remove from bookmarks"
                aria-label="Remove bookmark"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
