import React from "react";
import { createClient } from "@/lib/supabase/server";
import {
    Target,
    Wallet,
    TrendingUp,
    Users,
    Activity,
    Calendar,
    Lightbulb,
    CheckCircle2,
    Globe,
    Briefcase,
    Eye,
    Star,
    Presentation,
    Lock,
    Building,
    Package,
    MapPin,
    ShoppingCart,
    ShieldCheck,
    UsersRound,
    AlertTriangle,
    Link as LinkIcon,
    PlayCircle,
    ExternalLink,
    BadgeDollarSign,
} from "lucide-react";
import EmbeddedInvestorActions from "./EmbeddedInvestorActions";

export default async function PitchDeckViewer({ pitchId }: { pitchId: string }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 1. Fetch Pitch Deck & Founder Profile
    const { data: pitchDeck, error } = await supabase
        .from("pitch_decks")
        .select(`*, profiles:user_id (company_name, nickname)`)
        .eq("id", pitchId)
        .single();

    if (error || !pitchDeck) {
        return (
            <div className="neu-pressed-base border-transparent shadow-inner p-6 text-center text-rose-600 text-sm font-bold">
                Pitch deck data could not be retrieved.
            </div>
        );
    }

    const isOwner = user?.id === pitchDeck.user_id;
    const isDealClosed = pitchDeck.status === "Accepted";

    // 2. Track View
    if (user && !isOwner) {
        await supabase.from("pitch_deck_views").insert({
            pitch_deck_id: pitchId,
            viewer_id: user.id,
        });
    }

    // 3. Aggregate Views & Ratings
    const { count: viewCount } = await supabase
        .from("pitch_deck_views")
        .select("*", { count: "exact", head: true })
        .eq("pitch_deck_id", pitchId);

    const { data: ratingsData } = await supabase
        .from("deck_ratings")
        .select("score")
        .eq("deck_id", pitchId);

    let avgRating = 0;

    if (ratingsData && ratingsData.length > 0) {
        const sum = ratingsData.reduce(
            (acc, curr) => acc + curr.score,
            0
        );

        avgRating = Number((sum / ratingsData.length).toFixed(1));
    }

    // 4. Formatting Helpers
    const money = (value: any, fallback = "TBD") =>
        value !== null &&
            value !== undefined &&
            value !== "" &&
            Number(value) > 0
            ? `$${Number(value).toLocaleString()}`
            : fallback;

    const textValue = (value: any, fallback = "Not provided.") =>
        value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
            ? value
            : fallback;

    const fundingGoal = money(pitchDeck.funding_goal);
    const minTicket = money(pitchDeck.min_ticket, "Flexible");
    const valuation = money(pitchDeck.valuation);
    const revenue = money(pitchDeck.revenue, "$0");

    const customerCount =
        pitchDeck.customer_count !== null &&
            pitchDeck.customer_count !== undefined &&
            Number(pitchDeck.customer_count) > 0
            ? Number(pitchDeck.customer_count).toLocaleString()
            : "N/A";

    const monthlyRevenue = money(
        pitchDeck.monthly_revenue,
        "N/A"
    );

    const growthRate =
        pitchDeck.growth_rate !== null &&
            pitchDeck.growth_rate !== undefined &&
            Number(pitchDeck.growth_rate) > 0
            ? `${pitchDeck.growth_rate}%`
            : "N/A";

    const runway =
        pitchDeck.runway_months !== null &&
            pitchDeck.runway_months !== undefined &&
            Number(pitchDeck.runway_months) > 0
            ? `${pitchDeck.runway_months} Mo`
            : "N/A";

    return (
        <div className="space-y-6 w-full text-[var(--secondary)]">

            {/* =========================================================
                MASTER HEADER
            ========================================================= */}
            <div className="neu-flat-base p-8 relative overflow-hidden group">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">

                    <div className="space-y-4 max-w-3xl">

                        <div className="flex items-center gap-3 flex-wrap">

                            <span className="neu-pressed-base border-transparent shadow-inner px-3 py-1 rounded-full text-[10px] font-bold uppercase text-[var(--accent)]">
                                {pitchDeck.stage || "Pre-Seed"} Round
                            </span>

                            {pitchDeck.entity_type && (
                                <span className="neu-pressed-base border-transparent shadow-inner px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                    {pitchDeck.entity_type}
                                </span>
                            )}

                            {pitchDeck.pitch_type && (
                                <span className="neu-pressed-base border-transparent shadow-inner px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                    {pitchDeck.pitch_type}
                                </span>
                            )}

                            {pitchDeck.product_status && (
                                <span className="neu-pressed-base border-transparent shadow-inner px-3 py-1 rounded-full text-[10px] font-bold uppercase text-[var(--accent)]">
                                    {pitchDeck.product_status}
                                </span>
                            )}

                            {isDealClosed && (
                                <span className="flex items-center gap-1 bg-rose-500/10 text-rose-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    <Lock size={12} />
                                    Deal Closed
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-[var(--secondary)] leading-tight">
                            {pitchDeck.title || "Untitled Pitch"}
                        </h1>

                        <p className="text-sm text-[var(--secondary)]/80 font-medium italic border-l-4 border-[var(--accent)] pl-4 py-1">
                            {pitchDeck.elevator_pitch ||
                                "No elevator pitch provided."}
                        </p>

                        {(pitchDeck.industry ||
                            pitchDeck.customer_segment ||
                            pitchDeck.market_geography) && (
                                <div className="flex flex-wrap gap-3 pt-2">

                                    {pitchDeck.industry && (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--secondary)]/70">
                                            <Briefcase
                                                size={13}
                                                className="text-[var(--accent)]"
                                            />
                                            {pitchDeck.industry}
                                        </span>
                                    )}

                                    {pitchDeck.customer_segment && (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--secondary)]/70">
                                            <Users
                                                size={13}
                                                className="text-[var(--accent)]"
                                            />
                                            {pitchDeck.customer_segment}
                                        </span>
                                    )}

                                    {pitchDeck.market_geography && (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--secondary)]/70">
                                            <MapPin
                                                size={13}
                                                className="text-[var(--accent)]"
                                            />
                                            {pitchDeck.market_geography}
                                        </span>
                                    )}
                                </div>
                            )}
                    </div>

                    <div className="flex gap-6 neu-pressed-base border-transparent shadow-inner p-4 rounded-2xl shrink-0">

                        <div className="flex flex-col items-center justify-center space-y-1">
                            <div className="flex items-center gap-1.5 text-[var(--accent)]">
                                <Eye size={18} />
                                <span className="text-lg font-bold">
                                    {viewCount || 0}
                                </span>
                            </div>

                            <span className="text-[10px] text-[var(--secondary)]/50 uppercase tracking-wider font-bold">
                                Total Views
                            </span>
                        </div>

                        <div className="w-px bg-[var(--secondary)]/10" />

                        <div className="flex flex-col items-center justify-center space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-500">
                                <Star
                                    size={18}
                                    fill="currentColor"
                                />

                                <span className="text-lg font-bold">
                                    {avgRating}
                                </span>
                            </div>

                            <span className="text-[10px] text-[var(--secondary)]/50 uppercase tracking-wider font-bold">
                                Ratings
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================================================
                FINANCIALS & METRICS
            ========================================================= */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

                <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
                    <Target
                        className="text-emerald-600 mb-1"
                        size={16}
                    />
                    <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">
                        Raise Target
                    </p>
                    <p className="text-base font-bold">
                        {fundingGoal}
                    </p>
                </div>

                <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
                    <Wallet
                        className="text-[var(--accent)] mb-1"
                        size={16}
                    />
                    <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">
                        Min Ticket
                    </p>
                    <p className="text-base font-bold">
                        {minTicket}
                    </p>
                </div>

                <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
                    <TrendingUp
                        className="text-[var(--accent)] mb-1"
                        size={16}
                    />
                    <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">
                        Valuation Cap
                    </p>
                    <p className="text-base font-bold">
                        {valuation}
                    </p>
                </div>

                <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
                    <Users
                        className="text-[var(--accent)] mb-1"
                        size={16}
                    />
                    <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">
                        Equity Offered
                    </p>
                    <p className="text-base font-bold">
                        {pitchDeck.equity_offered
                            ? `${pitchDeck.equity_offered}%`
                            : "TBD"}
                    </p>
                </div>

                <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
                    <Activity
                        className="text-emerald-600 mb-1"
                        size={16}
                    />
                    <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">
                        Current ARR
                    </p>
                    <p className="text-base font-bold">
                        {revenue}
                    </p>
                </div>

                <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
                    <Calendar
                        className="text-[var(--accent)] mb-1"
                        size={16}
                    />
                    <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">
                        Runway
                    </p>
                    <p className="text-base font-bold">
                        {runway}
                    </p>
                </div>
            </div>

            {/* =========================================================
                BUSINESS IDENTITY / OFFERING
            ========================================================= */}
            <div className="neu-flat-base p-6 space-y-6">

                <h2 className="text-sm font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                    <Building
                        size={16}
                        className="text-[var(--accent)]"
                    />
                    Offering Profile
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

                    <div className="neu-pressed-base p-4 rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                            Entity Type
                        </p>
                        <p className="text-sm font-bold mt-1">
                            {textValue(
                                pitchDeck.entity_type,
                                "Startup"
                            )}
                        </p>
                    </div>

                    <div className="neu-pressed-base p-4 rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                            Pitch Type
                        </p>
                        <p className="text-sm font-bold mt-1">
                            {textValue(
                                pitchDeck.pitch_type,
                                "Product"
                            )}
                        </p>
                    </div>

                    <div className="neu-pressed-base p-4 rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                            Customer Segment
                        </p>
                        <p className="text-sm font-bold mt-1">
                            {textValue(
                                pitchDeck.customer_segment,
                                "Not specified"
                            )}
                        </p>
                    </div>

                    <div className="neu-pressed-base p-4 rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                            Product Status
                        </p>
                        <p className="text-sm font-bold mt-1">
                            {textValue(
                                pitchDeck.product_status,
                                "Concept"
                            )}
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <UsersRound
                                size={14}
                                className="text-[var(--accent)]"
                            />
                            Target Customer
                        </h3>

                        <p className="text-sm text-[var(--secondary)]/80 leading-relaxed whitespace-pre-line">
                            {textValue(
                                pitchDeck.target_customer
                            )}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <Briefcase
                                size={14}
                                className="text-[var(--accent)]"
                            />
                            Industry / Sector
                        </h3>

                        <p className="text-sm text-[var(--secondary)]/80 leading-relaxed whitespace-pre-line">
                            {textValue(
                                pitchDeck.industry
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* =========================================================
                PRODUCT / SERVICE
            ========================================================= */}
            <div className="grid md:grid-cols-2 gap-6">

                <div className="neu-flat-base p-6 space-y-4">
                    <h2 className="text-sm font-bold flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Package
                            size={16}
                            className="text-[var(--accent)]"
                        />
                        Product / Service
                    </h2>

                    <p className="text-sm text-[var(--secondary)]/80 leading-relaxed whitespace-pre-line">
                        {textValue(
                            pitchDeck.product_description
                        )}
                    </p>
                </div>

                <div className="neu-flat-base p-6 space-y-4">
                    <h2 className="text-sm font-bold flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <CheckCircle2
                            size={16}
                            className="text-emerald-600"
                        />
                        Key Features / Deliverables
                    </h2>

                    <p className="text-sm text-[var(--secondary)]/80 leading-relaxed whitespace-pre-line">
                        {textValue(
                            pitchDeck.key_features
                        )}
                    </p>
                </div>

                <div className="neu-flat-base p-6 space-y-4 md:col-span-2">
                    <h2 className="text-sm font-bold flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Lightbulb
                            size={16}
                            className="text-[var(--accent)]"
                        />
                        Core Value Proposition
                    </h2>

                    <p className="text-sm text-[var(--secondary)]/80 leading-relaxed whitespace-pre-line">
                        {textValue(
                            pitchDeck.value_proposition
                        )}
                    </p>
                </div>
            </div>

            {/* =========================================================
                BUSINESS CASE
            ========================================================= */}
            <div className="grid md:grid-cols-2 gap-6">

                <div className="neu-flat-base p-6 space-y-4">
                    <h2 className="text-sm font-bold flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Lightbulb
                            size={16}
                            className="text-[var(--accent)]"
                        />
                        Problem Statement
                    </h2>

                    <p className="text-sm text-[var(--secondary)]/80 leading-relaxed whitespace-pre-line">
                        {textValue(
                            pitchDeck.problem_statement
                        )}
                    </p>
                </div>

                <div className="neu-flat-base p-6 space-y-4">
                    <h2 className="text-sm font-bold flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <CheckCircle2
                            size={16}
                            className="text-emerald-600"
                        />
                        The Solution
                    </h2>

                    <p className="text-sm text-[var(--secondary)]/80 leading-relaxed whitespace-pre-line">
                        {textValue(
                            pitchDeck.solution
                        )}
                    </p>
                </div>

                <div className="neu-flat-base p-6 space-y-4">
                    <h2 className="text-sm font-bold flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Globe
                            size={16}
                            className="text-[var(--accent)]"
                        />
                        Market Size
                    </h2>

                    <p className="text-sm text-[var(--secondary)]/80 leading-relaxed whitespace-pre-line">
                        {textValue(
                            pitchDeck.market_size
                        )}
                    </p>
                </div>

                <div className="neu-flat-base p-6 space-y-4">
                    <h2 className="text-sm font-bold flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Briefcase
                            size={16}
                            className="text-[var(--accent)]"
                        />
                        Business Model
                    </h2>

                    <p className="text-sm text-[var(--secondary)]/80 leading-relaxed whitespace-pre-line">
                        {textValue(
                            pitchDeck.business_model
                        )}
                    </p>
                </div>
            </div>

            {/* =========================================================
                MARKET & COMMERCIAL STRATEGY
            ========================================================= */}
            <div className="neu-flat-base p-6 space-y-6">

                <h2 className="text-sm font-bold flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                    <ShoppingCart
                        size={16}
                        className="text-[var(--accent)]"
                    />
                    Market & Commercial Strategy
                </h2>

                <div className="grid md:grid-cols-2 gap-6">

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <MapPin
                                size={14}
                                className="text-[var(--accent)]"
                            />
                            Market Geography
                        </h3>

                        <p className="text-sm leading-relaxed whitespace-pre-line">
                            {textValue(
                                pitchDeck.market_geography
                            )}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                            Go-to-Market Strategy
                        </h3>

                        <p className="text-sm leading-relaxed whitespace-pre-line">
                            {textValue(
                                pitchDeck.go_to_market
                            )}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                            Sales Channels
                        </h3>

                        <p className="text-sm leading-relaxed whitespace-pre-line">
                            {textValue(
                                pitchDeck.sales_channels
                            )}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                            Pricing Model
                        </h3>

                        <p className="text-sm font-bold">
                            {textValue(
                                pitchDeck.pricing_model,
                                "Not specified"
                            )}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                        Revenue Streams
                    </h3>

                    <p className="text-sm leading-relaxed whitespace-pre-line">
                        {textValue(
                            pitchDeck.revenue_streams
                        )}
                    </p>
                </div>
            </div>

            {/* =========================================================
                COMPETITIVE POSITION
            ========================================================= */}
            <div className="neu-flat-base p-6 space-y-6">

                <h2 className="text-sm font-bold flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                    <ShieldCheck
                        size={16}
                        className="text-[var(--accent)]"
                    />
                    Competitive Position & Defensibility
                </h2>

                <div className="grid md:grid-cols-2 gap-6">

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                            Competitive Landscape
                        </h3>

                        <p className="text-sm leading-relaxed whitespace-pre-line">
                            {textValue(
                                pitchDeck.competitors
                            )}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                            Competitive Advantage / Moat
                        </h3>

                        <p className="text-sm leading-relaxed whitespace-pre-line">
                            {textValue(
                                pitchDeck.competitive_advantage
                            )}
                        </p>
                    </div>

                    <div className="space-y-3 md:col-span-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                            Intellectual Property
                        </h3>

                        <p className="text-sm leading-relaxed whitespace-pre-line">
                            {textValue(
                                pitchDeck.intellectual_property
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* =========================================================
                TRACTION & OPERATING METRICS
            ========================================================= */}
            <div className="neu-flat-base p-6 space-y-6">

                <h2 className="text-sm font-bold flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                    <TrendingUp
                        size={16}
                        className="text-emerald-600"
                    />
                    Traction & Operating Metrics
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    <div className="neu-pressed-base p-5 rounded-xl text-center">
                        <Users
                            size={16}
                            className="mx-auto mb-2 text-[var(--accent)]"
                        />
                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                            Customers / Users
                        </p>
                        <p className="text-lg font-bold mt-1">
                            {customerCount}
                        </p>
                    </div>

                    <div className="neu-pressed-base p-5 rounded-xl text-center">
                        <Wallet
                            size={16}
                            className="mx-auto mb-2 text-[var(--accent)]"
                        />
                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                            Monthly Revenue
                        </p>
                        <p className="text-lg font-bold mt-1">
                            {monthlyRevenue}
                        </p>
                    </div>

                    <div className="neu-pressed-base p-5 rounded-xl text-center">
                        <TrendingUp
                            size={16}
                            className="mx-auto mb-2 text-emerald-600"
                        />
                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                            Growth Rate
                        </p>
                        <p className="text-lg font-bold mt-1">
                            {growthRate}
                        </p>
                    </div>

                    <div className="neu-pressed-base p-5 rounded-xl text-center">
                        <Activity
                            size={16}
                            className="mx-auto mb-2 text-[var(--accent)]"
                        />
                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                            Current ARR
                        </p>
                        <p className="text-lg font-bold mt-1">
                            {revenue}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                        Current Traction / Milestones
                    </h3>

                    <p className="text-sm leading-relaxed whitespace-pre-line">
                        {textValue(
                            pitchDeck.traction
                        )}
                    </p>
                </div>
            </div>

            {/* =========================================================
                INVESTMENT STRUCTURE
            ========================================================= */}
            <div className="neu-flat-base p-6 space-y-6">

                <h2 className="text-sm font-bold flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                    <BadgeDollarSign
                        size={16}
                        className="text-[var(--accent)]"
                    />
                    Investment Structure & Funding Plan
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

                    <div className="neu-pressed-base p-4 rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                            Instrument
                        </p>
                        <p className="text-sm font-bold mt-1">
                            {textValue(
                                pitchDeck.investment_instrument,
                                "Equity"
                            )}
                        </p>
                    </div>

                    <div className="neu-pressed-base p-4 rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                            Target Raise
                        </p>
                        <p className="text-sm font-bold mt-1">
                            {fundingGoal}
                        </p>
                    </div>

                    <div className="neu-pressed-base p-4 rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                            Valuation
                        </p>
                        <p className="text-sm font-bold mt-1">
                            {valuation}
                        </p>
                    </div>

                    <div className="neu-pressed-base p-4 rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                            Equity
                        </p>
                        <p className="text-sm font-bold mt-1">
                            {pitchDeck.equity_offered
                                ? `${pitchDeck.equity_offered}%`
                                : "TBD"}
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                            Use of Funds
                        </h3>

                        <p className="text-sm leading-relaxed whitespace-pre-line">
                            {textValue(
                                pitchDeck.use_of_funds
                            )}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                            Funding Milestones
                        </h3>

                        <p className="text-sm leading-relaxed whitespace-pre-line">
                            {textValue(
                                pitchDeck.funding_milestones
                            )}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                        Investment Ask
                    </h3>

                    <p className="text-sm leading-relaxed whitespace-pre-line">
                        {textValue(
                            pitchDeck.ask_summary
                        )}
                    </p>
                </div>
            </div>

            {/* =========================================================
                TEAM & MANAGEMENT
            ========================================================= */}
            <div className="neu-flat-base p-6 space-y-6">

                <h2 className="text-sm font-bold flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                    <UsersRound
                        size={16}
                        className="text-[var(--accent)]"
                    />
                    Team & Management
                </h2>

                <div className="grid md:grid-cols-2 gap-6">

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                            Team Summary
                        </h3>

                        <p className="text-sm leading-relaxed whitespace-pre-line">
                            {textValue(
                                pitchDeck.team_summary
                            )}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                            Founder / Management Background
                        </h3>

                        <p className="text-sm leading-relaxed whitespace-pre-line">
                            {textValue(
                                pitchDeck.founder_background
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* =========================================================
                RISK & STRATEGIC OUTCOME
            ========================================================= */}
            <div className="grid md:grid-cols-2 gap-6">

                <div className="neu-flat-base p-6 space-y-4">
                    <h2 className="text-sm font-bold flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <AlertTriangle
                            size={16}
                            className="text-[var(--accent)]"
                        />
                        Key Risks & Mitigation
                    </h2>

                    <p className="text-sm leading-relaxed whitespace-pre-line">
                        {textValue(
                            pitchDeck.risks
                        )}
                    </p>
                </div>

                <div className="neu-flat-base p-6 space-y-4">
                    <h2 className="text-sm font-bold flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Target
                            size={16}
                            className="text-[var(--accent)]"
                        />
                        Exit / Strategic Outcome
                    </h2>

                    <p className="text-sm leading-relaxed whitespace-pre-line">
                        {textValue(
                            pitchDeck.exit_strategy
                        )}
                    </p>
                </div>
            </div>

            {/* =========================================================
                EXTERNAL DOCUMENTS & MEDIA
            ========================================================= */}
            {(pitchDeck.deck_url ||
                pitchDeck.website_url ||
                pitchDeck.demo_url ||
                pitchDeck.video_url) && (

                    <div className="neu-flat-base p-6 space-y-6">

                        <h2 className="text-sm font-bold flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                            <LinkIcon
                                size={16}
                                className="text-[var(--accent)]"
                            />
                            Documents & Media
                        </h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

                            {pitchDeck.website_url && (
                                <a
                                    href={pitchDeck.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="neu-pressed-base p-5 rounded-xl flex items-center gap-3 hover:scale-[1.01] transition"
                                >
                                    <Globe
                                        size={20}
                                        className="text-[var(--accent)] shrink-0"
                                    />

                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                                            Website
                                        </p>

                                        <p className="text-sm font-bold truncate">
                                            Open Website
                                        </p>
                                    </div>

                                    <ExternalLink
                                        size={14}
                                        className="ml-auto shrink-0"
                                    />
                                </a>
                            )}

                            {pitchDeck.demo_url && (
                                <a
                                    href={pitchDeck.demo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="neu-pressed-base p-5 rounded-xl flex items-center gap-3 hover:scale-[1.01] transition"
                                >
                                    <PlayCircle
                                        size={20}
                                        className="text-[var(--accent)] shrink-0"
                                    />

                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                                            Product Demo
                                        </p>

                                        <p className="text-sm font-bold truncate">
                                            View Demo
                                        </p>
                                    </div>

                                    <ExternalLink
                                        size={14}
                                        className="ml-auto shrink-0"
                                    />
                                </a>
                            )}

                            {pitchDeck.video_url && (
                                <a
                                    href={pitchDeck.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="neu-pressed-base p-5 rounded-xl flex items-center gap-3 hover:scale-[1.01] transition"
                                >
                                    <PlayCircle
                                        size={20}
                                        className="text-[var(--accent)] shrink-0"
                                    />

                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                                            Pitch / Demo Video
                                        </p>

                                        <p className="text-sm font-bold truncate">
                                            Watch Video
                                        </p>
                                    </div>

                                    <ExternalLink
                                        size={14}
                                        className="ml-auto shrink-0"
                                    />
                                </a>
                            )}

                            {pitchDeck.deck_url && (
                                <a
                                    href={pitchDeck.deck_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="neu-pressed-base p-5 rounded-xl flex items-center gap-3 hover:scale-[1.01] transition"
                                >
                                    <Presentation
                                        size={20}
                                        className="text-[var(--accent)] shrink-0"
                                    />

                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50">
                                            Full Pitch Deck
                                        </p>

                                        <p className="text-sm font-bold truncate">
                                            View External Deck
                                        </p>
                                    </div>

                                    <ExternalLink
                                        size={14}
                                        className="ml-auto shrink-0"
                                    />
                                </a>
                            )}
                        </div>
                    </div>
                )}

            {/* =========================================================
                EMBEDDED ACTION SYSTEM
            ========================================================= */}
            {user && !isOwner && (
                isDealClosed ? (
                    <div className="neu-flat-base p-8 text-center space-y-3 bg-rose-500/5 mt-8 border border-rose-500/20">

                        <Lock
                            size={32}
                            className="mx-auto text-rose-600"
                        />

                        <h3 className="text-lg font-black text-rose-600">
                            Deal Closed
                        </h3>

                        <p className="text-sm font-medium text-[var(--secondary)]/70 max-w-md mx-auto">
                            This pitch deck has successfully closed
                            its funding round and is no longer accepting
                            new bids, negotiations, or ratings.
                        </p>
                    </div>
                ) : (
                    <EmbeddedInvestorActions
                        pitchId={pitchDeck.id}
                        startupId={pitchDeck.user_id}
                        currentUserId={user.id}
                    />
                )
            )}
        </div>
    );
}