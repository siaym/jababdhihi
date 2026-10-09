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
  ChevronDown,
  ChevronUp,
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
  const [sortBy, setSortBy] = useState<'newest' | 'helpful'>('newest');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

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
        ? 'মন্তব্যটি মডারেশন দলের পর্যালোচনার জন্য চিহ্নিত করা হয়েছে।'
        : 'Comment reported to human moderation team for safety review.'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await new Promise((res) => setTimeout(res, 350));

      const newComment: PublicComment = {
        id: `cmt-${Date.now()}`,
        report_id: reportId,
        author_name: authorName.trim() || (locale === 'bn' ? 'কমিউনিটি সদস্য' : 'Community member'),
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
          : 'Your comment has been shared.'
      );
      setTimeout(() => setFeedback(null), 4000);
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

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'helpful') return b.upvotes - a.upvotes;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (commentsDisabled) {
    return (
      <div className="p-5 rounded-2xl bg-white border border-[#E5DFD5] text-center space-y-2">
        <ShieldAlert className="w-5 h-5 text-slate-400 mx-auto" />
        <h4 className="text-xs font-bold text-[#17263C]">
          {locale === 'bn' ? 'আলোচনা সাময়িকভাবে স্থগিত' : 'Discussion Paused for this Report'}
        </h4>
        <p className="text-xs text-[#263238] max-w-sm mx-auto">
          {locale === 'bn'
            ? 'সাক্ষী ও তথ্যের সংবেদনশীলতা রক্ষায় এই প্রতিবেদনের প্রকাশ্য মন্তব্য সাময়িকভাবে স্থগিত রাখা হয়েছে।'
            : 'Public discussion has been paused on this report to protect ongoing fact-finding and privacy.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-sm overflow-hidden flex flex-col h-full">
      {/* 1. COMPANION PANEL HEADER */}
      <div className="p-4 sm:p-5 border-b border-[#EAE5DC] space-y-2 bg-[#FAFAF8]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#C62828]" />
            <h3 className="text-base sm:text-lg font-bold text-[#17263C]">
              {locale === 'bn' ? 'কমিউনিটি আলোচনা' : 'Community discussion'}
            </h3>
            <span className="text-xs font-bold text-slate-500 font-mono px-2 py-0.5 rounded-full bg-slate-100">
              {comments.length}
            </span>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                sortBy === 'newest'
                  ? 'bg-[#17263C] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {locale === 'bn' ? 'নতুন' : 'Newest'}
            </button>
            <button
              onClick={() => setSortBy('helpful')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                sortBy === 'helpful'
                  ? 'bg-[#17263C] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {locale === 'bn' ? 'জনপ্রিয়' : 'Top'}
            </button>
          </div>
        </div>

        <p className="text-xs text-[#263238] leading-relaxed">
          {locale === 'bn'
            ? 'নাগরিকদের শেয়ার করা প্রাসঙ্গিক পর্যবেক্ষণ, অতিরিক্ত তথ্য ও প্রতিক্রিয়া পড়ুন।'
            : 'Read relevant observations, additional information, and responses from the community.'}
        </p>
      </div>

      {/* 2. COMPACT COMMENT COMPOSER */}
      <div className="p-4 sm:p-5 border-b border-[#EAE5DC] bg-white">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#17263C]">
              {locale === 'bn' ? 'প্রাসঙ্গিক তথ্য বা মন্তব্য দিন:' : 'Share useful information:'}
            </span>
            <span className="text-[11px] text-slate-400">
              {locale === 'bn' ? 'গোপনীয়তা সুরক্ষিত' : 'Identity safe'}
            </span>
          </div>

          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder={locale === 'bn' ? 'আপনার নাম বা পরিচয় (ঐচ্ছিক)' : 'Name or handle (optional)'}
            className="w-full px-3 py-1.5 text-xs bg-[#FBF9F5] border border-[#E5DFD5] rounded-lg text-[#263238] focus:outline-none focus:ring-1 focus:ring-[#17263C]"
            maxLength={50}
          />

          <textarea
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              locale === 'bn'
                ? 'একটি মন্তব্য বা তথ্যভিত্তিক পর্যবেক্ষণ লিখুন...'
                : 'Add a comment or relevant observation…'
            }
            className="w-full p-2.5 text-xs bg-[#FBF9F5] border border-[#E5DFD5] rounded-lg text-[#263238] focus:outline-none focus:ring-1 focus:ring-[#17263C] resize-none leading-relaxed"
            maxLength={1000}
            required
          />

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[11px] text-slate-400">
              {locale === 'bn' ? 'আক্রমণাত্মক বক্তব্য নিষিদ্ধ।' : 'No harassment or doxxing.'}
            </span>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !commentText.trim()}
              className="bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold px-3.5 py-1.5 h-auto rounded-lg shadow-sm"
            >
              <Send className="w-3 h-3 mr-1" />
              <span>{isSubmitting ? '...' : locale === 'bn' ? 'যোগ করুন' : 'Join discussion'}</span>
            </Button>
          </div>

          {feedback && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}
        </form>
      </div>

      {/* 3. MOBILE TOGGLE / PREVIEW CONTROL */}
      <div className="lg:hidden p-3 bg-[#FBF9F5] border-b border-[#EAE5DC] flex items-center justify-between text-xs">
        <span className="font-semibold text-[#17263C]">
          {isMobileExpanded ? (locale === 'bn' ? 'সকল মন্তব্য প্রদর্শিত' : 'Showing all comments') : `${comments.length} comments`}
        </span>
        <button
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="font-bold text-[#C62828] hover:underline inline-flex items-center gap-1"
        >
          <span>{isMobileExpanded ? (locale === 'bn' ? 'সংক্ষেপ করুন' : 'Collapse discussion') : (locale === 'bn' ? 'সম্পূর্ণ আলোচনা দেখুন' : 'Open full discussion')}</span>
          {isMobileExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 4. SCROLLABLE COMMENT LIST */}
      <div
        className={`p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 ${
          isMobileExpanded ? 'max-h-[600px]' : 'max-h-[220px] lg:max-h-[500px]'
        }`}
      >
        {sortedComments.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 italic">
            {locale === 'bn'
              ? 'এখনো কোনো মন্তব্য নেই। প্রথম পর্যবেক্ষণটি শেয়ার করুন।'
              : 'No comments yet. Share the first observation.'}
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div
              key={comment.id}
              className="p-3.5 rounded-xl border border-[#EBE7E0] bg-[#FAFAF8] space-y-2 text-xs transition-colors"
            >
              {/* Comment Header */}
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-[#17263C]">{comment.author_name}</span>
                  {comment.is_verified_citizen && (
                    <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      ✓ Resident
                    </span>
                  )}
                  <span className="text-slate-400">· {formatDate(comment.created_at, locale)}</span>
                </div>

                {/* Flag comment */}
                <button
                  onClick={() => handleFlag(comment.id)}
                  disabled={flaggedIds[comment.id]}
                  className={`text-[10px] inline-flex items-center gap-0.5 transition-colors ${
                    flaggedIds[comment.id] ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Report comment"
                >
                  <Flag className="w-3 h-3" />
                  <span>{flaggedIds[comment.id] ? 'Reported' : 'Report'}</span>
                </button>
              </div>

              {/* Comment Body */}
              <p className="text-[#263238] leading-relaxed whitespace-pre-line text-xs font-normal">
                {comment.comment_text}
              </p>

              {/* Action row (Upvote & Reply) */}
              <div className="flex items-center gap-3 pt-0.5 text-[11px]">
                <button
                  onClick={() => handleUpvote(comment.id)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                    upvotedIds[comment.id]
                      ? 'bg-red-50 text-[#C62828] font-bold'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{comment.upvotes}</span>
                </button>

                <button
                  onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                  className="inline-flex items-center gap-0.5 text-slate-500 hover:text-[#17263C] font-medium transition-colors"
                >
                  <CornerDownRight className="w-3 h-3" />
                  <span>{locale === 'bn' ? 'উত্তর' : 'Reply'}</span>
                </button>
              </div>

              {/* Inline Reply Input */}
              {replyingToId === comment.id && (
                <div className="mt-2 pl-3 border-l-2 border-[#D8B56D] space-y-1.5">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={locale === 'bn' ? 'উত্তর লিখুন...' : 'Write reply...'}
                    className="w-full p-2 text-xs bg-white border border-[#E5DFD5] rounded-lg text-[#263238] focus:outline-none focus:ring-1 focus:ring-[#17263C] resize-none"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReplyingToId(null)}
                      className="text-[11px] h-6 px-2.5"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAddReply(comment.id)}
                      className="bg-[#17263C] hover:bg-black text-white text-[11px] h-6 px-2.5"
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              )}

              {/* Threaded Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2 space-y-2 pl-3 border-l-2 border-slate-200">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="p-2 rounded bg-white border border-slate-100 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#17263C]">{reply.author_name}</span>
                        <span className="text-slate-400">{formatDate(reply.created_at, locale)}</span>
                      </div>
                      <p className="text-[11px] text-[#263238] leading-relaxed">{reply.comment_text}</p>
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
