import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug, getRelatedPosts } from '@/services/posts';
import { Post, HeadingItem } from '@/types/article';
import { ArticleContent } from '@/components/articles/ArticleContent';
import { TableOfContents } from '@/components/articles/TableOfContents';
import { SocialShare } from '@/components/articles/SocialShare';
import { RelatedArticles } from '@/components/articles/RelatedArticles';
import { ReadingProgress } from '@/components/articles/ReadingProgress';
import { KeyTakeaways } from '@/components/articles/KeyTakeaways';
import { ReadingControls } from '@/components/articles/ReadingControls';
import { AudioReader } from '@/components/articles/AudioReader';
import { ArticleReactions } from '@/components/articles/ArticleReactions';
import { CommentsSection } from '@/components/articles/CommentsSection';
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup';
import { ArticleDetailSkeleton } from '@/components/common/SkeletonCard';
import { EmptyState } from '@/components/common/EmptyState';
import { SEO } from '@/components/seo/SEO';
import { usePostViews } from '@/hooks/usePostViews';
import { useBookmarks } from '@/hooks/useBookmarks';
import { formatDate, calculateReadingTime } from '@/lib/utils';
import { ImageLightbox } from '@/components/common/ImageLightbox';
import { NextStoryDock } from '@/components/articles/NextStoryDock';
import { ArticleAIAssistant } from '@/components/articles/ArticleAIAssistant';
import { LanguageSwitcher } from '@/components/articles/LanguageSwitcher';
import { QuoteShare } from '@/components/articles/QuoteShare';
import { BenchmarkWidget } from '@/components/articles/BenchmarkWidget';
import { translateArticle, TranslatedArticleData } from '@/utils/translator';
import { Clock, Calendar, Eye, ChevronRight, User, Bookmark, Maximize2, Sparkles } from 'lucide-react';

