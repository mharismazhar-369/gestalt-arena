"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Save, Loader2, AlertCircle, Target, Building, TrendingUp, Users, DollarSign, Activity, Link as LinkIcon, FileText } from "lucide-react";

interface PitchDeckBuilderProps {
    existingDeck?: any;
    userId: string;
    targetBidId?: string;
}

export default function PitchDeckBuilder({ existingDeck, userId, targetBidId }: PitchDeckBuilderProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Enhanced Form State
    const [formData, setFormData] = useState({
        title: existingDeck?.title || "",
        stage: existingDeck?.stage || "Pre-Seed",
        entity_type: existingDeck?.entity_type || "Startup",
        pitch_type: existingDeck?.pitch_type || "Product",
        elevator_pitch: existingDeck?.elevator_pitch || "",
        problem_statement: existingDeck?.problem_statement || "",
        target_customer: existingDeck?.target_customer || "",
        customer_segment: existingDeck?.customer_segment || "B2B",
        industry: existingDeck?.industry || "",
        solution: existingDeck?.solution || "",
        product_description: existingDeck?.product_description || "",
        product_status: existingDeck?.product_status || "Concept",
        key_features: existingDeck?.key_features || "",
        value_proposition: existingDeck?.value_proposition || "",
        market_size: existingDeck?.market_size || "",
        market_geography: existingDeck?.market_geography || "",
        go_to_market: existingDeck?.go_to_market || "",
        sales_channels: existingDeck?.sales_channels || "",
        business_model: existingDeck?.business_model || "",
        revenue_streams: existingDeck?.revenue_streams || "",
        pricing_model: existingDeck?.pricing_model || "",
        competitors: existingDeck?.competitors || "",
        competitive_advantage: existingDeck?.competitive_advantage || "",
        intellectual_property: existingDeck?.intellectual_property || "",
        traction: existingDeck?.traction || "",
        customer_count: existingDeck?.customer_count || "",
        revenue: existingDeck?.revenue || "",
        monthly_revenue: existingDeck?.monthly_revenue || "",
        growth_rate: existingDeck?.growth_rate || "",
        runway_months: existingDeck?.runway_months || "",
        funding_goal: existingDeck?.funding_goal || "",
        min_ticket: existingDeck?.min_ticket || "",
        valuation: existingDeck?.valuation || "",
        equity_offered: existingDeck?.equity_offered || "",
        investment_instrument: existingDeck?.investment_instrument || "Equity",
        use_of_funds: existingDeck?.use_of_funds || "",
        funding_milestones: existingDeck?.funding_milestones || "",
        team_summary: existingDeck?.team_summary || "",
        founder_background: existingDeck?.founder_background || "",
        risks: existingDeck?.risks || "",
        exit_strategy: existingDeck?.exit_strategy || "",
        ask_summary: existingDeck?.ask_summary || "",
        deck_url: existingDeck?.deck_url || "",
        demo_url: existingDeck?.demo_url || "",
        website_url: existingDeck?.website_url || "",
        video_url: existingDeck?.video_url || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let currentPitchId = existingDeck?.id;

        const payload = {
            user_id: userId,
            title: formData.title,
            stage: formData.stage,
            elevator_pitch: formData.elevator_pitch,
            problem_statement: formData.problem_statement,
            solution: formData.solution,
            market_size: formData.market_size,
            business_model: formData.business_model,
            competitors: formData.competitors,
            funding_goal: Number(formData.funding_goal) || 0,
            min_ticket: Number(formData.min_ticket) || 0,
            valuation: Number(formData.valuation) || 0,
            equity_offered: Number(formData.equity_offered) || 0,
            traction: formData.traction,
            revenue: Number(formData.revenue) || 0,
            runway_months: Number(formData.runway_months) || 0,
            use_of_funds: formData.use_of_funds,
            deck_url: formData.deck_url,
            target_bid_id: targetBidId || null,

            // Extended pitch intelligence
            entity_type: formData.entity_type,
            pitch_type: formData.pitch_type,
            target_customer: formData.target_customer,
            customer_segment: formData.customer_segment,
            industry: formData.industry,
            product_description: formData.product_description,
            product_status: formData.product_status,
            key_features: formData.key_features,
            value_proposition: formData.value_proposition,
            market_geography: formData.market_geography,
            go_to_market: formData.go_to_market,
            sales_channels: formData.sales_channels,
            revenue_streams: formData.revenue_streams,
            pricing_model: formData.pricing_model,
            competitive_advantage: formData.competitive_advantage,
            intellectual_property: formData.intellectual_property,
            customer_count: Number(formData.customer_count) || 0,
            monthly_revenue: Number(formData.monthly_revenue) || 0,
            growth_rate: Number(formData.growth_rate) || 0,
            investment_instrument: formData.investment_instrument,
            funding_milestones: formData.funding_milestones,
            team_summary: formData.team_summary,
            founder_background: formData.founder_background,
            risks: formData.risks,
            exit_strategy: formData.exit_strategy,
            ask_summary: formData.ask_summary,
            demo_url: formData.demo_url,
            website_url: formData.website_url,
            video_url: formData.video_url,
        };

        try {
            if (currentPitchId) {
                const { error: updateError } = await supabase.from("pitch_decks").update(payload).eq("id", currentPitchId);
                if (updateError) throw updateError;
            } else {
                const { data: newDeck, error: insertError } = await supabase.from("pitch_decks").insert(payload).select().single();
                if (insertError) throw insertError;
                currentPitchId = newDeck.id;
            }

            if (targetBidId && currentPitchId) {
                const { data: bidData, error: bidError } = await supabase.from("investor_bid_decks").select("investor_id").eq("id", targetBidId).single();
                if (bidError) throw bidError;

                if (bidData) {
                    // FIX: Extracting the new deal room ID directly
                    const { data: newDeal, error: dealError } = await supabase.from("deal_negotiations").insert({
                        startup_id: userId,
                        investor_id: bidData.investor_id,
                        pitch_deck_id: currentPitchId,
                        bid_deck_id: targetBidId,
                        status: "In Negotiations",
                    }).select().single();

                    if (dealError) throw dealError;

                    // FIX: Sending the specific Deal ID to the ledger
                    await supabase.from("notifications").insert({
                        user_id: bidData.investor_id,
                        actor_id: userId,
                        type: "deal_initiated",
                        message: "submitted a tailored pitch deck to your mandate.",
                        reference_id: newDeal.id,
                    });
                }
            }

            router.push("/startup/dashboard");
            router.refresh();
        } catch (err: any) {
            console.error("Submission Error:", err);
            setError(err?.message || "A database error occurred. Check the console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="neu-flat-base p-8 space-y-8">
            {targetBidId && (
                <div className="mb-8 flex items-center gap-4 neu-pressed-base border-transparent shadow-inner p-5 rounded-2xl">
                    <Target className="text-[var(--accent)] shrink-0" size={32} />
                    <div>
                        <h3 className="text-sm font-bold text-[var(--secondary)]">Targeted Mandate Application</h3>
                        <p className="text-xs text-[var(--secondary)]/70 font-medium">This saves the pitch and submits this version to the selected open mandate. Creating a normal pitch remains available independently.</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-600 neu-pressed-base border-transparent shadow-inner rounded-lg p-4">
                        <AlertCircle size={16} className="shrink-0" />
                        <span className="break-all">{error}</span>
                    </div>
                )}

                {/* Section 1: Overview */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Building size={18} className="text-[var(--accent)]" /> Core Overview
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Pitch Title</label>
                            <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Acme Corp Seed Round" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Startup Stage</label>
                            <select name="stage" value={formData.stage} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]">
                                <option className="bg-[var(--primary)]">Idea</option>
                                <option className="bg-[var(--primary)]">Pre-Seed</option>
                                <option className="bg-[var(--primary)]">Seed</option>
                                <option className="bg-[var(--primary)]">Series A</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Elevator Pitch (Short Summary)</label>
                        <textarea required name="elevator_pitch" value={formData.elevator_pitch} onChange={handleChange} rows={2} placeholder="In one sentence, what do you do?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]"></textarea>
                    </div>
                </div>


                {/* Section 1A: Identity & Offering */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <FileText size={18} className="text-[var(--accent)]" /> Offering Profile
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Entity Type</label>
                            <select name="entity_type" value={formData.entity_type} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]">
                                <option className="bg-[var(--primary)]">Startup</option>
                                <option className="bg-[var(--primary)]">Company</option>
                                <option className="bg-[var(--primary)]">Founder</option>
                                <option className="bg-[var(--primary)]">Project</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Pitch Type</label>
                            <select name="pitch_type" value={formData.pitch_type} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]">
                                <option className="bg-[var(--primary)]">Product</option>
                                <option className="bg-[var(--primary)]">Service</option>
                                <option className="bg-[var(--primary)]">Business</option>
                                <option className="bg-[var(--primary)]">Project</option>
                                <option className="bg-[var(--primary)]">Technology</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Customer Segment</label>
                            <select name="customer_segment" value={formData.customer_segment} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]">
                                <option className="bg-[var(--primary)]">B2B</option>
                                <option className="bg-[var(--primary)]">B2C</option>
                                <option className="bg-[var(--primary)]">B2B2C</option>
                                <option className="bg-[var(--primary)]">Government</option>
                                <option className="bg-[var(--primary)]">Enterprise</option>
                                <option className="bg-[var(--primary)]">Mixed</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Product Status</label>
                            <select name="product_status" value={formData.product_status} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]">
                                <option className="bg-[var(--primary)]">Concept</option>
                                <option className="bg-[var(--primary)]">Prototype</option>
                                <option className="bg-[var(--primary)]">MVP</option>
                                <option className="bg-[var(--primary)]">Live</option>
                                <option className="bg-[var(--primary)]">Scaling</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Target Customer</label>
                            <textarea name="target_customer" value={formData.target_customer} onChange={handleChange} rows={3} placeholder="Who specifically buys or uses this offering?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Industry / Sector</label>
                            <input name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g. FinTech, Water, Health, SaaS, Manufacturing" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Product / Service Description</label>
                            <textarea name="product_description" value={formData.product_description} onChange={handleChange} rows={4} placeholder="Describe exactly what is being offered, how it works, and what the customer receives." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Key Features / Deliverables</label>
                            <textarea name="key_features" value={formData.key_features} onChange={handleChange} rows={4} placeholder="List the core features, deliverables, specifications, or service components." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Core Value Proposition</label>
                        <textarea name="value_proposition" value={formData.value_proposition} onChange={handleChange} rows={3} placeholder="Why should a customer or investor choose this over existing alternatives?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                </div>

                {/* Section 1B: Market & Commercial Strategy */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Target size={18} className="text-[var(--accent)]" /> Market & Commercial Strategy
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Market Geography</label>
                            <input name="market_geography" value={formData.market_geography} onChange={handleChange} placeholder="Countries, cities, regions, or markets served" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Go-to-Market Strategy</label>
                            <textarea name="go_to_market" value={formData.go_to_market} onChange={handleChange} rows={2} placeholder="How will you acquire customers and scale distribution?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Sales Channels</label>
                            <input name="sales_channels" value={formData.sales_channels} onChange={handleChange} placeholder="Direct sales, online, partners, distributors, tenders, etc." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Pricing Model</label>
                            <select name="pricing_model" value={formData.pricing_model} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]">
                                <option value="">Select pricing model</option>
                                <option className="bg-[var(--primary)]">Subscription</option>
                                <option className="bg-[var(--primary)]">One-time Sale</option>
                                <option className="bg-[var(--primary)]">Usage-based</option>
                                <option className="bg-[var(--primary)]">Commission</option>
                                <option className="bg-[var(--primary)]">Licensing</option>
                                <option className="bg-[var(--primary)]">Retainer</option>
                                <option className="bg-[var(--primary)]">Project-based</option>
                                <option className="bg-[var(--primary)]">Hybrid</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Revenue Streams</label>
                        <textarea name="revenue_streams" value={formData.revenue_streams} onChange={handleChange} rows={3} placeholder="Break down primary and secondary revenue sources." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                </div>

                {/* Section 1C: Defensibility */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Activity size={18} className="text-[var(--accent)]" /> Competitive Position & Defensibility
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Competitive Advantage / Moat</label>
                            <textarea name="competitive_advantage" value={formData.competitive_advantage} onChange={handleChange} rows={3} placeholder="Technology, cost, distribution, data, brand, network effects, expertise, contracts, etc." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Intellectual Property</label>
                            <textarea name="intellectual_property" value={formData.intellectual_property} onChange={handleChange} rows={3} placeholder="Patents, trademarks, proprietary technology, trade secrets, software, or other IP." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                    </div>
                </div>

                {/* Section 2: The Business Case */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Target size={18} className="text-[var(--accent)]" /> Business Case
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Problem Statement</label>
                            <textarea required name="problem_statement" value={formData.problem_statement} onChange={handleChange} rows={3} placeholder="What critical problem are you solving?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]"></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Your Solution</label>
                            <textarea required name="solution" value={formData.solution} onChange={handleChange} rows={3} placeholder="How does your product solve this uniquely?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]"></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Market Size (TAM/SAM/SOM)</label>
                            <textarea name="market_size" value={formData.market_size} onChange={handleChange} rows={3} placeholder="Provide data on your target market..." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]"></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Business Model & Revenue Streams</label>
                            <textarea name="business_model" value={formData.business_model} onChange={handleChange} rows={3} placeholder="How do you make money?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]"></textarea>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Competitive Landscape</label>
                        <input type="text" name="competitors" value={formData.competitors} onChange={handleChange} placeholder="Who are your main competitors? What is your moat?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                </div>

                {/* Section 3: Financials & Metrics */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <TrendingUp size={18} className="text-emerald-600" /> Financials & Metrics
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider flex items-center gap-1"><DollarSign size={10} className="text-emerald-600" /> Target Raise</label>
                            <input required type="number" name="funding_goal" value={formData.funding_goal} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-emerald-600 focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider flex items-center gap-1"><DollarSign size={10} className="text-[var(--accent)]" /> Min Ticket Size</label>
                            <input type="number" name="min_ticket" value={formData.min_ticket} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider flex items-center gap-1"><Activity size={10} className="text-[var(--accent)]" /> Valuation (Cap)</label>
                            <input type="number" name="valuation" value={formData.valuation} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider flex items-center gap-1"><Users size={10} className="text-[var(--accent)]" /> Equity Offered (%)</label>
                            <input type="number" step="0.1" name="equity_offered" value={formData.equity_offered} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Current Revenue/ARR</label>
                            <input type="number" name="revenue" value={formData.revenue} onChange={handleChange} placeholder="Optional" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Runway (Months)</label>
                            <input type="number" name="runway_months" value={formData.runway_months} onChange={handleChange} placeholder="Optional" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Customers / Users</label>
                            <input type="number" name="customer_count" value={formData.customer_count} onChange={handleChange} placeholder="Optional" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Monthly Revenue</label>
                            <input type="number" name="monthly_revenue" value={formData.monthly_revenue} onChange={handleChange} placeholder="Optional" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Growth Rate (%)</label>
                            <input type="number" step="0.1" name="growth_rate" value={formData.growth_rate} onChange={handleChange} placeholder="Optional" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Investment Instrument</label>
                            <select name="investment_instrument" value={formData.investment_instrument} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]">
                                <option className="bg-[var(--primary)]">Equity</option>
                                <option className="bg-[var(--primary)]">SAFE</option>
                                <option className="bg-[var(--primary)]">Convertible Note</option>
                                <option className="bg-[var(--primary)]">Debt</option>
                                <option className="bg-[var(--primary)]">Revenue Share</option>
                                <option className="bg-[var(--primary)]">Strategic Investment</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Current Traction / Milestones</label>
                            <textarea name="traction" value={formData.traction} onChange={handleChange} rows={3} placeholder="Key achievements to date..." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]"></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Use of Funds</label>
                            <textarea name="use_of_funds" value={formData.use_of_funds} onChange={handleChange} rows={3} placeholder="How will you spend the raised capital?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]"></textarea>
                        </div>
                    </div>
                </div>


                {/* Section 3A: Execution, Team & Risk */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Users size={18} className="text-[var(--accent)]" /> Team, Execution & Risk
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Team Summary</label>
                            <textarea name="team_summary" value={formData.team_summary} onChange={handleChange} rows={4} placeholder="Who is executing the business and what are their relevant capabilities?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Founder / Management Background</label>
                            <textarea name="founder_background" value={formData.founder_background} onChange={handleChange} rows={4} placeholder="Relevant experience, previous ventures, domain expertise, achievements." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Key Risks & Mitigation</label>
                            <textarea name="risks" value={formData.risks} onChange={handleChange} rows={4} placeholder="Material commercial, technical, regulatory, operational, or funding risks and how they are addressed." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Exit / Strategic Outcome</label>
                            <textarea name="exit_strategy" value={formData.exit_strategy} onChange={handleChange} rows={4} placeholder="Expected strategic outcome, acquisition potential, long-term ownership plan, or other investor liquidity path." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Funding Milestones</label>
                        <textarea name="funding_milestones" value={formData.funding_milestones} onChange={handleChange} rows={3} placeholder="What measurable milestones will this capital achieve, and by when?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Investment Ask Summary</label>
                        <textarea name="ask_summary" value={formData.ask_summary} onChange={handleChange} rows={3} placeholder="State the exact ask, preferred structure, strategic value sought, and what the investor receives." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                </div>

                {/* Section 4: Attachments */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <LinkIcon size={18} className="text-[var(--accent)]" /> Media & Attachments
                    </h2>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Full Pitch Deck URL (PDF/DocSend/Google Slides)</label>
                        <input type="url" name="deck_url" value={formData.deck_url} onChange={handleChange} placeholder="https://..." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--accent)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Website</label>
                            <input type="url" name="website_url" value={formData.website_url} onChange={handleChange} placeholder="https://..." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--accent)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Product Demo</label>
                            <input type="url" name="demo_url" value={formData.demo_url} onChange={handleChange} placeholder="https://..." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--accent)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Pitch / Demo Video</label>
                            <input type="url" name="video_url" value={formData.video_url} onChange={handleChange} placeholder="https://..." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--accent)] focus:outline-none neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-[var(--secondary)]/10 flex justify-end">
                    <button disabled={loading} type="submit" className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl neu-btn text-sm disabled:opacity-50">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {targetBidId ? "Save Pitch & Submit Application" : "Save Pitch Deck"}
                    </button>
                </div>
            </form>
        </div>
    );
}