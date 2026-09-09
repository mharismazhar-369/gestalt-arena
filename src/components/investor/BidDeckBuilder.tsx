"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Target, DollarSign, Briefcase, FileText, Loader2, Send, Globe, Clock, Percent, Link as LinkIcon, Plus, X, Building, Activity, Users, ShieldAlert, Sparkles } from "lucide-react";

interface BidDeckBuilderProps {
    investorId: string;
}

function BidDeckBuilderForm({ investorId }: BidDeckBuilderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetPitchId = searchParams.get("target_pitch");

    const isTargeted = !!targetPitchId;

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: "",
        thesis: "",
        investment_stage: "Seed",
        target_entity_type: "Startup",
        target_sectors: "",
        target_countries: "",
        target_customer_segment: "B2B",
        preferred_business_model: "",
        max_allocation: "",
        min_ticket: "",
        investment_type: "Equity",
        max_valuation: "",
        min_arr: "",
        min_roi: "",
        investment_duration: "",
        strategic_value_add: "",
        founder_requirements: "",
        risk_tolerance: "",
        website_url: "",
        linkedin_url: "",
    });

    const [portfolioLinks, setPortfolioLinks] = useState<string[]>([""]);

    const handlePortfolioChange = (index: number, value: string) => {
        const newLinks = [...portfolioLinks];
        newLinks[index] = value;
        setPortfolioLinks(newLinks);
    };

    const addPortfolioLink = () => {
        if (portfolioLinks.length < 3) setPortfolioLinks([...portfolioLinks, ""]);
    };

    const removePortfolioLink = (index: number) => {
        setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const sectorsArray = form.target_sectors.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
        const countriesArray = form.target_countries.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
        const portfoliosArray = portfolioLinks.map((l) => l.trim()).filter((l) => l.length > 0);

        const bidStatus = isTargeted ? "Private" : "active";

        const payload = {
            investor_id: investorId,
            title: form.title,
            thesis: form.thesis,
            investment_stage: form.investment_stage,
            target_entity_type: form.target_entity_type,
            target_sectors: sectorsArray,
            target_countries: countriesArray,
            target_customer_segment: form.target_customer_segment,
            preferred_business_model: form.preferred_business_model,
            max_allocation: Number(form.max_allocation) || 0,
            min_ticket: Number(form.min_ticket) || 0,
            investment_type: form.investment_type,
            max_valuation: Number(form.max_valuation) || 0,
            min_arr: Number(form.min_arr) || 0,
            min_roi: Number(form.min_roi) || null,
            investment_duration: form.investment_duration,
            strategic_value_add: form.strategic_value_add,
            founder_requirements: form.founder_requirements,
            risk_tolerance: form.risk_tolerance,
            website_url: form.website_url,
            linkedin_url: form.linkedin_url,
            previous_portfolios: portfoliosArray,
            status: bidStatus,
        };

        const { data: newBid, error: insertError } = await supabase.from("investor_bid_decks").insert(payload).select().single();

        if (insertError || !newBid) {
            setError(insertError?.message || "Database execution failed.");
            setSaving(false);
            return;
        }

        if (isTargeted && targetPitchId) {
            const { data: pitchData } = await supabase
                .from("pitch_decks")
                .select("user_id")
                .eq("id", targetPitchId)
                .single();

            if (pitchData) {
                const { data: newDeal, error: dealError } = await supabase.from("deal_negotiations").insert({
                    startup_id: pitchData.user_id,
                    investor_id: investorId,
                    pitch_deck_id: targetPitchId,
                    bid_deck_id: newBid.id,
                    status: "Pending Founder Approval",
                }).select().single();

                if (newDeal && !dealError) {
                    await supabase.from("notifications").insert({
                        user_id: pitchData.user_id,
                        actor_id: investorId,
                        type: "deal_initiated",
                        message: "submitted a private counter-offer to your pitch.",
                        reference_id: newDeal.id
                    });

                    router.push(`/negotiations/${newDeal.id}`);
                    return;
                }
            }
        }

        router.push("/investor/dashboard");
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {isTargeted && (
                <div className="mb-8 flex items-center gap-4 neu-pressed-base border-transparent shadow-inner p-5 rounded-2xl">
                    <Target className="text-[var(--accent)] shrink-0" size={32} />
                    <div>
                        <h3 className="text-sm font-bold text-[var(--secondary)]">Private Counter-Offer</h3>
                        <p className="text-xs text-[var(--secondary)]/70 font-medium">This creates a private capital mandate targeted specifically at this startup. It will not be publicly visible.</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-xs font-bold text-rose-600 neu-pressed-base border-transparent shadow-inner rounded-lg p-4">
                    <ShieldAlert size={16} className="shrink-0" />
                    <span className="break-all">{error}</span>
                </div>
            )}

            {/* Section 1: Core Mandate */}
            <div className="neu-flat-base p-8 space-y-6">
                <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                    <Building size={18} className="text-[var(--accent)]" /> Core Mandate & Thesis
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider">Bid Deck Title</label>
                        <input type="text" required name="title" value={form.title} onChange={handleChange} placeholder={isTargeted ? "e.g. Counter-Offer for [Startup]" : "e.g. 2026 DeepTech Seed Fund"} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider">Target Stage</label>
                        <select name="investment_stage" value={form.investment_stage} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]">
                            <option className="bg-[var(--primary)]">Pre-Seed</option>
                            <option className="bg-[var(--primary)]">Seed</option>
                            <option className="bg-[var(--primary)]">Series A</option>
                            <option className="bg-[var(--primary)]">Series B+</option>
                            <option className="bg-[var(--primary)]">Agnostic</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider flex items-center gap-1">
                        <FileText size={12} className="text-[var(--accent)]" /> Investment Thesis
                    </label>
                    <textarea required name="thesis" rows={4} value={form.thesis} onChange={handleChange} placeholder="Detail your investment thesis, what you look for in a team, and macro trends you are betting on." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition resize-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                </div>
            </div>

            {/* Section 2: Market & Sector Focus */}
            <div className="neu-flat-base p-8 space-y-6">
                <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                    <Globe size={18} className="text-[var(--accent)]" /> Market & Sector Focus
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider flex items-center gap-1">
                            <Briefcase size={12} className="text-[var(--accent)]" /> Target Sectors (Comma Separated)
                        </label>
                        <input type="text" required name="target_sectors" value={form.target_sectors} onChange={handleChange} placeholder="e.g. AI, B2B SaaS, Climate Tech" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider flex items-center gap-1">
                            <Globe size={12} className="text-[var(--accent)]" /> Target Geographies (Comma Separated)
                        </label>
                        <input type="text" name="target_countries" value={form.target_countries} onChange={handleChange} placeholder="e.g. US, UK, Global" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider">Customer Segment Pref.</label>
                        <select name="target_customer_segment" value={form.target_customer_segment} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]">
                            <option className="bg-[var(--primary)]">B2B</option>
                            <option className="bg-[var(--primary)]">B2C</option>
                            <option className="bg-[var(--primary)]">B2B2C</option>
                            <option className="bg-[var(--primary)]">Government / Enterprise</option>
                            <option className="bg-[var(--primary)]">Agnostic</option>
                        </select>
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider">Target Entity Type</label>
                        <select name="target_entity_type" value={form.target_entity_type} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]">
                            <option className="bg-[var(--primary)]">Startup</option>
                            <option className="bg-[var(--primary)]">SME / Traditional Business</option>
                            <option className="bg-[var(--primary)]">Project / Syndicate</option>
                            <option className="bg-[var(--primary)]">Agnostic</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider">Preferred Business Models</label>
                    <input type="text" name="preferred_business_model" value={form.preferred_business_model} onChange={handleChange} placeholder="e.g. SaaS Subscription, Marketplace, Hardware sales" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                </div>
            </div>

            {/* Section 3: Capital & Deal Structure */}
            <div className="neu-flat-base p-8 space-y-6">
                <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                    <DollarSign size={18} className="text-emerald-600" /> Capital & Deal Parameters
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider">Max Allocation Cap ($)</label>
                        <input type="number" required min="1000" name="max_allocation" value={form.max_allocation} onChange={handleChange} placeholder="e.g. 500000" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-emerald-600 focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider">Min Ticket Size ($)</label>
                        <input type="number" name="min_ticket" value={form.min_ticket} onChange={handleChange} placeholder="e.g. 25000" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider">Max Valuation Cap ($)</label>
                        <input type="number" name="max_valuation" value={form.max_valuation} onChange={handleChange} placeholder="e.g. 10000000" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider">Instrument</label>
                        <select name="investment_type" value={form.investment_type} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]">
                            <option className="bg-[var(--primary)] text-[var(--secondary)]">Equity</option>
                            <option className="bg-[var(--primary)] text-[var(--secondary)]">Convertible Note</option>
                            <option className="bg-[var(--primary)] text-[var(--secondary)]">SAFE</option>
                            <option className="bg-[var(--primary)] text-[var(--secondary)]">Debt</option>
                            <option className="bg-[var(--primary)] text-[var(--secondary)]">Revenue Share</option>
                        </select>
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider">Min ARR Requirement ($)</label>
                        <input type="number" name="min_arr" value={form.min_arr} onChange={handleChange} placeholder="Optional" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider flex items-center gap-1"><Percent size={10} className="text-[var(--accent)]" /> Min ROI (%)</label>
                        <input type="number" step="0.1" name="min_roi" value={form.min_roi} onChange={handleChange} placeholder="e.g. 15" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider flex items-center gap-1"><Clock size={10} className="text-[var(--accent)]" /> Duration</label>
                        <input type="text" name="investment_duration" value={form.investment_duration} onChange={handleChange} placeholder="e.g. 3-5 Years" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner font-medium focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                </div>
            </div>

            {/* Section 4: Investor Value & Risk Profile */}
            <div className="neu-flat-base p-8 space-y-6">
                <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                    <Sparkles size={18} className="text-[var(--accent)]" /> Strategic Value & Requirements
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider">Strategic Value Add</label>
                        <textarea name="strategic_value_add" value={form.strategic_value_add} onChange={handleChange} rows={3} placeholder="Beyond capital, what do you offer? (Network, distribution, hiring, operational expertise)" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition resize-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider">Founder / Team Requirements</label>
                        <textarea name="founder_requirements" value={form.founder_requirements} onChange={handleChange} rows={3} placeholder="Specific demands for the founding team (e.g. technical founder required, full-time commitment)" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition resize-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider">Risk Tolerance & Dealbreakers</label>
                    <textarea name="risk_tolerance" value={form.risk_tolerance} onChange={handleChange} rows={2} placeholder="Hard passes, regulatory risks you avoid, or technical risks you are willing to underwrite." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition resize-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                </div>
            </div>

            {/* Section 5: Links & Portfolio */}
            <div className="neu-flat-base p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4">
                    <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                        <LinkIcon size={18} className="text-[var(--accent)]" /> Links & Portfolio
                    </h2>
                    <span className="text-[10px] font-bold text-[var(--secondary)]/50 uppercase tracking-wider">
                        Max 3 Portfolio Links
                    </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6 pb-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Fund / Firm Website</label>
                        <input type="url" name="website_url" value={form.website_url} onChange={handleChange} placeholder="https://..." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--accent)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">LinkedIn Profile</label>
                        <input type="url" name="linkedin_url" value={form.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/..." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--accent)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Past Investments / Portfolio Companies</label>
                    {portfolioLinks.map((link, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <input
                                type="url"
                                value={link}
                                onChange={(e) => handlePortfolioChange(index, e.target.value)}
                                placeholder="https://..."
                                className="w-full rounded-xl border-transparent bg-transparent px-4 py-3 text-sm text-[var(--accent)] font-bold placeholder-[var(--secondary)]/40 focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]"
                            />
                            {portfolioLinks.length > 1 && (
                                <button type="button" onClick={() => removePortfolioLink(index)} className="p-3 neu-btn text-rose-600 shrink-0">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}

                    {portfolioLinks.length < 3 && (
                        <button type="button" onClick={addPortfolioLink} className="flex items-center gap-2 text-xs font-bold text-[var(--secondary)] hover:text-[var(--accent)] transition bg-transparent p-2 rounded-lg">
                            <Plus size={14} /> Add Another Project Link
                        </button>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4 pb-12">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-4 text-sm neu-btn disabled:opacity-50">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {saving ? "Publishing..." : isTargeted ? "Submit Private Counter-Offer" : "Publish Investor Bid Deck"}
                </button>
            </div>
        </form>
    );
}

export default function BidDeckBuilder({ investorId }: BidDeckBuilderProps) {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-10"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>}>
            <BidDeckBuilderForm investorId={investorId} />
        </Suspense>
    );
}