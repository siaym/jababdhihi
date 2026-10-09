'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  CornerDownRight,
  ShieldAlert,
  Send,
  CheckCircle2,
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
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);

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
          ? 'আপনার মন্তব্যটি সফলভাবে যুক্ত হয়েছে।'
          : 'Your observation has been posted.'
      );
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = (parentId: string) => {
    if (!replyText.trim()) return;

    const newReply = {
      id: `reply-${Date.now()}`,
      report_id: reportId,
      author_name: locale === 'bn' ? 'নাগরিক উত্তর' : 'Citizen response',
      comment_text: replyText.trim(),
      status: 'approved' as const,
      upvotes: 1,
      created_at: new Date().toISOString(),
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
        <p className="text-xs text-[#334155] max-w-sm mx-auto">
          {locale === 'bn'
            ? 'সাক্ষী ও তথ্যের সংবেদনশীলতা রক্ষায় এই প্রতিবেদনের প্রকাশ্য মন্তব্য সাময়িকভাবে স্থগিত রাখা হয়েছে।'
            : 'Public discussion has been paused on this report to protect ongoing fact-finding and privacy.'}
        </p>
      </div>
    );
  }

  // Mobile preview: show first 2 comments if not expanded
  const visibleComments = isMobileExpanded ? sortedComments : sortedComments;

  return (
    <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-xs overflow-hidden flex flex-col h-full">
      {/* 1. COMPANION PANEL HEADER */}
      <div className="p-4 sm:p-5 border-b border-[#EAE5DC] space-y-1.5 bg-[#FAF8F5]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#C62828]" />
            <h3 className="text-base sm:text-lg font-bold text-[#17263C]">
              {locale === 'bn' ? 'কমিউনিটি আলোচনা' : 'Community discussion'}
            </h3>
            <span className="text-xs font-bold text-slate-700 font-mono px-2 py-0.5 rounded-full bg-slate-200/70">
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
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {locale === 'bn' ? 'নতুন' : 'Newest'}
            </button>
            <button
              onClick={() => setSortBy('helpful')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                sortBy === 'helpful'
                  ? 'bg-[#17263C] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {locale === 'bn' ? 'জনপ্রিয়' : 'Top'}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {locale === 'bn'
            ? 'নাগরিকদের শেয়ার করা প্রাসঙ্গিক পর্যবেক্ষণ, প্রত্যক্ষ সাক্ষ্য ও প্রতিক্রিয়া।'
            : 'Relevant community observations, eyewitness accounts, and updates.'}
        </p>
      </div>

      {/* 2. COMPACT, UNDERSTATED COMPOSER */}
      <div className="p-3.5 sm:p-4 border-b border-[#EAE5DC] bg-white">
        <form onSubmit={handleSubmit} className="space-y-2">
          {isComposerExpanded && (
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={locale === 'bn' ? 'আপনার নাম বা পরিচয় (ঐচ্ছিক)' : 'Your name (optional)'}
              className="w-full px-3 py-1.5 text-xs bg-[#FBF9F5] border border-[#E5DFD5] rounded-lg text-[#263238] focus:outline-none focus:ring-1 focus:ring-[#17263C]"
              maxLength={50}
            />
          )}

          <div className="relative">
            <textarea
              rows={isComposerExpanded ? 2 : 1}
              value={commentText}
              onFocus={() => setIsComposerExpanded(true)}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                locale === 'bn'
                  ? 'প্রাসঙ্গিক তথ্য বা প্রত্যক্ষ পর্যবেক্ষণ লিখুন...'
                  : 'Add an eyewitness detail or relevant observation…'
              }
              className="w-full p-2.5 text-xs bg-[#FBF9F5] border border-[#E5DFD5] rounded-lg text-[#263238] focus:outline-none focus:ring-1 focus:ring-[#17263C] resize-none leading-relaxed transition-all"
              maxLength={1000}
              required
            />
          </div>

          {isComposerExpanded && (
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[11px] text-slate-500">
                {locale === 'bn' ? 'আক্রমণাত্মক বক্তব্য নিষিদ্ধ' : 'Moderated for civility'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsComposerExpanded(false);
                    setCommentText('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !commentText.trim()}
                  className="bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold px-3 py-1.5 h-auto rounded-lg shadow-xs"
                >
                  <Send className="w-3 h-3 mr-1" />
                  <span>{isSubmitting ? '...' : locale === 'bn' ? 'যোগ করুন' : 'Post'}</span>
                </Button>
              </div>
            </div>
          )}

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
          {isMobileExpanded
            ? (locale === 'bn' ? 'সকল মন্তব্য প্রদর্শিত' : 'Showing all comments')
            : (locale === 'bn' ? `আলোচনার সারসংক্ষেপ (${comments.length}টি মন্তব্য)` : `Discussion preview (${comments.length} comments)`)}
        </span>
        <button
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="font-bold text-[#C62828] hover:underline inline-flex items-center gap-1"
        >
          <span>
            {isMobileExpanded
              ? (locale === 'bn' ? 'সংক্ষেপ করুন' : 'Collapse discussion')
              : (locale === 'bn' ? 'সম্পূর্ণ আলোচনা দেখুন' : 'Open full discussion')}
          </span>
          {isMobileExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 4. SCROLLABLE COMMENT LIST (Darker text, compact rows, clear author labels) */}
      <div
        className={`p-3.5 sm:p-4 space-y-3 overflow-y-auto flex-1 ${
          isMobileExpanded ? 'max-h-[600px]' : 'max-h-[260px] lg:max-h-[480px]'
        }`}
      >
        {sortedComments.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 italic">
            {locale === 'bn'
              ? 'এখনো কোনো মন্তব্য নেই। প্রথম পর্যবেক্ষণটি শেয়ার করুন।'
              : 'No comments yet. Share the first observation.'}
          </div>
        ) : (
          (isMobileExpanded ? sortedComments : sortedComments.slice(0, 2)).map((comment) => (
            <div
              key={comment.id}
              className="p-3 rounded-xl border border-[#E8E4DC] bg-[#FAF8F5] space-y-1.5 text-xs transition-colors"
            >
              {/* Comment Header: Author & Timestamp */}
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-[#17263C]">{comment.author_name}</span>
                  {comment.is_verified_citizen && (
                    <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      ✓ Resident
                    </span>
                  )}
                  <span className="text-slate-600 font-medium">· {formatDate(comment.created_at, locale)}</span>
                </div>

                {/* Flag comment */}
                <button
                  onClick={() => handleFlag(comment.id)}
                  disabled={flaggedIds[comment.id]}
                  className={`text-[10px] inline-flex items-center gap-0.5 transition-colors ${
                    flaggedIds[comment.id] ? 'text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Report comment"
                >
                  <Flag className="w-3 h-3" />
                  <span>{flaggedIds[comment.id] ? 'Reported' : 'Report'}</span>
                </button>
              </div>

              {/* Comment Body: Dark Charcoal `#1E293B` for easy reading */}
              <p className="text-[#1E293B] leading-relaxed whitespace-pre-line text-xs font-normal">
                {comment.comment_text}
              </p>

              {/* Action row (Upvote & Understated Reply) */}
              <div className="flex items-center gap-3 pt-0.5 text-[11px]">
                <button
                  onClick={() => handleUpvote(comment.id)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                    upvotedIds[comment.id]
                      ? 'bg-red-50 text-[#C62828] font-bold'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{comment.upvotes}</span>
                </button>

                <button
                  onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                  className="inline-flex items-center gap-0.5 text-slate-600 hover:text-[#C62828] font-medium transition-colors"
                >
                  <CornerDownRight className="w-3 h-3" />
                  <span>{locale === 'bn' ? 'উত্তর দিন' : 'Reply'}</span>
                </button>
              </div>

              {/* Inline Reply Input */}
              {replyingToId === comment.id && (
                <div className="mt-2 pl-3 border-l-2 border-[#17263C] space-y-1.5">
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
                      className="text-[11px] h-6 px-2.5 text-slate-600"
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
                <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-slate-300">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="p-2 rounded bg-white border border-slate-200 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#17263C]">{reply.author_name}</span>
                        <span className="text-slate-600 font-medium">{formatDate(reply.created_at, locale)}</span>
                      </div>
                      <p className="text-[11px] text-[#1E293B] leading-relaxed">{reply.comment_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {/* On mobile: if not expanded and there are more than 2 comments, show quick expand pill */}
        {!isMobileExpanded && sortedComments.length > 2 && (
          <button
            onClick={() => setIsMobileExpanded(true)}
            className="lg:hidden w-full py-2 bg-white hover:bg-slate-50 border border-[#E5DFD5] rounded-xl text-xs font-semibold text-[#C62828] text-center"
          >
            {locale === 'bn'
              ? `আরও ${sortedComments.length - 2}টি মন্তব্য দেখুন`
              : `View ${sortedComments.length - 2} more comments`}
          </button>
        )}
      </div>
    </div>
  );
}
