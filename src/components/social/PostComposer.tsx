"use client";

import { useState } from "react";
import { useUserTier } from "@/components/context/UserTierContext";
import { Send, AlertTriangle, ShieldCheck, Image, Lock } from "lucide-react";

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
    <div className="neu-flat-base p-6 relative overflow-hidden">

      <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="neu-pressed-base border-transparent shadow-inner px-3 py-1 text-[10px] font-bold capitalize flex items-center gap-1.5 text-[var(--accent)]">
            <ShieldCheck size={14} /> {capabilities.name}
          </span>
          <span className="text-xs text-[var(--secondary)]/60 font-bold">
            Char limit: <strong className="text-[var(--secondary)]">{maxChars} chars</strong>
          </span>
        </div>

        <div className="text-xs text-[var(--secondary)]/60 font-bold">
          Daily Posts: <strong className="text-[var(--secondary)]">{postsToday} / {capabilities.maxPostsPer24h >= 9999 ? "∞" : capabilities.maxPostsPer24h}</strong>
        </div>
      </div>

      {!canPostMore && (
        <div className="mb-4 rounded-xl neu-pressed-base border-transparent shadow-inner p-4 flex items-center gap-3 text-rose-600 text-xs font-bold">
          <Lock size={18} className="shrink-0" />
          <span>You have reached your 24-hour post limit ({capabilities.maxPostsPer24h} posts). Upgrade to a higher tier to expand daily limits.</span>
        </div>
      )}

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
            className={`w-full rounded-2xl border-transparent bg-transparent p-4 text-sm text-[var(--secondary)] placeholder-[var(--secondary)]/40 focus:outline-none transition resize-none neu-pressed-base shadow-inner font-medium ${isOverCharLimit
                ? "border-rose-600 focus:ring-1 focus:ring-rose-600"
                : "focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              }`}
          />

          {isOverCharLimit && (
            <div className="mt-2 rounded-xl bg-transparent border border-rose-600/30 p-2.5 flex items-center justify-between text-xs text-rose-600 font-bold">
              <span className="flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Character limit exceeded by {Math.abs(charsRemaining)} characters!
              </span>
              <span className="font-mono">Locked</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">

          <div className="flex items-center gap-2 text-[var(--secondary)]/50 text-xs font-bold">
            <button
              type="button"
              className="p-2 bg-transparent border-transparent neu-btn shadow-none hover:text-[var(--accent)] transition rounded-lg"
              title="Attach Media Preview (UI)"
            >
              <Image size={16} />
            </button>
            <span className="hidden sm:inline">Supports Markdown & Tagging</span>
          </div>

          <div className="flex items-center gap-4">

            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <svg className="h-10 w-10 transform -rotate-90">
                  <circle cx="20" cy="20" r={radius} className="stroke-[var(--secondary)]/10" strokeWidth="3" fill="transparent" />
                  <circle
                    cx="20" cy="20" r={radius} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                    className={`transition-all duration-300 ${isOverCharLimit ? "stroke-rose-600" : percentage > 80 ? "stroke-amber-500" : "stroke-[var(--accent)]"}`}
                    fill="transparent"
                  />
                </svg>
                <span className={`absolute text-[10px] font-mono font-bold ${isOverCharLimit ? "text-rose-600" : percentage > 80 ? "text-amber-500" : "text-[var(--secondary)]"}`}>
                  {charsRemaining}
                </span>
              </div>
              <span className="text-[11px] text-[var(--secondary)]/50 font-mono font-bold hidden md:inline">
                {charCount}/{maxChars}
              </span>
            </div>

            <button
              type="submit"
              disabled={!content.trim() || isOverCharLimit || !canPostMore}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs neu-btn ${!content.trim() || isOverCharLimit || !canPostMore
                  ? "opacity-50 cursor-not-allowed"
                  : ""
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