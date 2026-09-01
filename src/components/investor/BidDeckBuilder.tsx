"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Target, DollarSign, Briefcase, FileText, Loader2, Send } from "lucide-react";

interface BidDeckBuilderProps {
    investorId: string;
}

export default function BidDeckBuilder({ investorId }: BidDeckBuilderProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: "",
        thesis: "",
        target_sectors: "",
        min_arr: 0,
        max_allocation: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const sectorsArray = form.target_sectors
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        const { error: insertError } = await supabase.from("investor_bid_decks").insert({
            investor_id: investorId,
            title: form.title,
            thesis: form.thesis,
            target_sectors: sectorsArray,
            min_arr: form.min_arr,
            max_allocation: form.max_allocation,
            status: "active",
        });

        if (insertError) {
            setError(insertError.message);
            setSaving(false);
        } else {
            router.push("/investor/dashboard");
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-bold text-rose-400">
                    {error}
                </div>
            )}

            <div className="trionn-glass-card rounded-3xl border border-cyan-500/30 p-8 shadow-xl space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                    <Target size={18} className="text-cyan-400" /> Mandate Fundamentals
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                            Bid Deck Title
                        </label>
                        <input
                            type="text"
                            required
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. 2026 DeepTech Seed Fund Allocation"
                            className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1 flex items-center gap-1">
                            <FileText size={12} /> Investment Thesis & Requirements
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={form.thesis}
                            onChange={(e) => setForm({ ...form, thesis: e.target.value })}
                            placeholder="Detail your investment thesis, required traction, and founder expectations..."
                            className="w-full rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm text-white focus:border-cyan-400 focus:outline-none transition resize-none"
                        />
                    </div>
                </div>
            </div>

            <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 shadow-xl space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                    <DollarSign size={18} className="text-emerald-400" /> Capital & Sector Parameters
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                                Minimum ARR Requirement ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={form.min_arr}
                                onChange={(e) => setForm({ ...form, min_arr: Number(e.target.value) })}
                                className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm font-mono text-white focus:border-emerald-400 focus:outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                                Maximum Allocation Cap ($)
                            </label>
                            <input
                                type="number"
                                required
                                min="1000"
                                value={form.max_allocation}
                                onChange={(e) => setForm({ ...form, max_allocation: Number(e.target.value) })}
                                className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm font-mono text-white focus:border-emerald-400 focus:outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1 flex items-center gap-1">
                            <Briefcase size={12} /> Target Sectors (Comma Separated)
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={form.target_sectors}
                            onChange={(e) => setForm({ ...form, target_sectors: e.target.value })}
                            placeholder="e.g. Artificial Intelligence, B2B SaaS, Climate Tech"
                            className="w-full rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm text-white focus:border-cyan-400 focus:outline-none transition resize-none"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 pb-12">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-4 text-sm font-black text-black shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {saving ? "Publishing Mandate..." : "Publish Investor Bid Deck"}
                </button>
            </div>
        </form>
    );
}