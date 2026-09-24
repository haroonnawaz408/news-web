import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPostsAdmin, deletePost, updatePost } from '@/services/posts';
import { Post } from '@/types/article';
import { CATEGORIES } from '@/lib/constants';
import { useToast } from '@/components/common/Toast';
import { SEO } from '@/components/seo/SEO';
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export const AdminPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  const { toast } = useToast();

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await getAllPostsAdmin();
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleToggleStatus = async (post: Post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await updatePost(post.id, { status: newStatus });
      toast(`Article status changed to ${newStatus}`, 'info');
      loadPosts();
    } catch {
      toast('Failed to update status', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await deletePost(postToDelete.id);
      toast(`Deleted "${postToDelete.title}"`, 'success');
      setPostToDelete(null);
      loadPosts();
    } catch {
      toast('Failed to delete post', 'error');
    }
  };

  const filtered = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesCategory =
      categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#070B0E] py-8">
      <SEO noindex title="Article Management" description="Manage, edit, publish and delete articles." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl font-black text-neutral-950 dark:text-white tracking-tight">
              Article Catalog & CMS Archive
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Manage publication status, SEO parameters, and long-form markdown content.
            </p>
          </div>

          <Link
            to="/admin/posts/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Article</span>
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-[#111827] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by headline or slug..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
              className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Headline</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Views</th>
                  <th className="py-3.5 px-3">Author</th>
                  <th className="py-3.5 px-3">Created</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-400">
                      Loading article catalog...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-400">
                      No articles match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((post) => (
                    <tr key={post.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-neutral-900 dark:text-white truncate">
                          {post.title}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono truncate">
                          /{post.slug}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-neutral-600 dark:text-neutral-300">
                        {post.category}
                      </td>
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => handleToggleStatus(post)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                            post.status === 'published'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:opacity-80'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 hover:opacity-80'
                          }`}
                          title="Click to toggle published / draft"
                        >
                          {post.status === 'published' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{post.status}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-neutral-500">
                        {post.views.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-neutral-600 dark:text-neutral-400 truncate max-w-[120px]">
                        {post.author_name}
                      </td>
                      <td className="py-3.5 px-3 text-neutral-400">
                        {formatRelativeTime(post.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <Link
                          to={`/news/${post.slug}`}
                          target="_blank"
                          className="p-1.5 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white inline-block transition-colors"
                          title="Preview Live Post"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/admin/posts/${post.id}/edit`}
                          className="p-1.5 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 inline-block transition-colors"
                          title="Edit Article"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setPostToDelete(post)}
                          className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 inline-block transition-colors cursor-pointer"
                          title="Delete Article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {postToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#111827] p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-neutral-950 dark:text-white">
                Confirm Deletion
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Are you sure you want to delete <strong className="text-neutral-900 dark:text-white">"{postToDelete.title}"</strong>? This will permanently remove the article from the database.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setPostToDelete(null)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
