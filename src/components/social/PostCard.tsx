"use client";

import { useState, useEffect } from "react";
import { Heart, MessageSquare, Repeat, Share2, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import CommentBox from "./CommentBox";

export interface Post {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  tier: "freemium" | "gold" | "platinum";
  timestamp: string;
  content: string;
  likesCount: number;
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
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  useEffect(() => {
    if (dbPost && currentUserId) {
      const hasLiked = dbPost.likes?.some((like: any) => like.user_id === currentUserId);
      setLiked(!!hasLiked);
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

  // NEW: Handle Resharing (Reposting)
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

      setSuccessMsg("Post reshared to your feed!");
      setTimeout(() => setSuccessMsg(""), 3000);

      if (onUpdate) onUpdate(); // Refresh the feed to show the new post
    } catch (e) {
      setErrorMsg("Failed to reshare post.");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const toggleLike = async () => {
    if (!currentUserId || !dbPost) return;

    if (liked) {
      setLiked(false);
      setLikesCount((prev) => prev - 1);
      await supabase.from("likes").delete().match({ post_id: dbPost.id, user_id: currentUserId });
    } else {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      await supabase.from("likes").insert({ post_id: dbPost.id, user_id: currentUserId });

      if (dbPost.author_id !== currentUserId) {
        await supabase.from("notifications").insert({
          user_id: dbPost.author_id,
          actor_id: currentUserId,
          type: "like",
          post_id: dbPost.id
        });
      }
    }

    if (onUpdate) onUpdate();
  };

  const toggleBookmark = async () => {
    if (!currentUserId || !dbPost) return;
    if (bookmarked) {
      setBookmarked(false);
      await supabase.from("bookmarks").delete().match({ post_id: dbPost.id, user_id: currentUserId });
    } else {
      setBookmarked(true);
      await supabase.from("bookmarks").insert({ post_id: dbPost.id, user_id: currentUserId });
    }
  };

  const tierBadges = {
    freemium: "text-slate-400 border-slate-500/30 bg-slate-500/10",
    gold: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    platinum: "text-violet-400 border-violet-500/50 bg-violet-500/10",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="trionn-glass-card rounded-3xl border border-white/10 p-6 shadow-xl space-y-4 hover:border-white/20 transition relative"
    >
      {/* Toast Messages */}
      {errorMsg && <p className="text-xs font-semibold text-rose-500">{errorMsg}</p>}
      {successMsg && <p className="text-xs font-semibold text-cyan-400">{successMsg}</p>}

      {/* Author Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 font-bold text-black text-sm uppercase shadow-md">
            {post.authorName.slice(0, 2)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Link href={`/profile/${dbPost?.author_id}`} className="font-bold text-sm text-white hover:underline">{post.authorName}</Link>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${tierBadges[post.tier]}`}>
                {post.tier}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {post.authorRole} • {post.timestamp}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleBookmark} className={`transition ${bookmarked ? "text-cyan-400" : "text-slate-500 hover:text-cyan-400"}`} aria-label="Save">
            <Bookmark size={16} className={bookmarked ? "fill-cyan-400" : ""} />
          </button>
          <button onClick={sharePost} className="text-slate-500 hover:text-cyan-400 transition" aria-label="Share">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Post Text Content */}
      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
        {post.content}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-cyan-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Social Interactions Bar */}
      <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 transition ${liked ? "text-rose-400 font-bold" : "hover:text-rose-400"}`}
        >
          <Heart size={16} className={liked ? "fill-rose-400" : ""} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 transition ${showComments ? "text-cyan-400" : "hover:text-cyan-400"}`}
        >
          <MessageSquare size={16} className={showComments ? "fill-cyan-400/20" : ""} />
          <span>{post.commentsCount}</span>
        </button>

        {/* FIX: Added onClick handleRepost to the Repeat button */}
        <button
          onClick={handleRepost}
          className="flex items-center gap-1.5 hover:text-violet-400 transition"
        >
          <Repeat size={16} />
          <span>{post.repostsCount}</span>
        </button>
      </div>

      {/* Comment Box Dropdown (Animated) */}
      <AnimatePresence>
        {showComments && onUpdate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <CommentBox postId={post.id} currentUserId={currentUserId} onCommentAdded={onUpdate} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}