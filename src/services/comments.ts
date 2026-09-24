import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface CommentItem {
  id: string;
  post_id: string;
  user_name: string;
  user_email?: string | null;
  content: string;
  parent_id?: string | null;
  status: 'approved' | 'pending' | 'flagged';
  likes: number;
  created_at: string;
  replies?: CommentItem[];
}

const LOCAL_COMMENTS_KEY = 'techpulse_local_comments';

function getLocalComments(): CommentItem[] {
  try {
    const saved = localStorage.getItem(LOCAL_COMMENTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn('Error reading local comments:', err);
  }
  // Default sample comments for initial test
  return [
    {
      id: 'c1',
      post_id: 'e29d71bf-9b93-4a1d-a001-1b7cb1d00001',
      user_name: 'Dr. Alex Chen',
      content: 'The observation about test-time search scaling completely resonates with our team findings. We saw significant accuracy jumps once we allowed the model 10-15 seconds of execution verification.',
      status: 'approved',
      likes: 14,
      created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
    },
    {
      id: 'c2',
      post_id: 'e29d71bf-9b93-4a1d-a001-1b7cb1d00001',
      parent_id: 'c1',
      user_name: 'Sarah Jenkins (Systems Architect)',
      content: 'Agreed! Especially when dealing with multi-file AST validation. Are you guys compiling the tests inside Firecracker microVMs?',
      status: 'approved',
      likes: 6,
      created_at: new Date(Date.now() - 1800 * 1000).toISOString(),
    },
  ];
}

function saveLocalComments(comments: CommentItem[]) {
  try {
    localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(comments));
  } catch (err) {
    console.warn('Error saving local comments:', err);
  }
}

export async function getCommentsByPostId(postId: string): Promise<CommentItem[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        return buildCommentTree(data as CommentItem[]);
      }
    } catch (err) {
      console.warn('Supabase getComments error, using local fallback:', err);
    }
  }

  const all = getLocalComments().filter((c) => c.post_id === postId && c.status === 'approved');
  return buildCommentTree(all);
}

export async function addComment(
  postId: string,
  userName: string,
  content: string,
  parentId?: string
): Promise<CommentItem> {
  const newComment: CommentItem = {
    id: crypto.randomUUID(),
    post_id: postId,
    user_name: userName.trim(),
    content: content.trim(),
    parent_id: parentId || null,
    status: 'approved',
    likes: 0,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await (supabase.from('comments') as any)
        .insert(newComment)
        .select()
        .single();

      if (error) throw error;
      return data as CommentItem;
    } catch (err) {
      console.warn('Supabase addComment failed, using local storage:', err);
    }
  }

  const comments = getLocalComments();
  comments.push(newComment);
  saveLocalComments(comments);
  return newComment;
}

function buildCommentTree(flat: CommentItem[]): CommentItem[] {
  const map = new Map<string, CommentItem>();
  const roots: CommentItem[] = [];

  flat.forEach((item) => {
    map.set(item.id, { ...item, replies: [] });
  });

  flat.forEach((item) => {
    const node = map.get(item.id)!;
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id)!.replies!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
