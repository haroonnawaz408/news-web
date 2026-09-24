import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Post } from '@/types/article';
import { SAMPLE_POSTS } from '@/lib/constants';

// Local storage key for fallback persistence in demo/dev mode
const LOCAL_POSTS_KEY = 'techpulse_local_posts';

function getLocalPosts(): Post[] {
  try {
    const saved = localStorage.getItem(LOCAL_POSTS_KEY);
    if (saved) {
      const parsed: Post[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.some(p => (p.category || '').toLowerCase() === 'pakistan')) {
        return parsed;
      }
      localStorage.removeItem(LOCAL_POSTS_KEY);
    }
  } catch (err) {
    console.warn('Error reading from local storage:', err);
  }
  return [...SAMPLE_POSTS];
}

function saveLocalPosts(posts: Post[]) {
  try {
    localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(posts));
  } catch (err) {
    console.warn('Error saving to local storage:', err);
  }
}

// High-speed in-memory & sessionStorage cache layer for 0ms page transitions
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const MEMORY_CACHE = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — synced with pipeline run interval

export function getCached<T>(key: string): T | null {
  const entry = MEMORY_CACHE.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  try {
    const raw = sessionStorage.getItem(`cache_${key}`);
    if (raw) {
      const parsed: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        MEMORY_CACHE.set(key, parsed);
        return parsed.data;
      }
    }
  } catch {}
  return null;
}

/** Clears all in-memory and sessionStorage caches — triggers fresh data load */
export function invalidateAllCaches() {
  MEMORY_CACHE.clear();
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith('cache_')) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k));
  } catch {}
}

export function setCached<T>(key: string, data: T) {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  MEMORY_CACHE.set(key, entry);
  try {
    sessionStorage.setItem(`cache_${key}`, JSON.stringify(entry));
  } catch {}
}

export interface HomepageFeedData {
  featured: Post | null;
  trending: Post[];
  latest: Post[];
  total: number;
  pakistan: Post[];
  politics: Post[];
  sports: Post[];
  business: Post[];
  ai: Post[];
  allPosts: Post[];
}

/**
 * High-performance consolidated loader:
 * Replaces 7 separate cloud database calls with 1 single optimized batch query.
 * Delivers instant 0ms responses from cache on repeat visits and powers instant category filtering.
 */
export async function getHomepageFeed(): Promise<HomepageFeedData> {
  const cacheKey = 'homepage_feed_v7_pakistan_first';
  const cached = getCached<HomepageFeedData>(cacheKey);
  if (cached) {
    return cached;
  }

  let allPosts: Post[] = [];

  if (isSupabaseConfigured() && supabase) {
    try {
      // 1 single lightning-fast query for up to 120 latest posts
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(200);

      if (!error && data && data.length > 0) {
        allPosts = data as Post[];
        saveLocalPosts(allPosts);
      }
    } catch (err) {
      console.warn('Supabase getHomepageFeed error, using local fallback:', err);
    }
  }

  if (allPosts.length === 0) {
    allPosts = getLocalPosts().filter((p) => p.status === 'published');
  }

  // Separate Pakistan national dispatches and global categories
  const pakistan = allPosts.filter(p => (p.category || '').toLowerCase() === 'pakistan');
  const otherPosts = allPosts.filter(p => (p.category || '').toLowerCase() !== 'pakistan');

  // Pakistan Priority: Feature the top breaking national story as the main hero article
  const featured = pakistan.length > 0 ? pakistan[0] : (allPosts[0] || null);

  // Trending: Mix top national dispatches with global trending stories
  const pakistanTrending = pakistan.slice(1, 4);
  const otherTrending = [...otherPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);
  const trending = [...pakistanTrending, ...otherTrending].slice(0, 6);

  // Latest wire: Place Pakistan national news right at the front of the feed (18 initial posts)
  const latest = [...pakistan, ...otherPosts].slice(0, 18);

  const politics = allPosts.filter(p => (p.category || '').toLowerCase() === 'politics').slice(0, 6);
  const sports = allPosts.filter(p => (p.category || '').toLowerCase() === 'sports').slice(0, 6);
  const business = allPosts.filter(p => (p.category || '').toLowerCase() === 'business').slice(0, 6);
  const ai = allPosts.filter(p => ['ai', 'technology'].includes((p.category || '').toLowerCase())).slice(0, 6);

  const result: HomepageFeedData = {
    featured,
    trending,
    latest,
    total: allPosts.length,
    pakistan: pakistan.slice(0, 12),
    politics,
    sports,
    business,
    ai,
    allPosts,
  };

  setCached(cacheKey, result);
  return result;
}