export const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>('sans');
  const [lightboxData, setLightboxData] = useState<{ src: string; alt: string } | null>(null);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [translatedData, setTranslatedData] = useState<TranslatedArticleData | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  // Safely increment post views with session deduplication
  usePostViews(post?.id);

  useEffect(() => {
    async function loadArticle() {
      if (!slug) return;
      setLoading(true);
      setLanguage('en');
      setTranslatedData(null);
      window.scrollTo(0, 0);

      try {
        const found = await getPostBySlug(slug);
        setPost(found);

        if (found) {
          const rel = await getRelatedPosts(found.category, found.tags, found.id, 3);
          setRelated(rel);
        }
      } catch (err) {
        console.error('Error loading article:', err);
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [slug]);

  if (loading) {
    return <ArticleDetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="Article Not Found"
          description="The article you are looking for does not exist or may have been archived."
          actionText="Return to Homepage"
          actionHref="/"
        />
      </div>
    );
  }

  const readTime = post ? calculateReadingTime(post.content) : 3;
  const displayTitle = language === 'ur' && translatedData ? translatedData.title : post.title;
  const displayExcerpt = language === 'ur' && translatedData ? translatedData.excerpt : post.excerpt;
  const displayContent = language === 'ur' && translatedData ? translatedData.content : post.content;

  const handleLanguageToggle = async (newLang: 'en' | 'ur') => {
    if (newLang === 'ur') {
      if (!translatedData && post) {
        setIsTranslating(true);
        try {
          const res = await translateArticle(post.title, post.excerpt, post.content);
          setTranslatedData(res);
          setLanguage('ur');
        } catch (err) {
          console.error('Translation error:', err);
        } finally {
          setIsTranslating(false);
        }
      } else {
        setLanguage('ur');
      }
    } else {
      setLanguage('en');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Sticky Top Scroll Reading Progress */}
      <ReadingProgress />

      {/* Dynamic SEO & JSON-LD Structured Data */}
      <SEO
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        image={post.featured_image}
        type="article"
        publishedTime={post.created_at}
        modifiedTime={post.updated_at}
        authorName={post.author_name}
        category={post.category}
        tags={post.tags}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: post.category, url: `/category/${post.category.toLowerCase()}` },
          { name: post.title, url: `/news/${post.slug}` },
        ]}
      />

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            to={`/category/${post.category.toLowerCase()}`}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors capitalize"
          >
            {post.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="truncate max-w-[200px] sm:max-w-md text-neutral-600 dark:text-neutral-300">
            {post.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="max-w-4xl mx-auto mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 mb-4">
            <Link
              to={`/category/${post.category.toLowerCase()}`}
              className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40"
            >
              {post.category}
            </Link>
          </div>

          <h1
            dir={language === 'ur' ? 'rtl' : 'ltr'}
            className={`font-extrabold text-neutral-950 dark:text-white mb-6 ${
              language === 'ur'
                ? 'urdu-headline text-2xl sm:text-3xl lg:text-4xl text-right font-bold'
                : 'text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.15]'
            }`}
          >
            {displayTitle}
          </h1>

          <p
            dir={language === 'ur' ? 'rtl' : 'ltr'}
            className={`text-neutral-600 dark:text-neutral-300 mb-6 ${
              language === 'ur'
                ? 'urdu-lead text-base sm:text-lg text-right not-italic'
                : 'text-lg sm:text-xl font-serif italic leading-relaxed'
            }`}
          >
            {displayExcerpt}
          </p>

          {/* Author Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/70 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-neutral-900 dark:text-white block">
                  {post.author_name}
                </span>
                <span className="text-[11px] text-neutral-400">PulseNews Editorial Staff</span>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.created_at)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {readTime} min read
              </span>
              {post.views > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-mono">
                    <Eye className="w-3.5 h-3.5" />
                    {post.views.toLocaleString()} views
                  </span>
                </>
              )}
              <LanguageSwitcher
                currentLang={language}
                onToggle={handleLanguageToggle}
                isLoading={isTranslating}
              />
              <ReadingControls
                fontSize={fontSize}
                setFontSize={setFontSize}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
              />
              <button
                onClick={() => toggleBookmark(post.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                  isBookmarked(post.id)
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                <span>{isBookmarked(post.id) ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Text-to-Speech Audio Player */}
          <AudioReader title={displayTitle} content={displayContent} lang={language} />
        </header>

        {/* Featured Image with Lightbox Zoom */}
        <div
          onClick={() => setLightboxData({ src: post.featured_image, alt: displayTitle })}
          className="relative max-w-5xl mx-auto mb-10 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm aspect-[21/9] group cursor-pointer"
        >
          <img
            src={post.featured_image}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/80 text-white text-xs font-semibold backdrop-blur-xs shadow-lg">
              <Maximize2 className="w-3.5 h-3.5" />
              Click to Expand & Zoom
            </span>
          </div>
        </div>

        {/* Two-Column Reading Layout: Main Article Content + Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content Column (8 cols) */}
          <div className="lg:col-span-8">
            {/* Social Sharing */}
            <div className="mb-8">
              <SocialShare title={post.title} />
            </div>

            {/* Mobile Table of Contents */}
            <TableOfContents headings={headings} />

            {/* AI 30-Second Key Takeaways Card */}
            <KeyTakeaways excerpt={displayExcerpt} content={displayContent} isUrdu={language === 'ur'} />

            {/* Core Markdown Body with dynamic typography */}
            <ArticleContent
              content={displayContent}
              onHeadingsExtracted={setHeadings}
              fontSize={fontSize}
              fontFamily={fontFamily}
              isUrdu={language === 'ur'}
              onImageClick={(src, alt) => setLightboxData({ src, alt })}
            />

            {/* Click-to-Tweet Quote Share Snippet */}
            <QuoteShare quote={displayExcerpt} author={post.author_name} />

            {/* Interactive Benchmark Matrix (Shown on AI & Tech articles) */}
            {(post.category === 'AI' || post.category === 'Technology') && (
              <BenchmarkWidget />
            )}


            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-6 mt-8 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                  Categorized Tags
                </span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reader Sentiment Reactions */}
            <ArticleReactions postId={post.id} />

            {/* Bottom Social Share */}
            <div className="mt-8">
              <SocialShare title={post.title} />
            </div>

            {/* Comments & Discussion System */}
            <CommentsSection postId={post.id} />

            {/* Related Articles */}
            <RelatedArticles posts={related} />
          </div>

          {/* Sidebar Column (4 cols) */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Sticky Table of Contents on Desktop */}
            <TableOfContents headings={headings} />


            {/* In-Article Newsletter Card */}
            <NewsletterSignup variant="sidebar" />
          </aside>

        </div>
      </article>

      {/* Floating Story AI Copilot Trigger */}
      <button
        onClick={() => setAiAssistantOpen(true)}
        className="fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all border border-neutral-700/60 dark:border-neutral-200 cursor-pointer group"
      >
        <Sparkles className="w-4 h-4 text-blue-400 dark:text-blue-600 animate-pulse" />
        <span>Ask Story AI</span>
      </button>

      {/* Fullscreen Image Lightbox Modal */}
      <ImageLightbox
        isOpen={Boolean(lightboxData)}
        onClose={() => setLightboxData(null)}
        imageSrc={lightboxData?.src || post.featured_image}
        altText={lightboxData?.alt || displayTitle}
        caption={lightboxData?.alt || `Graphic: ${displayTitle}`}
      />

      {/* Scoped AI Copilot Drawer */}
      <ArticleAIAssistant
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        articleTitle={displayTitle}
        articleContent={displayContent}
      />

      {/* Up Next Continuous Story Dock */}
      <NextStoryDock nextPost={related[0] || null} />
    </div>
  );
};
