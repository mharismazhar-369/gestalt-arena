"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";
import Link from "next/link";
import { BookOpen, Calendar, ArrowLeft, Clock, FileText } from "lucide-react";

export default function SingleArticlePage() {
    const params = useParams();
    const router = useRouter();
    const articleId = params?.id ? String(params.id) : "";

    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!articleId) return;

        async function fetchArticle() {
            const { data, error } = await supabase
                .from("articles")
                .select(`
          *,
          author:profiles(id, nickname, company_name, role, tier)
        `)
                .eq("id", articleId)
                .single();

            if (error || !data) {
                console.error("Error fetching article:", error);
            } else {
                setArticle(data);
            }
            setLoading(false);
        }

        fetchArticle();
    }, [articleId]);

    if (loading) return <RoleRoutingLoader message="Loading Research Paper..." />;

    if (!article) return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex items-center justify-center transition-colors duration-300">
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-[var(--secondary)]">Article Not Found</h2>
                <p className="text-[var(--secondary)]/60 font-medium">This research paper may have been deleted or does not exist.</p>
                <button onClick={() => router.back()} className="neu-btn px-6 py-2 text-xs mt-4">
                    Go Back
                </button>
            </div>
        </div>
    );

    const authorDisplayName = article.author?.nickname || article.author?.company_name || "Arena Member";

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10 space-y-8">

                {/* Navigation & Meta */}
                <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-6">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-[var(--secondary)]/60 hover:text-[var(--accent)] transition font-bold text-xs">
                        <ArrowLeft size={14} /> Back
                    </button>

                    <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--secondary)]/60">
                        <span className="flex items-center gap-1"><Calendar size={12} className="text-[var(--accent)]" /> {new Date(article.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={12} className="text-[var(--accent)]" /> {article.read_time || "5 min read"}</span>
                    </div>
                </div>

                {/* Article Header */}
                <div className="space-y-6">
                    <span className="neu-pressed-base border-transparent shadow-inner px-3 py-1 rounded-full text-[10px] font-bold uppercase text-[var(--accent)] inline-flex">
                        {article.category}
                    </span>

                    <h1 className="text-3xl md:text-5xl font-black text-[var(--secondary)] leading-tight">
                        {article.title}
                    </h1>

                    <p className="text-lg text-[var(--secondary)]/80 font-medium italic border-l-4 border-[var(--accent)] pl-4 py-2">
                        {article.summary}
                    </p>

                    <Link href={`/profile/${article.author_id}`} className="inline-flex items-center gap-3 neu-flat-base p-3 pr-6 rounded-2xl hover:border-[var(--accent)]/40 transition group cursor-pointer">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-[var(--accent)] flex items-center justify-center font-bold text-[var(--primary)] text-sm uppercase shadow-inner">
                            {authorDisplayName.slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-[var(--secondary)] text-sm group-hover:text-[var(--accent)] transition">{authorDisplayName}</span>
                            <span className="text-[10px] font-bold text-[var(--secondary)]/60 capitalize">{article.author?.role || "Author"}</span>
                        </div>
                    </Link>
                </div>

                {/* Full Content Body */}
                <div className="neu-flat-base p-8 md:p-12 space-y-6 mt-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-[var(--secondary)] opacity-5 pointer-events-none">
                        <BookOpen size={240} />
                    </div>

                    <div className="relative z-10 prose prose-invert max-w-none text-[var(--secondary)]/90 prose-headings:text-[var(--secondary)] prose-a:text-[var(--accent)] prose-strong:text-[var(--secondary)] prose-strong:font-black">
                        {/* If content is raw text/markdown, you can split by newlines for basic paragraphs */}
                        {article.content.split('\n').map((paragraph: string, index: number) => (
                            paragraph.trim() ? (
                                <p key={index} className="leading-relaxed font-medium mb-4 whitespace-pre-wrap">
                                    {paragraph}
                                </p>
                            ) : null
                        ))}
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}