export async function getFeaturedPost(): Promise<Post | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as Post;
    } catch (err) {
      console.warn('Supabase getFeaturedPost query error, using local fallback:', err);
    }
  }

  const posts = getLocalPosts().filter((p) => p.status === 'published');
  return posts.length > 0 ? posts[0] : null;
}

export async function getLatestPosts(limit: number = 9, offset: number = 0): Promise<{ posts: Post[]; total: number }> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error, count } = await supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return {
        posts: (data || []) as Post[],
        total: count || (data?.length ?? 0),
      };
    } catch (err) {
      console.warn('Supabase getLatestPosts error, using local fallback:', err);
    }
  }

  const allPublished = getLocalPosts()
    .filter((p) => p.status === 'published')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    posts: allPublished.slice(offset, offset + limit),
    total: allPublished.length,
  };
}

export async function getTrendingPosts(limit: number = 5): Promise<Post[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (data && data.length > 0) return data as Post[];
    } catch (err) {
      console.warn('Supabase getTrendingPosts error, using local fallback:', err);
    }
  }

  return getLocalPosts()
    .filter((p) => p.status === 'published')
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export async function getPostsByCategory(
  category: string,
  limit: number = 9,
  offset: number = 0
): Promise<{ posts: Post[]; total: number }> {
  const normCategory = category.toLowerCase();
  const cacheKey = `cat_${normCategory}_${limit}_${offset}`;
  const cached = getCached<{ posts: Post[]; total: number }>(cacheKey);
  if (cached) return cached;

  let result: { posts: Post[]; total: number } | null = null;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error, count } = await supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .ilike('category', normCategory)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      result = {
        posts: (data || []) as Post[],
        total: count || (data?.length ?? 0),
      };
    } catch (err) {
      console.warn('Supabase getPostsByCategory error, using local fallback:', err);
    }
  }

  if (!result) {
    const filtered = getLocalPosts()
      .filter((p) => p.status === 'published' && p.category.toLowerCase() === normCategory)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    result = {
      posts: filtered.slice(offset, offset + limit),
      total: filtered.length,
    };
  }

  setCached(cacheKey, result);
  return result;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const cacheKey = `post_slug_${slug}`;
  const cached = getCached<Post>(cacheKey);
  if (cached) return cached;

  let found: Post | null = null;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      if (data) found = data as Post;
    } catch (err) {
      console.warn('Supabase getPostBySlug error, using local fallback:', err);
    }
  }

  if (!found) {
    found = getLocalPosts().find((p) => p.slug === slug) || null;
  }

  if (found) {
    setCached(cacheKey, found);
  }
  return found;
}

export async function getRelatedPosts(
  category: string,
  tags: string[] = [],
  currentPostId: string,
  limit: number = 3
): Promise<Post[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .neq('id', currentPostId)
        .eq('status', 'published')
        .ilike('category', category.toLowerCase())
        .limit(limit);

      if (error) throw error;
      if (data && data.length > 0) return data as Post[];
    } catch (err) {
      console.warn('Supabase getRelatedPosts error, using local fallback:', err);
    }
  }

  const others = getLocalPosts().filter((p) => p.id !== currentPostId && p.status === 'published');
  const matched = others.filter((p) => {
    if (p.category.toLowerCase() === category.toLowerCase()) return true;
    return p.tags?.some((t) => tags.includes(t));
  });

  return (matched.length > 0 ? matched : others).slice(0, limit);
}

