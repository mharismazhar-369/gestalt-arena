// Location: SRC/components/social/PostCard.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ThumbsDown, MessageSquare, Repeat, Share2, Bookmark, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { toggleLike, toggleDislike, toggleBookmark, createNotification } from "@/lib/api";
import CommentBox from "./CommentBox";
import React from "react";

export interface Post {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  tier: "Freemium" | "Gold" | "Platinum";
  timestamp: string;
  content: React.ReactNode | string;
  mediaUrl?: string;
  likesCount: number;
  dislikesCount: number;
  repostsCount: number;
  commentsCount: number;
  tags?: string[];
}

interface PostCardProps {
  post: Post;
  dbPost?: any;
  currentUserId?: string | null;
  onUpdate?: () => void;
}

export default function PostCard({ post, dbPost, currentUserId, onUpdate }: PostCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const [disliked, setDisliked] = useState(false);
  const [dislikesCount, setDislikesCount] = useState(post.dislikesCount);

  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [repostComment, setRepostComment] = useState("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [isSubmittingRepost, setIsSubmittingRepost] = useState(false);

  const authorData = dbPost?.author ? (Array.isArray(dbPost.author) ? dbPost.author[0] : dbPost.author) : null;
  const authorHandle = authorData?.username ? `@${authorData.username}` : `@${post.authorName.toLowerCase().replace(/\s+/g, '_')}`;
  const authorProfileUrl = `/profile/${dbPost?.author_id || authorData?.id || '#'}`;

  useEffect(() => {
    if (dbPost && currentUserId) {
      const hasLiked = dbPost.likes?.some((like: any) => like.user_id === currentUserId);
      const hasDisliked = dbPost.dislikes?.some((dislike: any) => dislike.user_id === currentUserId);
      const hasBookmarked = dbPost.bookmarks?.some((bm: any) => bm.user_id === currentUserId);

      setLiked(!!hasLiked);
      setDisliked(!!hasDisliked);
      setBookmarked(!!hasBookmarked);
    }
  }, [dbPost, currentUserId]);

  const sharePost = () => {
    setShowShareModal(true);
  };

  const handleRepostSubmit = async (withComment: boolean) => {
    if (!currentUserId) {
      router.push("/login?next=/feed");
      return;
    }

    setIsSubmittingRepost(true);
    try {
      const rawContent = dbPost?.content || "reshared a post";
      const userNote = withComment && repostComment.trim() ? `${repostComment.trim()}\n\n` : "";
      const reshareContent = `${userNote}🔄 **Reshared from ${post.authorName}:**\n\n${rawContent}`;

      const { error } = await supabase.from("posts").insert({
        author_id: currentUserId,
        content: reshareContent,
        media_url: post.mediaUrl || null
      });

      if (error) throw error;

      if (dbPost?.author_id && dbPost.author_id !== currentUserId) {
        await supabase.from("notifications").insert({
          user_id: dbPost.author_id,
          actor_id: currentUserId,
          type: "reshare",
          message: "reshared your post.",
          reference_id: dbPost.id
        });
      }

      setSuccessMsg("Post reshared to your feed!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setShowRepostModal(false);
      setRepostComment("");
      if (onUpdate) onUpdate();
    } catch (e) {
      setErrorMsg("Failed to reshare post.");
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setIsSubmittingRepost(false);
    }
  };

  const handleToggleLike = async () => {
    if (!currentUserId) {
      router.push("/login?next=/feed");
      return;
    }
    if (!dbPost) return;

    if (liked) {
      setLiked(false);
      setLikesCount((prev) => prev - 1);
      await toggleLike(dbPost.id, currentUserId, true);
    } else {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      await toggleLike(dbPost.id, currentUserId, false);

      if (disliked) {
        setDisliked(false);
        setDislikesCount((prev) => prev - 1);
        await toggleDislike(dbPost.id, currentUserId, true);
      }

      if (dbPost.author_id !== currentUserId) {
        await createNotification({
          user_id: dbPost.author_id,
          actor_id: currentUserId,
          type: "like",
          message: "liked your post.",
          reference_id: dbPost.id
        });
      }
    }
    if (onUpdate) onUpdate();
  };

  const handleToggleDislike = async () => {
    if (!currentUserId) {
      router.push("/login?next=/feed");
      return;
    }
    if (!dbPost) return;

    if (disliked) {
      setDisliked(false);
      setDislikesCount((prev) => prev - 1);
      await supabase.from("dislikes").delete().match({ post_id: dbPost.id, user_id: currentUserId });
    } else {
      setDisliked(true);
      setDislikesCount((prev) => prev + 1);
      await toggleDislike(dbPost.id, currentUserId, false);

      if (liked) {
        setLiked(false);
        setLikesCount((prev) => prev - 1);
        await supabase.from("likes").delete().match({ post_id: dbPost.id, user_id: currentUserId });
      }
    }
    if (onUpdate) onUpdate();
  };

  const handleToggleBookmark = async () => {
    if (!currentUserId) {
      router.push("/login?next=/feed");
      return;
    }
    if (!dbPost) return;
    if (bookmarked) {
      setBookmarked(false);
      await toggleBookmark(dbPost.id, currentUserId, true);
    } else {
      setBookmarked(true);
      await toggleBookmark(dbPost.id, currentUserId, false);
    }
  };

  const handleDeletePost = async () => {
    if (!currentUserId || !dbPost) return;

    if (dbPost.author_id !== currentUserId) {
      setErrorMsg("You can only delete your own posts.");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");

      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", dbPost.id)
        .eq("author_id", currentUserId);

      if (error) throw error;

      setSuccessMsg("Post deleted successfully.");
      if (onUpdate) onUpdate();
      router.push("/feed");
      router.refresh();
    } catch (error) {
      console.error("Delete post error:", error);
      setErrorMsg("Failed to delete post. Please try again.");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="neu-flat-base p-6 space-y-4 hover:border-[var(--accent)]/30 transition relative"
    >
      {errorMsg && <p className="text-xs font-bold text-rose-600">{errorMsg}</p>}
      {successMsg && <p className="text-xs font-bold text-emerald-600">{successMsg}</p>}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={authorProfileUrl} className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] font-black text-[var(--primary)] text-sm uppercase shadow-inner hover:opacity-90 transition">
            {post.authorName.slice(0, 2)}
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={authorProfileUrl} className="font-bold text-[var(--secondary)] text-sm hover:text-[var(--accent)] transition">
                {post.authorName}
              </Link>
              <Link href={authorProfileUrl} className="font-mono text-xs font-bold text-[var(--accent)] hover:underline">
                {authorHandle}
              </Link>
            </div>
            <span className="text-[10px] font-bold text-[var(--secondary)]/60 capitalize block">
              {post.authorRole} • <span className="font-mono">{post.timestamp}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUserId === dbPost?.author_id && (
            <button
              type="button"
              onClick={handleDeletePost}
              className="text-[var(--secondary)]/50 hover:text-rose-600 bg-transparent p-2 rounded-lg neu-btn shadow-none transition"
              aria-label="Delete post"
              title="Delete post"
            >
              <Trash2 size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`transition bg-transparent p-2 rounded-lg ${bookmarked
              ? "neu-pressed-base border-transparent shadow-inner text-[var(--accent)]"
              : "text-[var(--secondary)]/50 hover:text-[var(--accent)] neu-btn shadow-none"
              }`}
            aria-label="Save"
            title="Save post"
          >
            <Bookmark
              size={14}
              className={bookmarked ? "fill-[var(--accent)]" : ""}
            />
          </button>

          <button
            type="button"
            onClick={sharePost}
            className="text-[var(--secondary)]/50 hover:text-[var(--accent)] bg-transparent p-2 rounded-lg neu-btn shadow-none transition"
            aria-label="Share"
            title="Share post"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>

      <p className="text-sm text-[var(--secondary)]/90 leading-relaxed whitespace-pre-line font-medium">{post.content}</p>

      {post.mediaUrl && (
        <div className="mt-3 rounded-2xl overflow-hidden border border-[var(--secondary)]/10 shadow-sm">
          <img
            src={post.mediaUrl}
            alt="Attached to post"
            className="w-full h-auto max-h-[450px] object-cover"
            loading="lazy"
          />
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.tags.map((tag) => (
            <span key={tag} className="neu-pressed-base border-transparent shadow-inner px-2.5 py-0.5 text-[10px] font-bold text-[var(--accent)]">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-[var(--secondary)]/10 pt-3 flex items-center gap-6 text-xs text-[var(--secondary)]/50 font-bold">
        <button onClick={handleToggleLike} className={`flex items-center gap-1.5 transition ${liked ? "text-emerald-600" : "hover:text-emerald-600"}`}>
          <Heart size={16} className={liked ? "fill-emerald-600" : ""} />
          <span>{likesCount}</span>
        </button>

        <button onClick={handleToggleDislike} className={`flex items-center gap-1.5 transition ${disliked ? "text-rose-600" : "hover:text-rose-600"}`}>
          <ThumbsDown size={16} className={disliked ? "fill-rose-600" : ""} />
          <span>{dislikesCount}</span>
        </button>

        <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-1.5 transition ${showComments ? "text-[var(--accent)]" : "hover:text-[var(--accent)]"}`}>
          <MessageSquare size={16} className={showComments ? "fill-[var(--accent)]" : ""} />
          <span>{post.commentsCount}</span>
        </button>

        <button onClick={() => setShowRepostModal(true)} className="flex items-center gap-1.5 hover:text-[var(--accent)] transition ml-auto">
          <Repeat size={16} />
          <span>{post.repostsCount}</span>
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <CommentBox
              postId={post.id}
              currentUserId={currentUserId}
              postOwnerId={dbPost?.author_id}
              onCommentAdded={onUpdate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* IN-APP SHARE MODAL */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--primary)] border border-[var(--secondary)]/10 p-6 rounded-3xl max-w-md w-full space-y-6 relative neu-flat-base text-[var(--secondary)] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4">
                <h3 className="text-base font-black text-[var(--secondary)] flex items-center gap-2">
                  <Share2 size={18} className="text-[var(--accent)]" /> Share Post to Network
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1.5 rounded-xl neu-btn text-[var(--secondary)]/60 hover:text-[var(--accent)] transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(typeof post.content === 'string' ? post.content : "Check out this discussion on Gestalt Arena")}&url=${encodeURIComponent(`${window.location.origin}/feed/${post.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neu-btn p-3 flex items-center gap-3 text-xs font-bold text-[var(--secondary)] hover:text-[var(--accent)] transition-all rounded-xl"
                >
                  <div className="w-8 h-8 rounded-lg neu-pressed-base flex items-center justify-center font-black">𝕏</div>
                  <span>Twitter / X</span>
                </a>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/feed/${post.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neu-btn p-3 flex items-center gap-3 text-xs font-bold text-[var(--secondary)] hover:text-[var(--accent)] transition-all rounded-xl"
                >
                  <div className="w-8 h-8 rounded-lg neu-pressed-base flex items-center justify-center text-blue-600 font-bold">in</div>
                  <span>LinkedIn</span>
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/feed/${post.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neu-btn p-3 flex items-center gap-3 text-xs font-bold text-[var(--secondary)] hover:text-[var(--accent)] transition-all rounded-xl"
                >
                  <div className="w-8 h-8 rounded-lg neu-pressed-base flex items-center justify-center text-blue-500 font-bold">f</div>
                  <span>Facebook</span>
                </a>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this discussion on Gestalt Arena: ${window.location.origin}/feed/${post.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neu-btn p-3 flex items-center gap-3 text-xs font-bold text-[var(--secondary)] hover:text-[var(--accent)] transition-all rounded-xl"
                >
                  <div className="w-8 h-8 rounded-lg neu-pressed-base flex items-center justify-center text-emerald-500 font-bold">💬</div>
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--secondary)]/60">Direct Post Link</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/feed/${post.id}`}
                    className="w-full text-xs font-mono bg-transparent neu-pressed-base p-3 rounded-xl text-[var(--secondary)]/80 focus:outline-none"
                  />
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(`${window.location.origin}/feed/${post.id}`);
                      setSuccessMsg("Link copied to clipboard!");
                      setTimeout(() => setSuccessMsg(""), 3000);
                      setShowShareModal(false);
                    }}
                    className="neu-btn px-4 py-3 text-xs font-bold text-[var(--accent)] shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPOST MODAL (With or Without Commentary) */}
      <AnimatePresence>
        {showRepostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--primary)] border border-[var(--secondary)]/10 p-6 rounded-3xl max-w-lg w-full space-y-6 relative neu-flat-base text-[var(--secondary)] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4">
                <h3 className="text-base font-black text-[var(--secondary)] flex items-center gap-2">
                  <Repeat size={18} className="text-[var(--accent)]" /> Reshare Post
                </h3>
                <button
                  onClick={() => setShowRepostModal(false)}
                  className="p-1.5 rounded-xl neu-btn text-[var(--secondary)]/60 hover:text-[var(--accent)] transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <textarea
                  rows={3}
                  value={repostComment}
                  onChange={(e) => setRepostComment(e.target.value)}
                  placeholder="Add your thoughts or commentary (optional)..."
                  className="w-full rounded-xl border-transparent bg-transparent p-3 text-sm text-[var(--secondary)] placeholder-[var(--secondary)]/50 focus:outline-none transition resize-none neu-pressed-base shadow-inner font-medium"
                  disabled={isSubmittingRepost}
                />

                <div className="neu-pressed-base p-4 rounded-2xl opacity-75 space-y-2 text-xs">
                  <span className="font-bold text-[var(--accent)]">Original Post by {post.authorName}:</span>
                  <p className="line-clamp-2 text-[var(--secondary)]/80">{typeof post.content === 'string' ? post.content : "Media / Discussion post"}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--secondary)]/10">
                <button
                  onClick={() => handleRepostSubmit(false)}
                  disabled={isSubmittingRepost}
                  className="neu-btn px-5 py-2.5 text-xs font-bold text-[var(--secondary)]"
                >
                  Repost Instantly
                </button>
                <button
                  onClick={() => handleRepostSubmit(true)}
                  disabled={isSubmittingRepost}
                  className="neu-btn px-6 py-2.5 text-xs font-extrabold text-[var(--accent)]"
                >
                  {isSubmittingRepost ? "Publishing..." : "Repost with Comment"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}