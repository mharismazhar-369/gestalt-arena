"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { BookOpen, Calendar, ArrowLeft, Clock, FileText, ThumbsUp, ThumbsDown, Share2, Trash2, CheckCircle2 } from "lucide-react";

export default function SingleArticlePage() {
    const params = useParams();
    const router = useRouter();
    const articleId = params?.id ? String(params.id) : "";
    const { session } = useAuth();

    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Interaction States
    const [likesCount, setLikesCount] = useState(0);
    const [dislikesCount, setDislikesCount] = useState(0);
    const [userAction, setUserAction] = useState<'like' | 'dislike' | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!articleId) return;

        async function fetchData() {
            // 1. Fetch Article
            const { data: articleData, error: articleError } = await supabase
                .from("articles")
                .select(`*, author:profiles(id, nickname, company_name, role, tier)`)
                .eq("id", articleId)
                .single();

            if (articleError || !articleData) {
                console.error("Error fetching article:", articleError);
                setLoading(false);
                return;
            }
            setArticle(articleData);

            // 2. Fetch Interaction Counts
            const [{ count: likes }, { count: dislikes }] = await Promise.all([
                supabase.from("article_likes").select("*", { count: "exact", head: true }).eq("article_id", articleId),
                supabase.from("article_dislikes").select("*", { count: "exact", head: true }).eq("article_id", articleId)
            ]);

            setLikesCount(likes || 0);
            setDislikesCount(dislikes || 0);

            // 3. Fetch Current User's Action (if logged in)
            if (session?.user?.id) {
                const [{ data: userLike }, { data: userDislike }] = await Promise.all([
                    supabase.from("article_likes").select("id").eq("article_id", articleId).eq("user_id", session.user.id).single(),
                    supabase.from("article_dislikes").select("id").eq("article_id", articleId).eq("user_id", session.user.id).single()
                ]);

                if (userLike) setUserAction('like');
                else if (userDislike) setUserAction('dislike');
            }

            setLoading(false);
        }

        fetchData();
    }, [articleId, session]);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setIsSharing(true);
            setTimeout(() => setIsSharing(false), 2000);
        } catch (err) {
            console.error("Failed to copy URL");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to permanently delete this article? This cannot be undone.")) return;
        setIsDeleting(true);

        const { error } = await supabase.from("articles").delete().eq("id", articleId);

        if (!error) {
            router.push("/research");
        } else {
            console.error("Delete failed:", error);
            setIsDeleting(false);
        }
    };

    const handleInteraction = async (type: 'like' | 'dislike') => {
        if (!session?.user?.id) {
            alert("You must be logged in to interact with articles.");
            return;
        }

        const userId = session.user.id;

        // Optimistic UI updates
        if (type === 'like') {
            if (userAction === 'like') {
                setUserAction(null);
                setLikesCount(prev => prev - 1);
                await supabase.from("article_likes").delete().match({ article_id: articleId, user_id: userId });
            } else {
                setUserAction('like');
                setLikesCount(prev => prev + 1);
                if (userAction === 'dislike') {
                    setDislikesCount(prev => prev - 1);
                    await supabase.from("article_dislikes").delete().match({ article_id: articleId, user_id: userId });
                }
                await supabase.from("article_likes").insert({ article_id: articleId, user_id: userId });
            }
        } else {
            if (userAction === 'dislike') {
                setUserAction(null);
                setDislikesCount(prev => prev - 1);
                await supabase.from("article_dislikes").delete().match({ article_id: articleId, user_id: userId });
            } else {
                setUserAction('dislike');
                setDislikesCount(prev => prev + 1);
                if (userAction === 'like') {
                    setLikesCount(prev => prev - 1);
                    await supabase.from("article_likes").delete().match({ article_id: articleId, user_id: userId });
                }
                await supabase.from("article_dislikes").insert({ article_id: articleId, user_id: userId });
            }
        }
    };

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
    const isAuthor = session?.user?.id === article.author_id;

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10 space-y-8">

                {/* Navigation & Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--secondary)]/10 pb-6 gap-4">
                    <button onClick={() => router.push("/research")} className="flex items-center gap-2 text-[var(--secondary)]/60 hover:text-[var(--accent)] transition font-bold text-xs w-fit">
                        <ArrowLeft size={14} /> Back to Hub
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--secondary)]/60">
                            <span className="flex items-center gap-1"><Calendar size={12} className="text-[var(--accent)]" /> {new Date(article.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock size={12} className="text-[var(--accent)]" /> {article.read_time || "5 min read"}</span>
                        </div>

                        {/* Secure Delete Button - Only Visible to Author */}
                        {isAuthor && (
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition text-[10px] font-bold"
                            >
                                <Trash2 size={12} />
                                {isDeleting ? "Deleting..." : "Delete Paper"}
                            </button>
                        )}
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
                        {article.content.split('\n').map((paragraph: string, index: number) => (
                            paragraph.trim() ? (
                                <p key={index} className="leading-relaxed font-medium mb-4 whitespace-pre-wrap">
                                    {paragraph}
                                </p>
                            ) : null
                        ))}
                    </div>
                </div>

                {/* Interaction Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-t border-[var(--secondary)]/10 mt-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleInteraction('like')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${userAction === 'like' ? 'neu-pressed-base text-emerald-500 border-transparent shadow-inner' : 'neu-btn hover:text-emerald-500'}`}
                        >
                            <ThumbsUp size={16} className={userAction === 'like' ? "fill-emerald-500" : ""} />
                            <span>{likesCount}</span>
                        </button>

                        <button
                            onClick={() => handleInteraction('dislike')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${userAction === 'dislike' ? 'neu-pressed-base text-rose-500 border-transparent shadow-inner' : 'neu-btn hover:text-rose-500'}`}
                        >
                            <ThumbsDown size={16} className={userAction === 'dislike' ? "fill-rose-500" : ""} />
                            <span>{dislikesCount}</span>
                        </button>
                    </div>

                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-6 py-2 text-xs font-bold neu-btn"
                    >
                        {isSharing ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Share2 size={16} />}
                        {isSharing ? "Link Copied!" : "Share Article"}
                    </button>
                </div>

            </main>

            <Footer />
        </div>
    );
}