export async function searchPosts(query: string, limit: number = 20): Promise<Post[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${cleanQuery}%,excerpt.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (data) return data as Post[];
    } catch (err) {
      console.warn('Supabase searchPosts error, using local fallback:', err);
    }
  }

  return getLocalPosts().filter((p) => {
    if (p.status !== 'published') return false;
    const inTitle = p.title.toLowerCase().includes(cleanQuery);
    const inExcerpt = p.excerpt?.toLowerCase().includes(cleanQuery);
    const inCat = p.category.toLowerCase().includes(cleanQuery);
    const inTag = p.tags?.some((t) => t.toLowerCase().includes(cleanQuery));
    return inTitle || inExcerpt || inCat || inTag;
  });
}

export async function incrementPostViews(postId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    try {
      // Call secure RPC
      await (supabase as any).rpc('increment_post_views', { target_post_id: postId });
      return;
    } catch (err) {
      console.warn('Supabase incrementPostViews RPC failed:', err);
    }
  }

  // Update in local fallback
  const posts = getLocalPosts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx !== -1) {
    posts[idx].views = (posts[idx].views || 0) + 1;
    saveLocalPosts(posts);
  }
}

// ---------------- Admin Post Operations ----------------

export async function getAllPostsAdmin(): Promise<Post[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) return data as Post[];
    } catch (err) {
      console.warn('Supabase getAllPostsAdmin error, using local fallback:', err);
    }
  }

  return getLocalPosts().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getPostById(id: string): Promise<Post | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as Post;
    } catch (err) {
      console.warn('Supabase getPostById error, using local fallback:', err);
    }
  }

  return getLocalPosts().find((p) => p.id === id) || null;
}

export async function createPost(postData: Partial<Post>): Promise<Post> {
  const newPost: Post = {
    id: postData.id || crypto.randomUUID(),
    title: postData.title || 'Untitled Post',
    slug: postData.slug || `post-${Date.now()}`,
    excerpt: postData.excerpt || '',
    content: postData.content || '',
    category: postData.category || 'Technology',
    tags: postData.tags || [],
    featured_image: postData.featured_image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
    status: postData.status || 'draft',
    views: postData.views || 0,
    meta_title: postData.meta_title || postData.title,
    meta_description: postData.meta_description || postData.excerpt,
    source_url: postData.source_url || null,
    source_name: postData.source_name || null,
    author_id: postData.author_id || null,
    author_name: postData.author_name || 'Editorial Staff',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await (supabase.from('posts') as any)
        .insert(newPost)
        .select()
        .single();

      if (error) throw error;
      invalidateAllCaches();
      return data as Post;
    } catch (err) {
      console.warn('Supabase createPost error, falling back to local storage:', err);
    }
  }

  const posts = getLocalPosts();
  posts.unshift(newPost);
  saveLocalPosts(posts);
  invalidateAllCaches();
  return newPost;
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<Post | null> {
  const updatedFields = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await (supabase.from('posts') as any)
        .update(updatedFields)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      invalidateAllCaches();
      return data as Post;
    } catch (err) {
      console.warn('Supabase updatePost error, falling back to local storage:', err);
    }
  }

  const posts = getLocalPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    posts[idx] = { ...posts[idx], ...updatedFields };
    saveLocalPosts(posts);
    invalidateAllCaches();
    return posts[idx];
  }
  return null;
}

export async function deletePost(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await (supabase.from('posts') as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      invalidateAllCaches();
      return true;
    } catch (err) {
      console.warn('Supabase deletePost error, falling back to local storage:', err);
    }
  }

  const posts = getLocalPosts();
  const filtered = posts.filter((p) => p.id !== id);
  saveLocalPosts(filtered);
  invalidateAllCaches();
  return true;
}
