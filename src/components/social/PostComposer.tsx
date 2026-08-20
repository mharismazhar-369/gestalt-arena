"use client";

import { useState } from "react";
import { useUserTier } from "@/components/context/UserTierContext";
import { Send, AlertTriangle, ShieldCheck, Sparkles, Image, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PostComposerProps {
  onPostCreated?: (content: string) => void;
}

export default function PostComposer({ onPostCreated }: PostComposerProps) {
  const { tier, capabilities, postsToday, incrementPostCount, canPostMore } = useUserTier();
  const [content, setContent] = useState("");

  const charCount = content.length;
  const maxChars = capabilities.maxCharsPerPost;
  const charsRemaining = maxChars - charCount;
  const isOverCharLimit = charCount > maxChars;
  const percentage = Math.min(100, (charCount / maxChars) * 100);

  // SVG Circular progress radius
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isOverCharLimit || !canPostMore) return;

    const success = incrementPostCount();
    if (success) {
      if (onPostCreated) onPostCreated(content);
      setContent("");
    }
  };

  return (
    <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 shadow-2xl relative overflow-hidden">
      
      {/* Top Header - Tier Status & Daily Post Count */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-bold capitalize flex items-center gap-1.5 ${capabilities.borderColor} ${capabilities.bgColor} ${capabilities.textColor}`}>
            <ShieldCheck size={14} /> {capabilities.name}
          </span>
          <span className="text-xs text-slate-400">
            Char limit: <strong className="text-white">{maxChars} chars</strong>
          </span>
        </div>

        <div className="text-xs text-slate-400">
          Daily Posts: <strong className="text-white">{postsToday} / {capabilities.maxPostsPer24h >= 9999 ? "∞" : capabilities.maxPostsPer24h}</strong>
        </div>
      </div>

      {/* Lockout Warning Banner if daily post cap reached */}
      {!canPostMore && (
        <div className="mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-center gap-3 text-rose-300 text-xs font-semibold">
          <Lock size={18} className="shrink-0 text-rose-400" />
          <span>You have reached your 24-hour post limit ({capabilities.maxPostsPer24h} posts). Upgrade to a higher tier to expand daily limits.</span>
        </div>
      )}

      {/* Post Text Area Form */}
      <form onSubmit={handlePost} className="space-y-4">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!canPostMore}
            placeholder={
              canPostMore
                ? `Share startup updates, investment thesis, or market insights (${capabilities.name}: max ${maxChars} chars)...`
                : "Post limit reached for current tier. Upgrade to post more."
            }
            rows={4}
            className={`w-full rounded-2xl border bg-slate-950/70 p-4 text-sm text-white placeholder-slate-500 focus:outline-none transition backdrop-blur-xl resize-none ${
              isOverCharLimit
                ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                : "border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            }`}
          />

          {/* Character Lockout Warning Overlay if exceeding max character limit */}
          {isOverCharLimit && (
            <div className="mt-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-2.5 flex items-center justify-between text-xs text-rose-300">
              <span className="flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-rose-400" />
                Character limit exceeded by {Math.abs(charsRemaining)} characters!
              </span>
              <span className="font-mono font-bold text-rose-400">Locked</span>
            </div>
          )}
        </div>

        {/* Footer Actions & Dynamic Character Meter */}
        <div className="flex items-center justify-between pt-2">
          
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <button
              type="button"
              className="p-2 rounded-xl border border-white/5 bg-white/5 hover:border-cyan-400/30 hover:text-cyan-400 transition"
              title="Attach Media Preview (UI)"
            >
              <Image size={16} />
            </button>
            <span className="hidden sm:inline">Supports Markdown & Tagging</span>
          </div>

          <div className="flex items-center gap-4">
            
            {/* SVG Circular Progress Counter Ring */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <svg className="h-10 w-10 transform -rotate-90">
                  {/* Track Circle */}
                  <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    className="stroke-slate-800"
                    strokeWidth="3"
                    fill="transparent"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-300 ${
                      isOverCharLimit
                        ? "stroke-rose-500"
                        : percentage > 80
                        ? "stroke-amber-400"
                        : "stroke-cyan-400"
                    }`}
                    fill="transparent"
                  />
                </svg>
                <span className={`absolute text-[10px] font-mono font-bold ${
                  isOverCharLimit ? "text-rose-400" : percentage > 80 ? "text-amber-400" : "text-slate-300"
                }`}>
                  {charsRemaining}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                {charCount}/{maxChars}
              </span>
            </div>

            {/* Submit Post Button */}
            <button
              type="submit"
              disabled={!content.trim() || isOverCharLimit || !canPostMore}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-lg ${
                !content.trim() || isOverCharLimit || !canPostMore
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                  : "bg-gradient-to-r from-cyan-400 to-violet-500 text-black hover:scale-105 shadow-cyan-500/20"
              }`}
            >
              <Send size={14} /> Post Feed
            </button>

          </div>

        </div>

      </form>
    </div>
  );
}
