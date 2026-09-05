"use client";

import { useState, useEffect } from "react";
import { Heart, ThumbsDown, MessageSquare, Repeat, Share2, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { toggleLike, toggleDislike, toggleBookmark, createNotification } from "@/lib/api";
import Link from "next/link";
import CommentBox from "./CommentBox";

const trackInteraction = (eventType: "CLICK" | "INPUT", element: string, metadata?: any) => {
  console.log(`[Telemetry] ${eventType} -> ${element}`, metadata);
};

export interface Post {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  tier: "freemium" | "gold" | "platinum";
  timestamp: string;
  content: string;
  likesCount: number;
  dislikesCount: number;
  repostsCount: number;
  commentsCount: number;
  tags?: string[];
}

interface PostCardProps {
  post: Post;
  dbPost?: any;
  currentUserId?: string;
  onUpdate?: () => void;
}

export default function PostCard({ post, dbPost, currentUserId, onUpdate }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const [disliked, setDisliked] = useState(false);
  const [dislikesCount, setDislikesCount] = useState(post.dislikesCount);

  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

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

  const sharePost = async () => {
    try {
      const shareData = {
        title: "Check out this post on Gestalt ARENA",
        text: post.content,
        url: `${window.location.origin}/post/${post.id}`,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setSuccessMsg("Link copied to clipboard!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (e) {
      setErrorMsg("Failed to share post");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleRepost = async () => {
    if (!currentUserId) {
      setErrorMsg("You must be logged in to reshare.");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    try {
      const reshareContent = `🔄 **Reshared from ${post.authorName}:**\n\n${post.content}`;

      const { error } = await supabase.from("posts").insert({
        author_id: currentUserId,
        content: reshareContent,
      });

      if (error) throw error;

      if (dbPost.author_id !== currentUserId) {
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
      if (onUpdate) onUpdate();
    } catch (e) {
      setErrorMsg("Failed to reshare post.");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  // RENAMED to avoid clashing with imported toggleLike
  const handleToggleLike = async () => {
    if (!currentUserId || !dbPost) return;

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

  // RENAMED to avoid clashing with imported toggleDislike
  const handleToggleDislike = async () => {
    if (!currentUserId || !dbPost) return;

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

  // RENAMED to avoid clashing with imported toggleBookmark
  const handleToggleBookmark = async () => {
    if (!currentUserId || !dbPost) return;
    if (bookmarked) {
      setBookmarked(false);
      await toggleBookmark(dbPost.id, currentUserId, true);
    } else {
      setBookmarked(true);
      await toggleBookmark(dbPost.id, currentUserId, false);
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] font-black text-[var(--primary)] text-sm uppercase shadow-inner">
            {post.authorName.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/profile/${dbPost?.author_id}`} className="font-bold text-sm text-[var(--secondary)] hover:text-[var(--accent)] transition">
                {post.authorName}
              </Link>
              <span className="neu-pressed-base border-transparent shadow-inner px-2 py-0.5 text-[10px] font-bold capitalize text-[var(--accent)]">
                {post.tier}
              </span>
            </div>
            <p className="text-xs text-[var(--secondary)]/60 font-bold">{post.authorRole} • {post.timestamp}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleToggleBookmark} className={`transition bg-transparent p-2 rounded-lg ${bookmarked ? "neu-pressed-base border-transparent shadow-inner text-[var(--accent)]" : "text-[var(--secondary)]/50 hover:text-[var(--accent)] neu-btn shadow-none"}`} aria-label="Save">
            <Bookmark size={14} className={bookmarked ? "fill-[var(--accent)]" : ""} />
          </button>
          <button onClick={sharePost} className="text-[var(--secondary)]/50 hover:text-[var(--accent)] bg-transparent p-2 rounded-lg neu-btn shadow-none transition" aria-label="Share">
            <Share2 size={14} />
          </button>
        </div>
      </div>

      <p className="text-sm text-[var(--secondary)]/90 leading-relaxed whitespace-pre-line font-medium">{post.content}</p>

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

        <button onClick={handleRepost} className="flex items-center gap-1.5 hover:text-[var(--accent)] transition ml-auto">
          <Repeat size={16} />
          <span>{post.repostsCount}</span>
        </button>
      </div>

      <AnimatePresence>
        {showComments && onUpdate && (
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
    </motion.article>
  );
}