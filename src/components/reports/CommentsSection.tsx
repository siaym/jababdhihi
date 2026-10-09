'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  CornerDownRight,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertCircle,
  Flag,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PublicComment } from '@/types';
import { formatDate } from '@/lib/utils';

interface CommentsSectionProps {
  reportId: string;
  reportNumber: string;
  initialComments: PublicComment[];
  commentsDisabled?: boolean;
  locale?: 'bn' | 'en';
}

export function CommentsSection({
  reportId,
  reportNumber,
  initialComments = [],
  commentsDisabled = false,
  locale = 'bn',
}: CommentsSectionProps) {
  const [comments, setComments] = useState<PublicComment[]>(initialComments);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'helpful' | 'newest'>('helpful');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});

  const handleUpvote = (commentId: string) => {
    if (upvotedIds[commentId]) return;

    setUpvotedIds((prev) => ({ ...prev, [commentId]: true }));
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return { ...c, upvotes: c.upvotes + 1 };
        }
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === commentId ? { ...r, upvotes: r.upvotes + 1 } : r
            ),
          };
        }
        return c;
      })
    );
  };

  const handleFlag = (commentId: string) => {
    setFlaggedIds((prev) => ({ ...prev, [commentId]: true }));
    alert(
      locale === 'bn'
        ? 'মন্তব্যটি পর্যালোচনা ও ফিল্টারিংয়ের জন্য ফ্ল্যাগ করা হয়েছে।'
        : 'Comment reported to human moderation team for safety review.'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      // Simulate submission with moderation check
      await new Promise((res) => setTimeout(res, 400));

      const newComment: PublicComment = {
        id: `cmt-${Date.now()}`,
        report_id: reportId,
        author_name: authorName.trim() || (locale === 'bn' ? 'সচেতন নাগরিক' : 'Concerned Citizen'),
        comment_text: commentText.trim(),
        status: 'approved',
        upvotes: 1,
        created_at: new Date().toISOString(),
      };

      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
      setFeedback(
        locale === 'bn'
          ? 'আপনার মন্তব্যটি সুরক্ষিতভাবে রেকর্ড করা হয়েছে।'
          : 'Your comment has been submitted and published under community moderation guidelines.'
      );
      setTimeout(() => setFeedback(null), 5000);
    } catch {
      // Error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = (parentId: string) => {
    if (!replyText.trim()) return;

    const newReply: PublicComment = {
      id: `rep-${Date.now()}`,
      report_id: reportId,
      author_name: authorName.trim() || (locale === 'bn' ? 'নাগরিক' : 'Citizen'),
      comment_text: replyText.trim(),
      status: 'approved',
      upvotes: 1,
      created_at: new Date().toISOString(),
      parent_id: parentId,
    };

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply],
          };
        }
        return c;
      })
    );

    setReplyingToId(null);
    setReplyText('');
  };

  // Sort
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'helpful') return b.upvotes - a.upvotes;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (commentsDisabled) {
    return (
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
        <ShieldAlert className="w-6 h-6 text-slate-400 mx-auto" />
        <h4 className="text-xs font-bold text-slate-700">
          {locale === 'bn' ? 'এই প্রতিবেদনে আলোচনা বন্ধ রয়েছে' : 'Discussion Paused for this Report'}
        </h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {locale === 'bn'
            ? 'সাক্ষী ও তথ্যের সংবেদনশীলতা রক্ষায় এই প্রতিবেদনের প্রকাশ্য মন্তব্য সাময়িকভাবে স্থগিত রাখা হয়েছে।'
            : 'Public discussion has been paused on this case to safeguard ongoing fact-finding and protect witness safety.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Header Row */}
      <div className="space-y-1.5 pb-2 border-b border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#C62828]" />
            <span>{locale === 'bn' ? 'মানুষ কী বলছে?' : 'What are people saying?'}</span>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              ({comments.length})
            </span>
          </h3>

          {/* Sort Controls */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium">{locale === 'bn' ? 'সাজান:' : 'Sort:'}</span>
            <button
              onClick={() => setSortBy('helpful')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                sortBy === 'helpful'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {locale === 'bn' ? 'শীর্ষ' : 'Top'}
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                sortBy === 'newest'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {locale === 'bn' ? 'নতুন' : 'Newest'}
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {locale === 'bn'
            ? 'নাগরিকদের শেয়ার করা অতিরিক্ত তথ্য, প্রত্যক্ষদর্শীর বিবরণ, তথ্য সংশোধন ও প্রাসঙ্গিক আপডেট পড়ুন।'
            : 'Read additional information, eyewitness accounts, corrections, and relevant updates shared by the community.'}
        </p>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800">
            {locale === 'bn' ? 'তথ্য বা মন্তব্য যোগ করুন:' : 'Add useful information or a comment:'}
          </span>
          <span className="text-[11px] text-slate-400">
            {locale === 'bn' ? 'পর্যালোচিত আলোচনা' : 'Moderated discussion'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder={locale === 'bn' ? 'আপনার নাম বা পরিচয় (ঐচ্ছিক)' : 'Your name or handle (optional)'}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
            maxLength={50}
          />
        </div>

        <textarea
          rows={3}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={
            locale === 'bn'
              ? 'প্রাসঙ্গিক তথ্য, প্রত্যক্ষদর্শীর বিবরণ বা মন্তব্য যোগ করুন...'
              : 'Add useful information, an eyewitness account, or a comment…'
          }
          className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none leading-relaxed"
          maxLength={1000}
          required
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            {locale === 'bn'
              ? 'ব্যক্তিগত তথ্য বা আক্রমণাত্মক মন্তব্য ফিল্টার করা হবে।'
              : 'Doxxing, abuse, and personal accusations are prohibited.'}
          </span>

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !commentText.trim()}
            className="bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold px-4 gap-1.5 rounded-lg"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : locale === 'bn' ? 'আলোচনায় যুক্ত হন' : 'Join the discussion'}</span>
          </Button>
        </div>

        {feedback && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {sortedComments.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 italic">
            {locale === 'bn'
              ? 'এখনো কোনো মন্তব্য নেই। প্রথম তথ্যভিত্তিক পর্যবেক্ষণ যোগ করুন।'
              : 'No comments yet. Be the first to share factual observations.'}
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2.5 transition-colors"
            >
              {/* Comment Header */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{comment.author_name}</span>
                  {comment.is_verified_citizen && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ✓ Verified Resident
                    </span>
                  )}
                  <span className="text-slate-400 text-[11px]">· {formatDate(comment.created_at, locale)}</span>
                </div>

                {/* Flag comment */}
                <button
                  onClick={() => handleFlag(comment.id)}
                  disabled={flaggedIds[comment.id]}
                  className={`text-[11px] inline-flex items-center gap-1 transition-colors ${
                    flaggedIds[comment.id] ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Report inappropriate comment"
                >
                  <Flag className="w-3 h-3" />
                  <span>{flaggedIds[comment.id] ? 'Reported' : 'Report'}</span>
                </button>
              </div>

              {/* Comment Body */}
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {comment.comment_text}
              </p>

              {/* Action row (Upvote & Reply) */}
              <div className="flex items-center gap-3 pt-1 text-xs">
                <button
                  onClick={() => handleUpvote(comment.id)}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    upvotedIds[comment.id]
                      ? 'bg-red-50 text-[#C62828] border border-red-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{comment.upvotes}</span>
                </button>

                <button
                  onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <CornerDownRight className="w-3 h-3" />
                  <span>{locale === 'bn' ? 'উত্তর দিন' : 'Reply'}</span>
                </button>
              </div>

              {/* Inline Reply Input */}
              {replyingToId === comment.id && (
                <div className="mt-3 pl-4 border-l-2 border-slate-200 space-y-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={locale === 'bn' ? 'উত্তর লিখুন...' : 'Write a moderated reply...'}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReplyingToId(null)}
                      className="text-xs h-7 px-3"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAddReply(comment.id)}
                      className="bg-slate-900 hover:bg-black text-white text-xs h-7 px-3"
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              )}

              {/* Threaded Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 space-y-2.5 pl-4 sm:pl-6 border-l-2 border-slate-100">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">{reply.author_name}</span>
                        <span className="text-slate-400 text-[10px]">{formatDate(reply.created_at, locale)}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{reply.comment_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
