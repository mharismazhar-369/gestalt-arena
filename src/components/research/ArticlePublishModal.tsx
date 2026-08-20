"use client";

import { useState } from "react";
import { useUserTier } from "@/components/context/UserTierContext";
import { X, BookOpen, AlertTriangle, ShieldCheck, Sparkles, Image, Lock, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ArticlePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArticlePublished?: (article: { title: string; category: string; summary: string; content: string }) => void;
}

export default function ArticlePublishModal({ isOpen, onClose, onArticlePublished }: ArticlePublishModalProps) {
  const { capabilities, articlesToday, incrementArticleCount, canPublishArticleMore } = useUserTier();
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Market Analysis");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  const categories = ["Market Analysis", "Deep Tech", "VC Trends", "Web3 Infrastructure", "AI & Automation", "Founder Guides"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !canPublishArticleMore) return;

    const success = incrementArticleCount();
    if (success) {
      if (onArticlePublished) {
        onArticlePublished({ title, category, summary, content });
      }
      setTitle("");
      setSummary("");
      setContent("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-950 p-6 md:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-400/30">
                <BookOpen size={20} />
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">Publish Research Paper</h3>
                <p className="text-xs text-slate-400">Share in-depth market analysis and research with investors</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full border border-white/10 p-2 text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tier Capability Check Banner */}
          {!capabilities.canPublishArticles ? (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-5 space-y-3 text-rose-200">
              <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
                <Lock size={18} /> Article Publishing Locked on Freemium Tier
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Publishing research and market insights requires <strong>Gold Tier</strong> (up to 5 articles/day) or <strong>Platinum Tier</strong> (unlimited articles).
              </p>
              <button
                onClick={onClose}
                className="mt-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-bold text-black shadow-lg"
              >
                Upgrade to Gold Tier
              </button>
            </div>
          ) : !canPublishArticleMore ? (
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 space-y-2 text-amber-200">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <AlertTriangle size={18} /> Daily Article Publishing Quota Reached
              </div>
              <p className="text-xs text-slate-300">
                You have reached your daily quota of <strong>{capabilities.maxArticlesPerDay} articles/day</strong> for {capabilities.name}. Upgrade to Platinum for unlimited publishing.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-violet-500/10 border border-violet-500/30 px-4 py-2.5 text-xs text-violet-300">
              <span>Tier Quota Active: <strong>{capabilities.name}</strong></span>
              <span>Published Today: <strong>{articlesToday} / {capabilities.maxArticlesPerDay >= 9999 ? "∞" : capabilities.maxArticlesPerDay}</strong></span>
            </div>
          )}

          {/* Form */}
          {capabilities.canPublishArticles && canPublishArticleMore && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Q3 2026 DeepTech VC Investment Trends & Sovereign AI Models"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Research Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-950 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Cover Banner Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Executive Summary / Abstract
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief 2-line abstract summarizing core findings..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Full Article Body (Markdown supported)
                </label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write full research analysis, thesis, data tables, and conclusions..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900 p-4 text-sm text-white focus:border-violet-400 focus:outline-none resize-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 transition"
                >
                  Publish Article
                </button>
              </div>
            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
