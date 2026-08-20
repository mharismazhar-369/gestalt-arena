"use client";

import { useState } from "react";
import { Heart, MessageSquare, Repeat, Share2, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export interface Post {
  id: string;
  authorName: string;
  authorRole: "Investor" | "Startup Founder" | "VC Partner" | "Researcher";
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
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const toggleLike = () => {
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
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
      className="trionn-glass-card rounded-3xl border border-white/10 p-6 shadow-xl space-y-4 hover:border-white/20 transition"
    >
      {/* Author Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 font-bold text-black text-sm uppercase shadow-md">
            {post.authorName.slice(0, 2)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white">{post.authorName}</h4>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${tierBadges[post.tier]}`}>
                {post.tier}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {post.authorRole} • {post.timestamp}
            </p>
          </div>
        </div>

        <button className="text-slate-500 hover:text-cyan-400 transition" aria-label="Share">
          <Share2 size={16} />
        </button>
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

        <button className="flex items-center gap-1.5 hover:text-cyan-400 transition">
          <MessageSquare size={16} />
          <span>{post.commentsCount}</span>
        </button>

        <button className="flex items-center gap-1.5 hover:text-violet-400 transition">
          <Repeat size={16} />
          <span>{post.repostsCount}</span>
        </button>
      </div>
    </motion.article>
  );
}
