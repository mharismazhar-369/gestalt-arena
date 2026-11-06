"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";
import { useAuth } from "@/components/auth/AuthProvider";
import {
    FileText, ArrowLeft, Image as ImageIcon, Save, Send, X,
    Bold, Italic, List, Heading2, Quote, AlertCircle, Loader2
} from "lucide-react";

export default function PublishArticlePage() {
    const router = useRouter();
    const { session } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");
    const [readTime, setReadTime] = useState("5 min read");
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    // Categories fetched from DB
    const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);

    useEffect(() => {
        async function fetchCategories() {
            // Fetch dynamic categories from Supabase (platform_categories or platform_references)
            const { data, error } = await supabase
                .from("platform_categories")
                .select("id, label");

            if (data && data.length > 0) {
                setCategories(data);
            } else {
                // Fallback default categories if table is empty
                setCategories([
                    { id: "ai_ml", label: "Artificial Intelligence" },
                    { id: "fintech", label: "Fintech & Web3" },
                    { id: "saas", label: "B2B SaaS & Cloud" },
                    { id: "deep_tech", label: "Deep Tech & Hardware" },
                    { id: "market_research", label: "Market Research & Macro" }
                ]);
            }
            setLoading(false);
        }

        fetchCategories();
    }, []);

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1 MB limit check ($1 \text{ MB} = 1048576 \text{ bytes}$)
        if (file.size > 1048576) {
            setErrorMsg("Banner image must be smaller than 1 MB.");
            return;
        }

        setErrorMsg(null);
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    };

    const handleFormat = (syntaxPrefix: string, syntaxSuffix: string = "") => {
        const textarea = document.getElementById("article-content-textarea") as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const replacement = `${syntaxPrefix}${selectedText || "text"}${syntaxSuffix}`;

        const newContent = content.substring(0, start) + replacement + content.substring(end);
        setContent(newContent);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + syntaxPrefix.length, end + syntaxPrefix.length);
        }, 0);
    };

    const handleSave = async (status: 'draft' | 'published') => {
        if (!session?.user?.id) {
            setErrorMsg("You must be logged in to publish articles.");
            return;
        }
        if (!title.trim() || !content.trim() || !category) {
            setErrorMsg("Please fill in all required fields (Title, Category, Content).");
            return;
        }

        setSubmitting(true);
        setErrorMsg(null);

        try {
            let imageUrl = null;

            // Upload Banner if provided
            if (bannerFile) {
                const fileExt = bannerFile.name.split('.').pop();
                const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from("research_banners")
                    .upload(fileName, bannerFile);

                if (!uploadError) {
                    const { data: publicUrlData } = supabase.storage
                        .from("research_banners")
                        .getPublicUrl(fileName);
                    imageUrl = publicUrlData.publicUrl;
                }
            }

            // Insert into public.articles table compatible with schema
            const { error: insertError } = await supabase
                .from("articles")
                .insert({
                    author_id: session.user.id,
                    title: title.trim(),
                    category: category,
                    summary: summary.trim(),
                    content: content.trim(),
                    read_time: readTime,
                    // image_url if schema supports it, or store in summary/metadata
                });

            if (insertError) throw insertError;

            router.push("/research");
        } catch (err: any) {
            console.error("Publishing error:", err);
            setErrorMsg(err.message || "Failed to save article.");
            setSubmitting(false);
        }
    };

    if (loading) return <RoleRoutingLoader message="Loading Publishing Suite..." />;

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10 space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-6">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-[var(--secondary)]/60 hover:text-[var(--accent)] transition font-bold text-xs">
                        <ArrowLeft size={14} /> Cancel & Return
                    </button>
                    <h1 className="text-xl font-black text-[var(--secondary)] flex items-center gap-2">
                        <FileText className="text-[var(--accent)]" size={20} /> Research Publishing Suite
                    </h1>
                </div>

                {errorMsg && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={16} /> {errorMsg}
                    </div>
                )}

                <div className="space-y-6">

                    {/* Title & Category */}
                    <div className="neu-flat-base p-6 md:p-8 rounded-3xl space-y-6">
                        <h2 className="text-sm font-bold text-[var(--secondary)] uppercase tracking-wider">Article Metadata</h2>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Research Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Enter a compelling title for your research paper..."
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/15 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition shadow-inner font-bold"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Research Category (from DB) *</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/15 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner font-bold"
                                >
                                    <option value="">Select Category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.label}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Estimated Read Time</label>
                                <input
                                    type="text"
                                    value={readTime}
                                    onChange={e => setReadTime(e.target.value)}
                                    placeholder="e.g. 5 min read"
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/15 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Executive Summary / Abstract</label>
                            <textarea
                                rows={3}
                                value={summary}
                                onChange={e => setSummary(e.target.value)}
                                placeholder="Brief summary highlighting core findings..."
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/15 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition resize-none shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Banner Container (Max 1 MB) */}
                    <div className="neu-flat-base p-6 md:p-8 rounded-3xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-[var(--secondary)] uppercase tracking-wider flex items-center gap-2">
                                <ImageIcon size={16} className="text-[var(--accent)]" /> Banner Image (Max 1 MB)
                            </h2>
                            <span className="text-[10px] text-[var(--secondary)]/50 font-mono">Recommended: 1200x630px</span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {bannerPreview ? (
                                <div className="relative w-full sm:w-48 h-28 rounded-xl overflow-hidden border border-[var(--secondary)]/20 shadow-inner">
                                    <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => { setBannerFile(null); setBannerPreview(null); }}
                                        className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full sm:w-48 h-28 rounded-xl neu-pressed-base border-dashed border-2 border-[var(--secondary)]/20 flex flex-col items-center justify-center text-center p-4">
                                    <ImageIcon size={24} className="text-[var(--secondary)]/40 mb-1" />
                                    <span className="text-[10px] text-[var(--secondary)]/60 font-bold">No Banner Selected</span>
                                </div>
                            )}

                            <div className="flex-1 space-y-2 w-full">
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleBannerChange}
                                    className="text-xs text-[var(--secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[var(--accent)] file:text-[var(--primary)] hover:file:opacity-90 cursor-pointer"
                                />
                                <p className="text-[10px] text-[var(--secondary)]/50">Files must be strictly under 1 MB in size.</p>
                            </div>
                        </div>
                    </div>

                    {/* Content Editor with Formatting Toolbar */}
                    <div className="neu-flat-base p-6 md:p-8 rounded-3xl space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--secondary)]/10 pb-3">
                            <h2 className="text-sm font-bold text-[var(--secondary)] uppercase tracking-wider">Research Body & Formatting</h2>

                            <div className="flex items-center gap-1 bg-[var(--primary)] p-1 rounded-xl neu-pressed-base border-transparent shadow-inner">
                                <button type="button" onClick={() => handleFormat("**", "**")} title="Bold" className="p-2 hover:text-[var(--accent)] transition rounded-lg text-xs"><Bold size={14} /></button>
                                <button type="button" onClick={() => handleFormat("*", "*")} title="Italic" className="p-2 hover:text-[var(--accent)] transition rounded-lg text-xs"><Italic size={14} /></button>
                                <button type="button" onClick={() => handleFormat("\n## ", "")} title="Heading" className="p-2 hover:text-[var(--accent)] transition rounded-lg text-xs"><Heading2 size={14} /></button>
                                <button type="button" onClick={() => handleFormat("\n- ", "")} title="Bullet List" className="p-2 hover:text-[var(--accent)] transition rounded-lg text-xs"><List size={14} /></button>
                                <button type="button" onClick={() => handleFormat("\n> ", "")} title="Quote" className="p-2 hover:text-[var(--accent)] transition rounded-lg text-xs"><Quote size={14} /></button>
                            </div>
                        </div>

                        <textarea
                            id="article-content-textarea"
                            rows={12}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Write your detailed research findings, market analysis, or technical documentation here..."
                            className="w-full p-4 rounded-xl border border-[var(--secondary)]/15 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition font-mono leading-relaxed shadow-inner"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.push("/research")}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl neu-btn text-xs font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleSave('draft')}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl neu-btn text-xs font-bold flex items-center justify-center gap-2"
                        >
                            <Save size={14} /> Save as Draft
                        </button>
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleSave('published')}
                            className="w-full sm:w-auto px-8 py-3 rounded-xl neu-btn text-xs font-bold bg-[var(--accent)] text-[var(--primary)] flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition"
                        >
                            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Save & Publish
                        </button>
                    </div>

                </div>

            </main>

            <Footer />
        </div>
    );
}