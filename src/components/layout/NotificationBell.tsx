import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Radio } from 'lucide-react';

interface AlertItem {
  id: string;
  title: string;
  category: string;
  time: string;
  slug: string;
  read: boolean;
}

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alert-1',
      title: 'OpenAI and US AI Safety Institute announce joint evaluation protocols for reasoning models',
      category: 'AI',
      time: '14m ago',
      slug: 'next-generation-frontier-models-autonomous-reasoning',
      read: false,
    },
    {
      id: 'alert-2',
      title: 'TSMC expands 2nm lithography trial production with optical interconnect packaging',
      category: 'Technology',
      time: '1h ago',
      slug: 'silicon-photonics-2nm-process-nodes-datacenter-hardware',
      read: false,
    },
    {
      id: 'alert-3',
      title: 'Superconducting magnets set new plasma confinement stability record in commercial fusion',
      category: 'Science',
      time: '3h ago',
      slug: 'commercial-nuclear-fusion-magnetic-confinement-plasma',
      read: true,
    },
  ]);

  const [pushEnabled, setPushEnabled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts.filter((a) => !a.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushEnabled(true);
        new Notification('TechPulse Alerts Enabled', {
          body: 'You will receive instant alerts for breaking frontier technology stories.',
          icon: '/favicon.svg',
        });
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        aria-label="Breaking news alerts"
        title="Breaking News Alerts"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
        )}
      </button>

      {/* Floating Alerts Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0E131B] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-3.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-[#0B0F14]/80">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Breaking Wire Alerts
              </h3>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Alerts List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/40">
            {alerts.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.slug}`}
                onClick={() => {
                  setIsOpen(false);
                  setAlerts((prev) =>
                    prev.map((a) => (a.id === item.id ? { ...a, read: true } : a))
                  );
                }}
                className={`block p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-850/50 transition-colors ${
                  !item.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">{item.time}</span>
                </div>
                <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-snug">
                  {item.title}
                </h4>
              </Link>
            ))}
          </div>

          {/* Push Permission CTA */}
          <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0B0F14] flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Desktop web push notifications
            </span>
            <button
              onClick={requestPushPermission}
              disabled={pushEnabled}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer disabled:text-neutral-400"
            >
              {pushEnabled ? 'Subscribed ✓' : 'Enable'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
