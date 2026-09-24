import { useEffect, useRef } from 'react';
import { incrementPostViews } from '@/services/posts';

export function usePostViews(postId?: string) {
  const incrementedRef = useRef(false);

  useEffect(() => {
    if (!postId || incrementedRef.current) return;

    try {
      const sessionKey = `viewed_post_${postId}`;
      const hasViewedInSession = sessionStorage.getItem(sessionKey);

      if (!hasViewedInSession) {
        sessionStorage.setItem(sessionKey, 'true');
        incrementedRef.current = true;
        incrementPostViews(postId);
      }
    } catch {
      // Fallback if sessionStorage is disabled
      if (!incrementedRef.current) {
        incrementedRef.current = true;
        incrementPostViews(postId);
      }
    }
  }, [postId]);
}
