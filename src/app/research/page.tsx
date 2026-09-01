"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ArticlePublishModal from "@/components/research/ArticlePublishModal";
import BetaBadge from "@/components/shared/BetaBadge";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";
import { BookOpen, Plus, Search, Calendar, User, ArrowUpRight, FileText } from "lucide-react";
import { motion } from "framer-motion";

export interface Article {
  id: string;
  author_id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  read_time: string;
  created_at: string;
  author?: {
    nickname?: string;
    company_name?: string;
    role?: string;
    tier?: string;
  };
}

export default function ResearchPage() {
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Market Analysis", "Deep Tech", "VC Trends", "Web3 Infrastructure", "AI & Automation"];

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select(`
        *,
        author:profiles(nickname, company_name, role, tier)
      `)
      .order("created_at", { ascending: false });

    if (data && !error) {
      setArticles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Handle the incoming data from your ArticlePublishModal
  const handleArticlePublished = async (newArticleData: { title: string; category: string; summary: string; content: string }) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    const { error } = await supabase.from("articles").insert({
      author_id: userData.user.id,
      title: newArticleData.title,
      category: newArticleData.category,
      summary: newArticleData.summary || newArticleData.content.slice(0, 150) + "...",
      content: newArticleData.content,
      read_time: `${Math.max(1, Math.ceil(newArticleData.content.length / 1000))} min read`
    });

    if (!error) {
      setIsPublishModalOpen(false);
      fetchArticles(); // Refresh the live feed
    }
  };

  const filteredArticles = articles.filter((art) => {
    const authorDisplayName = art.author?.nickname || art.author?.company_name || "";
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.summary && art.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      authorDisplayName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const isFiltering = searchQuery.trim() !== "" || selectedCategory !== "All";

  if (loading) return <RoleRoutingLoader message="Loading Research Database..." />;

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10 space-y-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-400/30 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
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
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 p-2 rounded-3xl border border-white/5 backdrop-blur-sm">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search research papers, topics, or authors..."
              className="w-full rounded-2xl border border-transparent bg-slate-950/80 py-3 pl-11 pr-4 text-xs text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none transition"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto p-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${selectedCategory === cat
                    ? "bg-violet-500 border border-violet-400 text-white shadow-lg"
                    : "bg-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Empty State */}
        {articles.length === 0 && (
          <div className="trionn-glass-card rounded-3xl border border-white/10 p-16 text-center flex flex-col items-center justify-center space-y-6 shadow-2xl">
            <div className="p-6 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <FileText size={48} />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-bold text-white">No Research Published Yet</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The library is currently empty. Be the first to share your LinkedIn articles, industry thesis, or market analysis with the Gestalt Arena network.
              </p>
            </div>
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-violet-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-violet-600 hover:scale-105"
            >
              <Plus size={16} /> Publish First Article
            </button>
          </div>
        )}

        {/* Featured Research Paper Banner (Only shows if articles exist and no filters are active) */}
        {articles.length > 0 && !isFiltering && (
          <div className="trionn-glass-card rounded-3xl border border-violet-500/30 p-8 md:p-10 relative overflow-hidden shadow-2xl group transition-all hover:border-violet-400/50">
            <div className="absolute top-0 right-0 p-8 text-violet-500/10 pointer-events-none transition-transform group-hover:scale-110 duration-700">
              <BookOpen size={240} />
            </div>

            <div className="relative z-10 max-w-3xl space-y-5">
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                  Featured Publication
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Calendar size={12} /> {new Date(articles[0].created_at).toLocaleDateString()}
                </span>
              </div>

              <h2 className="text-2xl md:text-4xl font-black text-white group-hover:text-violet-300 transition cursor-pointer">
                {articles[0].title}
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                {articles[0].summary}
              </p>

              <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-slate-400 mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center font-bold text-black text-[10px] uppercase">
                    {(articles[0].author?.nickname || articles[0].author?.company_name || "U").slice(0, 2)}
                  </div>
                  <span className="font-bold text-white">{articles[0].author?.nickname || articles[0].author?.company_name || "Arena Member"}</span>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span className="hidden sm:inline capitalize">{articles[0].author?.role}</span>
                </div>

                <span className="flex items-center gap-1 text-violet-400 font-bold group-hover:underline cursor-pointer bg-violet-500/10 px-3 py-1.5 rounded-lg">
                  Read Full Paper <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {filteredArticles.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.slice(isFiltering ? 0 : 1).map((article) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                className="trionn-glass-card rounded-3xl border border-white/10 p-6 flex flex-col justify-between shadow-xl space-y-5 hover:border-violet-400/40 transition bg-gradient-to-b from-white/[0.03] to-transparent"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-white/5 px-2.5 py-1 text-[10px] font-bold text-cyan-300 tracking-wide uppercase border border-white/5">
                      {article.category}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-900/50 px-2 py-1 rounded-md">
                      {article.read_time}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white hover:text-cyan-300 transition cursor-pointer leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-slate-400 mt-auto">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-200">{article.author?.nickname || article.author?.company_name || "Arena Member"}</span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500">{new Date(article.created_at).toLocaleDateString()}</span>
                  </div>

                  <button className="text-cyan-400 hover:text-white transition font-bold text-xs bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                    Read →
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Filtered Empty State */}
        {filteredArticles.length === 0 && articles.length > 0 && (
          <div className="text-center py-12 space-y-3">
            <Search size={32} className="mx-auto text-slate-600 mb-2" />
            <h3 className="text-lg font-bold text-white">No matches found</h3>
            <p className="text-sm text-slate-400">Try adjusting your search terms or category filters.</p>
          </div>
        )}

      </main>

      <ArticlePublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onArticlePublished={handleArticlePublished}
      />

      <Footer />
    </div>
  );
}