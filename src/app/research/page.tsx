"use client";

import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ArticlePublishModal from "@/components/research/ArticlePublishModal";
import BetaBadge from "@/components/shared/BetaBadge";
import { BookOpen, Plus, Search, Tag, Calendar, User, ArrowUpRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export interface Article {
  id: string;
  title: string;
  category: string;
  authorName: string;
  authorRole: string;
  tier: "gold" | "platinum";
  publishedAt: string;
  summary: string;
  readTime: string;
}

export default function ResearchPage() {
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Market Analysis", "Deep Tech", "VC Trends", "Web3 Infrastructure", "AI & Automation"];

  const [articles, setArticles] = useState<Article[]>([
    {
      id: "art-1",
      title: "Sovereign AI Infrastructure & Localized Edge Orchestration",
      category: "AI & Automation",
      authorName: "Dr. Elena Vance",
      authorRole: "Managing Partner, Frontier VC",
      tier: "platinum",
      publishedAt: "Aug 18, 2026",
      summary: "An in-depth analysis of enterprise capital flows toward private, on-premise model orchestration SDKs and decentralized compute clusters.",
      readTime: "6 min read",
    },
    {
      id: "art-2",
      title: "State of Pre-Seed Valuation Frameworks in 2026",
      category: "VC Trends",
      authorName: "Marcus Sterling",
      authorRole: "Angel Syndicate Lead",
      tier: "gold",
      publishedAt: "Aug 14, 2026",
      summary: "Comparing revenue-multiple valuations against technology moat metrics for early-stage B2B SaaS and developer tools startups.",
      readTime: "4 min read",
    },
    {
      id: "art-3",
      title: "Post-Quantum Cryptographic Protocols in Cloud Storage",
      category: "Deep Tech",
      authorName: "Krypton Research Team",
      authorRole: "Cybersecurity Lead",
      tier: "platinum",
      publishedAt: "Aug 10, 2026",
      summary: "Exploring lattice-based key exchange mechanisms and real-world deployment challenges across AWS S3 and GCP bucket architectures.",
      readTime: "8 min read",
    },
  ]);

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.authorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleArticlePublished = (newArticleData: { title: string; category: string; summary: string; content: string }) => {
    const newArt: Article = {
      id: `art-${Date.now()}`,
      title: newArticleData.title,
      category: newArticleData.category,
      authorName: "You (Active Author)",
      authorRole: "Platform Partner",
      tier: "gold",
      publishedAt: "Today",
      summary: newArticleData.summary || newArticleData.content.slice(0, 120) + "...",
      readTime: "3 min read",
    };
    setArticles([newArt, ...articles]);
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-400/30 text-violet-400">
                <BookOpen size={24} />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                  Gestalt Research Hub
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-white">Articles & Insights</h1>
              </div>
            </div>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Explore market research, investment thesis breakdowns, and tech reports published by verified founders and investors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <BetaBadge variant="pill" className="hidden sm:inline-flex" />
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-3 text-xs font-bold text-white shadow-xl hover:scale-105 transition"
            >
              <Plus size={16} /> Publish Article
            </button>
          </div>
        </div>

        {/* Search & Category Filter Header */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search research papers, topics, or authors..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 py-3 pl-11 pr-4 text-xs text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none backdrop-blur-xl"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-violet-500/20 border border-violet-400/50 text-violet-300"
                    : "bg-white/5 border border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Research Paper Banner */}
        {articles.length > 0 && (
          <div className="trionn-glass-card rounded-3xl border border-violet-500/30 p-8 md:p-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 text-violet-500/10 pointer-events-none">
              <BookOpen size={240} />
            </div>

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300">
                  Featured Research
                </span>
                <span className="text-xs text-slate-400">{articles[0].readTime}</span>
              </div>

              <h2 className="text-2xl md:text-4xl font-black text-white hover:text-violet-300 transition cursor-pointer">
                {articles[0].title}
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed">
                {articles[0].summary}
              </p>

              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-cyan-400" />
                  <span className="font-bold text-white">{articles[0].authorName}</span>
                  <span className="text-slate-600">•</span>
                  <span>{articles[0].authorRole}</span>
                </div>

                <span className="flex items-center gap-1 text-violet-400 font-bold hover:underline cursor-pointer">
                  Read Full Paper <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <motion.article
              key={article.id}
              whileHover={{ y: -6 }}
              className="trionn-glass-card rounded-3xl border border-white/10 p-6 flex flex-col justify-between shadow-xl space-y-4 hover:border-violet-400/40 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                    {article.category}
                  </span>
                  <span className="text-[11px] text-slate-400">{article.readTime}</span>
                </div>

                <h3 className="text-lg font-bold text-white hover:text-cyan-300 transition">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {article.summary}
                </p>
              </div>

              <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-slate-400">
                <div>
                  <span className="font-bold text-slate-200 block">{article.authorName}</span>
                  <span className="text-[10px]">{article.publishedAt}</span>
                </div>

                <button className="text-cyan-400 hover:underline font-bold text-xs">
                  Read →
                </button>
              </div>
            </motion.article>
          ))}
        </div>

      </main>

      {/* Publish Article Modal Dialog */}
      <ArticlePublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onArticlePublished={handleArticlePublished}
      />

      <Footer />
    </div>
  );
}
