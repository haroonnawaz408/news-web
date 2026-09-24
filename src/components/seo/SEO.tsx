import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  category?: string;
  tags?: string[];
  breadcrumbs?: { name: string; url: string }[];
  noindex?: boolean;
}

const BRAND      = 'PulseNews Pakistan';
const SITE_URL   = 'https://pulsenews.pk';
const TWITTER    = '@PulseNewsPK';
const OG_DEFAULT = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80&auto=format&fit=crop';

// ── helper: upsert a <meta> tag ─────────────────────────────────────────────
function setMeta(attr: string, value: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// ── helper: upsert a <link> tag ─────────────────────────────────────────────
function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// ── helper: upsert a JSON-LD script ─────────────────────────────────────────
function setJsonLd(id: string, data: unknown) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image = OG_DEFAULT,
  canonical,
  type = 'website',
  publishedTime,
  modifiedTime,
  authorName = 'PulseNews Editorial Board',
  category,
  tags = [],
  breadcrumbs,
  noindex = false,
}) => {
  // Build the full SEO title (≤ 60 chars ideal)
  const fullTitle = title.includes(BRAND) ? title : `${title} | ${BRAND}`;

  // Ensure description is within 155 chars
  const safeDesc = description?.slice(0, 155) || '';

  // Absolute canonical URL
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE_URL;
  const pageUrl = canonical
    ? canonical.startsWith('http') ? canonical : `${origin}${canonical}`
    : typeof window !== 'undefined' ? window.location.href : origin;

  // Keywords list
  const keywords = [...new Set([
    ...(tags || []),
    category,
    'Pakistan News',
    'Breaking News Pakistan',
    'Latest Headlines',
    'PulseNews',
  ].filter(Boolean) as string[])];

  useEffect(() => {
    /* ── 1. Document title ── */
    document.title = fullTitle;

    /* ── 2. Core meta ── */
    setMeta('name', 'description',   safeDesc);
    setMeta('name', 'keywords',      keywords.join(', '));
    setMeta('name', 'news_keywords', keywords.slice(0, 10).join(', '));
    setMeta('name', 'author',        authorName);
    setMeta('name', 'robots',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    );
    setMeta('name', 'googlebot',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    );
    setMeta('name', 'bingbot',       'index, follow, max-snippet:-1, max-image-preview:large');

    // Language & region signals for Google News Pakistan
    setMeta('name', 'language',           'English');
    setMeta('name', 'geo.region',         'PK');
    setMeta('name', 'geo.placename',      'Pakistan');
    setMeta('name', 'content-language',   'en-PK');
    setMeta('http-equiv', 'content-language', 'en-PK');

    /* ── 3. Open Graph ── */
    setMeta('property', 'og:type',             type === 'article' ? 'article' : 'website');
    setMeta('property', 'og:title',            fullTitle);
    setMeta('property', 'og:description',      safeDesc);
    setMeta('property', 'og:url',              pageUrl);
    setMeta('property', 'og:image',            image);
    setMeta('property', 'og:image:secure_url', image);
    setMeta('property', 'og:image:width',      '1200');
    setMeta('property', 'og:image:height',     '630');
    setMeta('property', 'og:image:type',       'image/jpeg');
    setMeta('property', 'og:site_name',        BRAND);
    setMeta('property', 'og:locale',           'en_PK');

    if (type === 'article') {
      if (publishedTime) setMeta('property', 'article:published_time', publishedTime);
      if (modifiedTime)  setMeta('property', 'article:modified_time',  modifiedTime);
      if (authorName)    setMeta('property', 'article:author',         authorName);
      if (category)      setMeta('property', 'article:section',        category);
      tags.forEach((tag) => {
        // article:tag must be set per-tag (can only upsert one, so set all)
        setMeta('property', 'article:tag', tag);
      });
    }

    /* ── 4. Twitter Card ── */
    setMeta('name', 'twitter:card',        'summary_large_image');
    setMeta('name', 'twitter:site',        TWITTER);
    setMeta('name', 'twitter:creator',     TWITTER);
    setMeta('name', 'twitter:title',       fullTitle);
    setMeta('name', 'twitter:description', safeDesc);
    setMeta('name', 'twitter:image',       image);
    setMeta('name', 'twitter:image:alt',   title);

    /* ── 5. Canonical link ── */
    setLink('canonical', pageUrl);

    /* ── 6. Alternate language hint (for Urdu content) ── */
    setLink('alternate', pageUrl);

    /* ── 7. JSON-LD — WebSite (sitelinks searchbox) ── */
    setJsonLd('ld-website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: BRAND,
      url: origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${origin}/search?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    });

    /* ── 8. JSON-LD — NewsMediaOrganization ── */
    setJsonLd('ld-org', {
      '@context': 'https://schema.org',
      '@type': 'NewsMediaOrganization',
      name: BRAND,
      url: origin,
      sameAs: [
        'https://twitter.com/PulseNewsPK',
        'https://facebook.com/PulseNewsPK',
      ],
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/favicon.svg`,
        width: 512,
        height: 512,
      },
      foundingDate: '2024',
      areaServed: 'PK',
      knowsLanguage: ['en', 'ur'],
    });

    /* ── 9. JSON-LD — NewsArticle (article pages only) ── */
    if (type === 'article') {
      setJsonLd('ld-article', {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: title.slice(0, 110),   // Google max 110 chars
        description: safeDesc,
        image: [image],
        url: pageUrl,
        datePublished:  publishedTime || new Date().toISOString(),
        dateModified:   modifiedTime  || publishedTime || new Date().toISOString(),
        author: [{
          '@type': 'Person',
          name: authorName,
          url: origin,
        }],
        publisher: {
          '@type': 'NewsMediaOrganization',
          name: BRAND,
          url: origin,
          logo: {
            '@type': 'ImageObject',
            url: `${origin}/favicon.svg`,
            width: 512,
            height: 512,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': pageUrl,
        },
        articleSection: category || 'General',
        keywords: keywords.join(', '),
        inLanguage: 'en-PK',
        isAccessibleForFree: 'True',
      });
    } else {
      // Remove article LD if navigating away from article page
      const old = document.getElementById('ld-article');
      if (old) old.remove();
    }

    /* ── 10. JSON-LD — BreadcrumbList ── */
    if (breadcrumbs && breadcrumbs.length > 0) {
      setJsonLd('ld-breadcrumb', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: crumb.name,
          item: crumb.url.startsWith('http') ? crumb.url : `${origin}${crumb.url}`,
        })),
      });
    } else {
      const old = document.getElementById('ld-breadcrumb');
      if (old) old.remove();
    }
  }, [fullTitle, safeDesc, pageUrl, image, type, publishedTime, modifiedTime, authorName, category, keywords, breadcrumbs, noindex, origin, tags]);

  return null;
};
