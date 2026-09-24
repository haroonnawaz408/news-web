-- ====================================================================
-- TechPulse Migration 002: Comments, Reactions, Bookmarks & Scheduling
-- ====================================================================

-- 1. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('approved', 'pending', 'flagged')) DEFAULT 'approved',
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

-- 2. ARTICLE REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  UNIQUE(post_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON public.post_reactions(post_id);

-- 3. SCHEDULED PUBLISHING SUPPORT IN POSTS
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- 4. ATOMIC REACTION INCREMENT RPC
CREATE OR REPLACE FUNCTION public.increment_post_reaction(target_post_id UUID, target_reaction TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.post_reactions (post_id, reaction_type, count)
  VALUES (target_post_id, target_reaction, 1)
  ON CONFLICT (post_id, reaction_type)
  DO UPDATE SET count = public.post_reactions.count + 1;
END;
$$;

-- 5. SCHEDULED POSTS AUTO-PUBLISH FUNCTION
CREATE OR REPLACE FUNCTION public.publish_scheduled_posts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.posts
  SET status = 'published'
  WHERE status = 'draft' 
    AND scheduled_at IS NOT NULL 
    AND scheduled_at <= NOW();
    
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- 6.1 Comments Policies
CREATE POLICY "Public users can view approved comments"
  ON public.comments FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Public users can post comments"
  ON public.comments FOR INSERT
  WITH CHECK (length(trim(content)) > 2 AND length(trim(user_name)) > 1);

CREATE POLICY "Admins can manage all comments"
  ON public.comments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6.2 Reactions Policies
CREATE POLICY "Public can view reactions"
  ON public.post_reactions FOR SELECT
  USING (true);

CREATE POLICY "Public can increment reactions via RPC"
  ON public.post_reactions FOR INSERT
  WITH CHECK (true);
