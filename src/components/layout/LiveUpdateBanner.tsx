import React from "react";
import { RefreshCw, X, Radio } from "lucide-react";

interface Props {
  show: boolean;
  newCount: number;
  secondsLeft: number;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
  onDismiss: () => void;
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export const LiveUpdateBanner: React.FC<Props> = ({
  show, newCount, secondsLeft, isRefreshing, lastUpdated, onRefresh, onDismiss
}) => {
  const minsAgo = lastUpdated
    ? Math.floor((Date.now() - lastUpdated.getTime()) / 60000)
    : null;

  return (
    <>
      {/* Always-visible live status strip */}
      <div className="live-status-strip">
        <div className="live-strip-inner">
          <span className="live-dot-pulse" />
          <Radio size={12} />
          <span className="live-label">LIVE</span>
          <span className="live-timer">
            {isRefreshing ? "Refreshing..." : `Next update in ${fmtTime(secondsLeft)}`}
          </span>
          {lastUpdated && (
            <span className="live-updated">
              {minsAgo === 0 ? "Just updated" : `Updated ${minsAgo}m ago`}
            </span>
          )}
          <button onClick={onRefresh} className="live-refresh-btn" title="Refresh now">
            <RefreshCw size={13} className={isRefreshing ? "spin" : ""} />
          </button>
        </div>
      </div>

      {/* New stories banner */}
      {show && (
        <div className="new-stories-banner" onClick={onRefresh}>
          <div className="new-stories-inner">
            <span className="new-stories-pulse" />
            <strong>{newCount} naye articles</strong> abhi publish hue — tap kar ke load karein
            <button onClick={e => { e.stopPropagation(); onDismiss(); }} className="banner-close">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
