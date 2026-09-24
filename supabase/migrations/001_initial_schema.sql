-- ====================================================================
-- TechPulse News Portal - Supabase PostgreSQL Database Migration
-- Version: 001_initial_schema.sql
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fast article searching

-- 2. AUTHORS TABLE
CREATE TABLE IF NOT EXISTS public.authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Tech Editor',
  bio TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  featured_image TEXT,
  status TEXT CHECK (status IN ('published', 'draft')) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  source_url TEXT,
  source_name TEXT,
  author_id UUID REFERENCES public.authors(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'Editorial Staff',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. POST VIEWS (ANALYTICS)
CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts (category);
CREATE INDEX IF NOT EXISTS idx_posts_status_created ON public.posts (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_views ON public.posts (views DESC);
CREATE INDEX IF NOT EXISTS idx_posts_search ON public.posts USING gin (to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || category));

-- 7. ATOMIC VIEW INCREMENT RPC
CREATE OR REPLACE FUNCTION public.increment_post_views(target_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert view record
  INSERT INTO public.post_views (post_id) VALUES (target_post_id);
  
  -- Increment post view counter
  UPDATE public.posts
  SET views = views + 1
  WHERE id = target_post_id;
END;
$$;

-- 8. AUTO-UPDATE UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_posts_updated_at ON public.posts;
CREATE TRIGGER trg_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 9.1 Public Read Policies
CREATE POLICY "Public users can read published posts"
  ON public.posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public users can view authors"
  ON public.authors FOR SELECT
  USING (true);

-- 9.2 Newsletter Subscription Policy
CREATE POLICY "Public users can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (email IS NOT NULL AND position('@' in email) > 1);

-- 9.3 Admin / Authenticated User Full Access Policies
CREATE POLICY "Authenticated admins have full access to posts"
  ON public.posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins have full access to authors"
  ON public.authors FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins can view subscribers"
  ON public.newsletter_subscribers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated admins can view analytics"
  ON public.post_views FOR SELECT
  TO authenticated
  USING (true);
