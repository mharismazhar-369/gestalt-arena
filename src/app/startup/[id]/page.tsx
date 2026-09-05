import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import EmbeddedInvestorActions from "@/components/pitch/EmbeddedInvestorActions";
import {
  Eye, Star, Target, TrendingUp, Users, Wallet, Presentation,
  Lightbulb, CheckCircle2, Globe, Briefcase, Swords, Activity,
  Edit3, Calendar
} from "lucide-react";

export default async function PitchDeckView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: pitchDeck, error } = await supabase
    .from("pitch_decks")
    .select(`
            *,
            author:user_id (nickname, company_name)
        `)
    .eq("id", id)
    .single();

  if (error || !pitchDeck) {
    return (
      <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold text-[var(--secondary)]">Pitch Deck Not Found</h1>
            <p className="text-[var(--secondary)]/60 font-medium">This deck may have been removed or set to private.</p>
            <Link href="/startup/dashboard" className="neu-btn px-6 py-2 mt-4 inline-block text-xs">Return to Dashboard</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwner = user.id === pitchDeck.user_id;

  // Financial Formatting
  const fundingGoal = pitchDeck.funding_goal ? `$${Number(pitchDeck.funding_goal).toLocaleString()}` : "TBD";
  const minTicket = pitchDeck.min_ticket ? `$${Number(pitchDeck.min_ticket).toLocaleString()}` : "Flexible";
  const valuation = pitchDeck.valuation ? `$${Number(pitchDeck.valuation).toLocaleString()}` : "TBD";
  const revenue = pitchDeck.revenue ? `$${Number(pitchDeck.revenue).toLocaleString()}` : "Pre-Revenue";

  // Analytics Fallbacks
  const totalViews = pitchDeck.views_count || 0;
  const avgRating = pitchDeck.average_rating || 0.0;

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-4 md:px-6 mx-auto max-w-6xl w-full relative z-10 space-y-8">

        {/* Master Header Card */}
        <div className="neu-flat-base p-8 md:p-12 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="neu-pressed-base border-transparent shadow-inner px-3 py-1 rounded-full text-[10px] font-bold uppercase text-[var(--accent)]">
                  {pitchDeck.stage || "Pre-Seed"} Round
                </span>
                {pitchDeck.target_bid_id && (
                  <span className="neu-pressed-base border-transparent shadow-inner px-3 py-1 rounded-full text-[10px] font-bold uppercase text-emerald-600">
                    Mandate Locked
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-[var(--secondary)] leading-tight">
                {pitchDeck.title || "Untitled Pitch"}
              </h1>
              <p className="text-lg text-[var(--secondary)]/80 font-medium italic border-l-4 border-[var(--accent)] pl-4 py-2">
                {pitchDeck.elevator_pitch || "No elevator pitch provided."}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {isOwner && (
                <Link href={`/startup/pitch/build?pitch_id=${pitchDeck.id}`} className="flex items-center justify-center gap-2 px-6 py-2 neu-btn text-xs w-full">
                  <Edit3 size={14} /> Edit Pitch Deck
                </Link>
              )}
              <div className="flex gap-6 neu-pressed-base border-transparent shadow-inner p-4 rounded-2xl">
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="flex items-center gap-1.5 text-[var(--accent)]">
                    <Eye size={20} />
                    <span className="text-xl font-bold">{totalViews}</span>
                  </div>
                  <span className="text-[10px] text-[var(--secondary)]/50 uppercase tracking-wider font-bold">Total Views</span>
                </div>
                <div className="w-px bg-[var(--secondary)]/10" />
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <Star size={20} fill="currentColor" />
                    <span className="text-xl font-bold">{avgRating}</span>
                  </div>
                  <span className="text-[10px] text-[var(--secondary)]/50 uppercase tracking-wider font-bold">Ratings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EMBEDDED INVESTOR ACTIONS (Replaces the annoying navbar) */}
        {!isOwner && (
          <EmbeddedInvestorActions
            pitchId={pitchDeck.id}
            startupId={pitchDeck.user_id}
            currentUserId={user.id}
          />
        )}

        {/* Financials & Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
            <Target className="text-emerald-600 mb-1" size={20} />
            <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">Raise Target</p>
            <p className="text-lg font-bold text-[var(--secondary)]">{fundingGoal}</p>
          </div>
          <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
            <Wallet className="text-[var(--accent)] mb-1" size={20} />
            <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">Min Ticket</p>
            <p className="text-lg font-bold text-[var(--secondary)]">{minTicket}</p>
          </div>
          <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
            <TrendingUp className="text-[var(--accent)] mb-1" size={20} />
            <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">Valuation Cap</p>
            <p className="text-lg font-bold text-[var(--secondary)]">{valuation}</p>
          </div>
          <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
            <Users className="text-[var(--accent)] mb-1" size={20} />
            <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">Equity Offered</p>
            <p className="text-lg font-bold text-[var(--secondary)]">{pitchDeck.equity_offered ? `${pitchDeck.equity_offered}%` : "TBD"}</p>
          </div>
          <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
            <Activity className="text-emerald-600 mb-1" size={20} />
            <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">Current ARR</p>
            <p className="text-lg font-bold text-[var(--secondary)]">{revenue}</p>
          </div>
          <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
            <Calendar className="text-[var(--accent)] mb-1" size={20} />
            <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">Runway</p>
            <p className="text-lg font-bold text-[var(--secondary)]">{pitchDeck.runway_months ? `${pitchDeck.runway_months} Mo` : "N/A"}</p>
          </div>
        </div>

        {/* The Business Case */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="neu-flat-base p-8 space-y-4">
            <h2 className="text-sm font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
              <Lightbulb size={16} className="text-[var(--accent)]" /> Problem Statement
            </h2>
            <p className="text-sm text-[var(--secondary)]/80 leading-relaxed font-medium whitespace-pre-line">
              {pitchDeck.problem_statement || "Not detailed."}
            </p>
          </div>

          <div className="neu-flat-base p-8 space-y-4">
            <h2 className="text-sm font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
              <CheckCircle2 size={16} className="text-emerald-600" /> The Solution
            </h2>
            <p className="text-sm text-[var(--secondary)]/80 leading-relaxed font-medium whitespace-pre-line">
              {pitchDeck.solution || "Not detailed."}
            </p>
          </div>

          <div className="neu-flat-base p-8 space-y-4">
            <h2 className="text-sm font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
              <Globe size={16} className="text-[var(--accent)]" /> Market Size
            </h2>
            <p className="text-sm text-[var(--secondary)]/80 leading-relaxed font-medium whitespace-pre-line">
              {pitchDeck.market_size || "Not detailed."}
            </p>
          </div>

          <div className="neu-flat-base p-8 space-y-4">
            <h2 className="text-sm font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
              <Briefcase size={16} className="text-[var(--accent)]" /> Business Model
            </h2>
            <p className="text-sm text-[var(--secondary)]/80 leading-relaxed font-medium whitespace-pre-line">
              {pitchDeck.business_model || "Not detailed."}
            </p>
          </div>
        </div>

        {/* Operations & Strategy */}
        <div className="neu-flat-base p-8 space-y-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-[var(--secondary)]/70 uppercase tracking-wider flex items-center gap-2">
                <Swords size={14} className="text-[var(--accent)]" /> Competitors
              </h2>
              <p className="text-sm text-[var(--secondary)] font-medium">
                {pitchDeck.competitors || "None listed."}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-[var(--secondary)]/70 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={14} className="text-[var(--accent)]" /> Traction & Milestones
              </h2>
              <p className="text-sm text-[var(--secondary)] font-medium">
                {pitchDeck.traction || "Early stage / Pre-traction."}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-[var(--secondary)]/70 uppercase tracking-wider flex items-center gap-2">
                <Target size={14} className="text-emerald-600" /> Use of Funds
              </h2>
              <p className="text-sm text-[var(--secondary)] font-medium">
                {pitchDeck.use_of_funds || "Not detailed."}
              </p>
            </div>
          </div>
        </div>

        {/* External Document Attachment */}
        <div className="neu-flat-base p-8 aspect-[21/9] md:aspect-[32/9] relative flex flex-col items-center justify-center space-y-4">
          {pitchDeck.deck_url ? (
            <>
              <div className="p-4 rounded-full neu-pressed-base border-transparent shadow-inner text-[var(--accent)]">
                <Presentation size={48} />
              </div>
              <a
                href={pitchDeck.deck_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 neu-btn text-xs font-bold"
              >
                View External Deck Document
              </a>
            </>
          ) : (
            <div className="text-center space-y-2">
              <Presentation size={32} className="mx-auto text-[var(--secondary)]/30" />
              <p className="text-[var(--secondary)]/50 font-medium text-sm">No external deck document attached.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}