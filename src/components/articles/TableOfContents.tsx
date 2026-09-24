import React, { useState, useEffect } from 'react';
import { HeadingItem } from '@/types/article';
import { List, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  headings: HeadingItem[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0% -60% 0%', threshold: 0.1 }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveId(id);
      setIsOpenMobile(false);
    }
  };

  const contentList = (
    <ul className="space-y-2 text-xs">
      {headings.map((item) => {
        const isActive = activeId === item.id;
        return (
          <li
            key={item.id}
            style={{ paddingLeft: item.level === 3 ? '1rem' : '0' }}
            className="transition-all"
          >
            <button
              onClick={() => scrollToHeading(item.id)}
              className={cn(
                'text-left block py-1 transition-colors leading-relaxed hover:text-blue-600 dark:hover:text-blue-400',
                isActive
                  ? 'font-bold text-blue-600 dark:text-blue-400 border-l-2 border-blue-600 dark:border-blue-400 pl-2'
                  : 'text-neutral-600 dark:text-neutral-400'
              )}
            >
              {item.text}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div>
      {/* Mobile Collapsible Drawer */}
      <div className="lg:hidden my-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111827] overflow-hidden">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="w-full flex items-center justify-between p-4 text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white"
        >
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-blue-500" />
            <span>Table of Contents ({headings.length})</span>
          </div>
          {isOpenMobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isOpenMobile && <div className="px-4 pb-4 pt-1 border-t border-neutral-200 dark:border-neutral-800">{contentList}</div>}
      </div>

      {/* Desktop Sticky Sidebar */}
      <nav className="hidden lg:block sticky top-24 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800">
          <List className="w-4 h-4 text-blue-500" />
          <span>Table of Contents</span>
        </div>
        {contentList}
      </nav>
    </div>
  );
};
