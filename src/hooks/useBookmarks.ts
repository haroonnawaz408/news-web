import { useState, useEffect } from 'react';

const BOOKMARKS_KEY = 'techpulse_saved_bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (err) {
      console.warn('Failed to save bookmarks to localStorage:', err);
    }
  }, [bookmarks]);

  const toggleBookmark = (postId: string) => {
    setBookmarks((prev) => {
      if (prev.includes(postId)) {
        return prev.filter((id) => id !== postId);
      } else {
        return [...prev, postId];
      }
    });
  };

  const isBookmarked = (postId: string): boolean => {
    return bookmarks.includes(postId);
  };

  return {
    bookmarks,
    toggleBookmark,
    isBookmarked,
    count: bookmarks.length,
  };
}
