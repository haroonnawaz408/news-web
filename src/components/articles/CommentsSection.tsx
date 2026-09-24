import React, { useState, useEffect } from 'react';
import { CommentItem, getCommentsByPostId, addComment } from '@/services/comments';
import { MessageSquare, Reply, Send } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

interface CommentsSectionProps {
  postId: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const loadComments = async () => {
    try {
      const data = await getCommentsByPostId(postId);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !authorName.trim()) {
      toast('Please enter your name and comment.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await addComment(postId, authorName, commentText);
      setCommentText('');
      toast('Comment posted successfully!', 'success');
      loadComments();
    } catch {
      toast('Failed to post comment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyText.trim() || !authorName.trim()) {
      toast('Please provide your name and reply text.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await addComment(postId, authorName, replyText, parentId);
      setReplyText('');
      setReplyingTo(null);
      toast('Reply posted!', 'success');
      loadComments();
    } catch {
      toast('Failed to submit reply.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (item: CommentItem, isReply = false) => {
    const initials = item.user_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <div key={item.id} className={`group ${isReply ? 'mt-3 pl-4 sm:pl-8 border-l-2 border-neutral-200 dark:border-neutral-800' : 'py-4 border-b border-neutral-100 dark:border-neutral-800'}`}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                {item.user_name}
              </span>
              <span className="text-[11px] text-neutral-400">
                {formatRelativeTime(item.created_at)}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed whitespace-pre-line">
              {item.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => setReplyingTo(replyingTo === item.id ? null : item.id)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>{replyingTo === item.id ? 'Cancel' : 'Reply'}</span>
              </button>
            </div>

            {/* Inline Reply Form */}
            {replyingTo === item.id && (
              <div className="mt-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <input
                  type="text"
                  placeholder="Your Name..."
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Reply to ${item.user_name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handlePostReply(item.id)}
                    disabled={submitting}
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}

            {/* Nested replies */}
            {item.replies && item.replies.length > 0 && (
              <div className="space-y-1">
                {item.replies.map((reply) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800" aria-label="Article Discussion">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          Discussion ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
        </h3>
      </div>

      {/* Main Comment Form */}
      <form onSubmit={handlePostComment} className="mb-8 p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-3">
        <div className="max-w-xs">
          <input
            type="text"
            required
            placeholder="Your Name (e.g. John, Systems Engineer)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <textarea
          required
          rows={3}
          placeholder="Share your perspective or ask a technical question..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="py-6 text-center text-xs text-neutral-400">Loading conversation...</div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500 italic">
          No comments yet. Be the first to start the discussion!
        </div>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </section>
  );
};
