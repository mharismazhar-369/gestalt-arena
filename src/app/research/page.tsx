"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";
import { BookOpen, Plus, Search, Calendar, ArrowUpRight, FileText, Filter, X } from "lucide-react";
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);

      // 1. Fetch Dynamic Categories from Database
      const { data: catData } = await supabase
        .from("platform_categories")
        .select("label");

      if (catData && catData.length > 0) {
        setCategories(["All", ...catData.map(c => c.label)]);
      } else {
        setCategories(["All", "Artificial Intelligence & ML", "Fintech & Web3", "B2B SaaS & Enterprise", "Deep Tech & Hardware", "Market Research & Macro"]);
      }

      // 2. Fetch Articles
      const { data: artData, error } = await supabase
        .from("articles")
        .select(`
          *,
          author:profiles(nickname, company_name, role, tier)
        `)
        .order("created_at", { ascending: false });

      if (artData && !error) {
        setArticles(artData);
      }
      setLoading(false);
    }

    fetchInitialData();
  }, []);

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
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10 space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl neu-pressed-base border-transparent text-[var(--accent)] shadow-inner">
                <BookOpen size={24} />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  Gestalt Research Hub
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-[var(--secondary)]">Articles & Insights</h1>
              </div>
            </div>
            <p className="text-[var(--secondary)]/70 text-sm max-w-2xl leading-relaxed font-medium">
              Explore market research, investment thesis breakdowns, and tech reports published by verified founders and investors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <BetaBadge variant="pill" className="hidden sm:inline-flex" />
            <button
              onClick={() => router.push("/research/publish")}
              className="flex items-center gap-2 px-6 py-3 text-xs neu-btn shadow-lg bg-[var(--accent)] text-[var(--primary)] font-bold hover:scale-105 transition cursor-pointer"
            >
              <Plus size={16} /> Publish Article
            </button>
          </div>
        </div>

        {/* Professional Search & Clean Compact Filter Bar */}
        <div className="neu-flat-base p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <Search size={16} className="absolute left-4 top-3.5 text-[var(--secondary)]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search research papers, topics, or authors..."
              className="w-full rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] py-3 pl-11 pr-4 text-xs text-[var(--secondary)] placeholder-[var(--secondary)]/50 focus:border-[var(--accent)] focus:outline-none transition font-medium shadow-inner"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-3 text-[var(--secondary)]/40 hover:text-[var(--secondary)]">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--secondary)]/75">
              <Filter size={14} className="text-[var(--accent)]" /> Category:
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-72 px-4 py-3 rounded-xl border border-[var(--secondary)]/15 bg-[var(--primary)] text-xs text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner font-bold cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {selectedCategory !== "All" && (
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--secondary)]/70">
            <span>Filtering by category: <strong className="text-[var(--accent)]">{selectedCategory}</strong></span>
            <button onClick={() => setSelectedCategory("All")} className="text-rose-500 hover:underline text-[10px] ml-2">Clear Filter</button>
          </div>
        )}

        {/* Dynamic Empty State */}
        {articles.length === 0 && (
          <div className="neu-flat-base p-16 text-center flex flex-col items-center justify-center space-y-6">
            <div className="p-6 rounded-full neu-pressed-base text-[var(--accent)] border-transparent shadow-inner">
              <FileText size={48} />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-bold text-[var(--secondary)]">No Research Published Yet</h3>
              <p className="text-[var(--secondary)]/70 text-sm leading-relaxed font-medium">
                The library is currently empty. Be the first to share your industry thesis or market analysis with the Gestalt Arena network.
              </p>
            </div>
            <button
              onClick={() => router.push("/research/publish")}
              className="flex items-center gap-2 px-6 py-3 text-sm neu-btn"
            >
              <Plus size={16} /> Publish First Article
            </button>
          </div>
        )}

        {/* Featured Research Paper Banner */}
        {articles.length > 0 && !isFiltering && (
          <div className="neu-flat-base p-8 md:p-10 relative overflow-hidden group transition-all">
            <div className="absolute top-0 right-0 p-8 text-[var(--secondary)] opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-700">
              <BookOpen size={240} />
            </div>

            <div className="relative z-10 max-w-3xl space-y-5">
              <div className="flex items-center gap-3">
                <span className="neu-pressed-base px-3 py-1 text-xs font-bold text-[var(--accent)] shadow-inner">
                  Featured Publication
                </span>
                <span className="text-xs text-[var(--secondary)]/60 font-medium flex items-center gap-1">
                  <Calendar size={12} /> {new Date(articles[0].created_at).toLocaleDateString()}
                </span>
              </div>

              <Link href={`/research/${articles[0].id}`}>
                <h2 className="text-2xl md:text-4xl font-black text-[var(--secondary)] group-hover:text-[var(--accent)] transition cursor-pointer">
                  {articles[0].title}
                </h2>
              </Link>

              <p className="text-[var(--secondary)]/80 text-sm leading-relaxed line-clamp-3 font-medium">
                {articles[0].summary}
              </p>

              <div className="flex items-center justify-between border-t border-[var(--secondary)]/10 pt-5 text-xs text-[var(--secondary)]/60 mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-[var(--accent)] flex items-center justify-center font-bold text-[var(--primary)] text-[10px] uppercase shadow-sm">
                    {(articles[0].author?.nickname || articles[0].author?.company_name || "U").slice(0, 2)}
                  </div>
                  <span className="font-bold text-[var(--secondary)]">{articles[0].author?.nickname || articles[0].author?.company_name || "Arena Member"}</span>
                  <span className="text-[var(--secondary)]/30 hidden sm:inline">•</span>
                  <span className="hidden sm:inline capitalize font-medium">{articles[0].author?.role}</span>
                </div>

                <Link
                  href={`/research/${articles[0].id}`}
                  className="flex items-center gap-1 text-[var(--accent)] font-bold group-hover:underline cursor-pointer bg-transparent px-3 py-1.5 rounded-lg neu-btn shadow-none hover:shadow-inner transition"
                >
                  Read Full Paper <ArrowUpRight size={14} />
                </Link>
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
                className="neu-flat-base p-6 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="neu-pressed-base px-2.5 py-1 text-[10px] font-bold text-[var(--accent)] tracking-wide uppercase border-transparent shadow-inner">
                      {article.category}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--secondary)]/60 bg-transparent border border-[var(--secondary)]/10 px-2 py-1 rounded-md">
                      {article.read_time || "5 min read"}
                    </span>
                  </div>

                  <Link href={`/research/${article.id}`}>
                    <h3 className="text-lg font-bold text-[var(--secondary)] group-hover:text-[var(--accent)] transition cursor-pointer leading-snug">
                      {article.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-[var(--secondary)]/70 leading-relaxed line-clamp-3 font-medium">
                    {article.summary}
                  </p>
                </div>

                <div className="border-t border-[var(--secondary)]/10 pt-4 flex items-center justify-between text-xs text-[var(--secondary)]/60 mt-auto">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[var(--secondary)]">{article.author?.nickname || article.author?.company_name || "Arena Member"}</span>
                    <span className="text-[9px] uppercase tracking-wider text-[var(--secondary)]/50 font-bold">{new Date(article.created_at).toLocaleDateString()}</span>
                  </div>

                  <Link
                    href={`/research/${article.id}`}
                    className="text-[var(--accent)] font-bold text-xs bg-transparent px-3 py-1.5 rounded-lg neu-btn shadow-none hover:shadow-inner transition"
                  >
                    Read →
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Filtered Empty State */}
        {filteredArticles.length === 0 && articles.length > 0 && (
          <div className="text-center py-12 space-y-3">
            <Search size={32} className="mx-auto text-[var(--secondary)]/40 mb-2" />
            <h3 className="text-lg font-bold text-[var(--secondary)]">No matches found</h3>
            <p className="text-sm text-[var(--secondary)]/60 font-medium">Try adjusting your search terms or category filters.</p>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}