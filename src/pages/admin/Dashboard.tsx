import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminAnalytics, AdminStats } from '@/services/analytics';
import { getAllPostsAdmin } from '@/services/posts';
import { Post } from '@/types/article';
import { useAuth } from '@/context/AuthContext';
import { SEO } from '@/components/seo/SEO';
import {
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Users,
  Plus,
  LogOut,
  ExternalLink,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatRelativeTime } from '@/lib/utils';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [statsData, postsData] = await Promise.all([
          getAdminAnalytics(),
          getAllPostsAdmin(),
        ]);
        setStats(statsData);
        setRecentPosts(postsData.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#070B0E] py-8">
      <SEO noindex title="Editorial Dashboard" description="PulseNews Pakistan Administrative Content Management System." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                Staff CMS
              </span>
              <span className="text-xs text-neutral-400 font-mono">v2.0.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight mt-1">
              Editorial Operations
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Logged in as {user?.email || 'haroon409@pulsenews.pk'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/posts/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Article</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827] text-neutral-600 dark:text-neutral-300 hover:text-red-500 dark:hover:text-red-400 text-xs font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link
            to="/admin"
            className="px-3 py-2 rounded-lg bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-400 border border-neutral-200 dark:border-neutral-800 shadow-sm"
          >
            Dashboard Overview
          </Link>
          <Link
            to="/admin/posts"
            className="px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            All Articles & Archive
          </Link>
        </div>

        {/* 5 Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827]">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Articles</span>
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-2xl font-black text-neutral-950 dark:text-white font-mono">
              {loading ? '—' : stats?.totalArticles}
            </span>
          </div>

          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827]">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Published</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {loading ? '—' : stats?.publishedArticles}
            </span>
          </div>

          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827]">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Drafts</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {loading ? '—' : stats?.draftArticles}
            </span>
          </div>

          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827]">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Reads</span>
              <Eye className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
              {loading ? '—' : stats?.totalViews.toLocaleString()}
            </span>
          </div>

          <div className="col-span-2 lg:col-span-1 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827]">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Subscribers</span>
              <Users className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {loading ? '—' : stats?.subscribers}
            </span>
          </div>
        </div>

        {/* Analytics Chart & Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Chart: Most Viewed Articles */}
          <div className="lg:col-span-8 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                  Audience Engagement (Top Stories)
                </h3>
              </div>
              <span className="text-xs text-neutral-400">Views per article</span>
            </div>

            <div className="h-64 w-full">
              {stats && stats.viewsByArticle.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.viewsByArticle}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="title" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #1F2937',
                        borderRadius: '8px',
                        color: '#F9FAFB',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="views" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                  Insufficient data for chart
                </div>
              )}
            </div>
          </div>

          {/* Category Distribution Breakdown */}
          <div className="lg:col-span-4 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827]">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Category Distribution
              </h3>
            </div>

            <div className="space-y-3">
              {stats?.categoryDistribution.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{
                          width: `${Math.min(100, (cat.count / (stats.totalArticles || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="font-mono text-neutral-400 w-5 text-right">{cat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Recent Articles Table Preview */}
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111827]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Recently Ingested / Authored Stories
            </h3>
            <Link
              to="/admin/posts"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Full Archive ({stats?.totalArticles}) →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-2">Article Title</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Views</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {recentPosts.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-2 font-medium text-neutral-900 dark:text-white max-w-xs truncate">
                      {p.title}
                    </td>
                    <td className="py-3 px-2 text-neutral-500">{p.category}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'published'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono text-neutral-500">{p.views.toLocaleString()}</td>
                    <td className="py-3 px-2 text-neutral-400">{formatRelativeTime(p.created_at)}</td>
                    <td className="py-3 px-2 text-right space-x-2">
                      <Link
                        to={`/news/${p.slug}`}
                        target="_blank"
                        className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white inline-flex items-center"
                        title="View Live"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/admin/posts/${p.id}/edit`}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
