import { useEffect, useRef, useCallback, useState } from "react";
import { invalidateAllCaches, getHomepageFeed, HomepageFeedData } from "@/services/posts";

const REFRESH_MS = 10 * 60 * 1000;

export interface LiveRefreshState {
  secondsUntilRefresh: number;
  isRefreshing: boolean;
  newArticleCount: number;
  showBanner: boolean;
  triggerRefresh: () => void;
  dismissBanner: () => void;
  lastUpdated: Date | null;
}

export function useLiveRefresh(onNewData: (feed: HomepageFeedData) => void): LiveRefreshState {
  const [secondsUntilRefresh, setSeconds] = useState(REFRESH_MS / 1000);
  const [isRefreshing, setRefreshing] = useState(false);
  const [newArticleCount, setNewCount] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const lastCountRef = useRef(0);
  const nextAt = useRef(Date.now() + REFRESH_MS);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setSeconds(Math.ceil(Math.max(0, nextAt.current - Date.now()) / 1000));
  }, []);

  const doRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      invalidateAllCaches();
      const feed = await getHomepageFeed();
      const cnt = feed.allPosts?.length ?? 0;
      const diff = cnt - lastCountRef.current;
      if (lastCountRef.current > 0 && diff > 0) { setNewCount(diff); setShowBanner(true); }
      lastCountRef.current = cnt;
      setLastUpdated(new Date());
      onNewData(feed);
    } catch (e) {
      console.warn("[LiveRefresh]", e);
    } finally {
      setRefreshing(false);
      nextAt.current = Date.now() + REFRESH_MS;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(doRefresh, REFRESH_MS);
    }
  }, [onNewData]);

  const triggerRefresh = useCallback(() => {
    setShowBanner(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    doRefresh();
  }, [doRefresh]);

  const dismissBanner = useCallback(() => setShowBanner(false), []);

  useEffect(() => {
    tick();
    intervalRef.current = setInterval(tick, 1000);
    timerRef.current = setTimeout(doRefresh, REFRESH_MS);
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tick, doRefresh]);

  return { secondsUntilRefresh, isRefreshing, newArticleCount, showBanner, triggerRefresh, dismissBanner, lastUpdated };
}
