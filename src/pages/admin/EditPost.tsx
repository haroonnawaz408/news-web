import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getPostById, updatePost } from '@/services/posts';
import { CATEGORIES } from '@/lib/constants';
import { useToast } from '@/components/common/Toast';
import { SEO } from '@/components/seo/SEO';
import { ArticleContent } from '@/components/articles/ArticleContent';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ArrowLeft, Save, Eye, Edit3, Image as ImageIcon, Calendar } from 'lucide-react';

export const AdminEditPost: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0].name);
  const [tagsInput, setTagsInput] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('draft');
  const [scheduledAt, setScheduledAt] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      try {
        const found = await getPostById(id);
        if (found) {
          setTitle(found.title);
          setSlug(found.slug);
          setCategory(found.category);
          setTagsInput(found.tags?.join(', ') || '');
          setExcerpt(found.excerpt || '');
          setContent(found.content);
          setFeaturedImage(found.featured_image || '');
          setStatus(found.status);
          setMetaTitle(found.meta_title || '');
          setMetaDescription(found.meta_description || '');
          setAuthorName(found.author_name || 'PulseNews Editorial Board');
          if ((found as any).scheduled_at) {
            const d = new Date((found as any).scheduled_at);
            setScheduledAt(d.toISOString().slice(0, 16));
          }
        } else {
          toast('Post not found in database', 'error');
          navigate('/admin/posts');
        }
      } catch (err) {
        console.error('Failed to load post:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [id, navigate, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast('Title and content are required.', 'error');
      return;
    }

    setSaving(true);
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      const updated = await updatePost(id, {
        title,
        slug,
        category,
        tags,
        excerpt,
        content,
        featured_image: featuredImage,
        status,
        meta_title: metaTitle,
        meta_description: metaDescription,
        author_name: authorName,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      } as any);

      if (updated) {
        toast(`Article "${updated.title}" updated successfully!`, 'success');
        navigate('/admin/posts');
      }
    } catch {
      toast('Failed to update article.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-neutral-400">
        Loading article details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#070B0E] py-8">
      <SEO title={`Editing: ${title}`} description="Edit article parameters and body." />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <Link
            to="/admin/posts"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Articles</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStatus(status === 'published' ? 'draft' : 'published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                status === 'published'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
              }`}
            >
              Status: {status}
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Update Article'}</span>
            </button>
          </div>
        </div>

        {/* Editor Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white dark:bg-[#111827] p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Article Headline *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Author / Byline
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Editorial Excerpt
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Featured Image
                </label>
                <ImageUploader
                  currentUrl={featuredImage}
                  onImageUploaded={(url) => setFeaturedImage(url)}
                />
                <div className="relative mt-2">
                  <ImageIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Schedule Publication (Optional)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Markdown Content & Live Preview */}
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                Article Body (Markdown Supported)
              </span>
              <div className="flex items-center gap-1 bg-neutral-200 dark:bg-neutral-800 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'write'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'write' ? (
                <textarea
                  required
                  rows={16}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="p-6 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#0B0F14]">
                  <ArticleContent content={content} />
                </div>
              )}
            </div>
          </div>

          {/* SEO Metadata Card */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              Search Engine Optimization (SEO) Overrides
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Custom Meta Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Custom Meta Description
                </label>
                <input
                  type="text"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
