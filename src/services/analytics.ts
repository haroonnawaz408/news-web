import { getAllPostsAdmin } from './posts';
import { getSubscribersCount } from './newsletter';

export interface AdminStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  subscribers: number;
  categoryDistribution: { name: string; count: number }[];
  viewsByArticle: { title: string; views: number }[];
}

export async function getAdminAnalytics(): Promise<AdminStats> {
  const posts = await getAllPostsAdmin();
  const subscribers = await getSubscribersCount();

  const totalArticles = posts.length;
  const publishedArticles = posts.filter((p) => p.status === 'published').length;
  const draftArticles = posts.filter((p) => p.status === 'draft').length;
  const totalViews = posts.reduce((acc, curr) => acc + (curr.views || 0), 0);

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  posts.forEach((p) => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
  });

  const categoryDistribution = Object.entries(categoryMap).map(([name, count]) => ({
    name,
    count,
  }));

  // Top 5 viewed for charts
  const viewsByArticle = [...posts]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)
    .map((p) => ({
      title: p.title.length > 25 ? p.title.slice(0, 25) + '...' : p.title,
      views: p.views || 0,
    }));

  return {
    totalArticles,
    publishedArticles,
    draftArticles,
    totalViews,
    subscribers,
    categoryDistribution,
    viewsByArticle,
  };
}
