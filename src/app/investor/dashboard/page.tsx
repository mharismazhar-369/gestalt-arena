export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import DeleteResourceButton from "@/components/shared/DeleteResourceButton";
import { Compass, Rocket, BookOpen, ShieldCheck, User, Sparkles, Settings, MapPin, DollarSign, Building2, Briefcase, Target, Plus, FileText, Eye, Folder, Radio, MessageSquare, Handshake, ChevronDown } from "lucide-react";
import InvestorProfileBuilder from "@/components/investor/InvestorProfileBuilder";

export default async function InvestorDashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role === "startup") redirect("/startup/dashboard");

  if (!profile?.profile_completed) {
    return (
      <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
        <Navbar />
        <main className="pt-32 pb-24 px-6 mx-auto max-w-3xl w-full relative z-10 space-y-10">
          <InvestorProfileBuilder profile={profile} />
        </main>
        <Footer />
      </div>
    );
  }

  // 1. Fetch Active Bid Decks (Mandates including targeted Private ones)
  const { data: bidDecks } = await supabase
    .from("investor_bid_decks")
    .select("*")
    .eq("investor_id", user.id)
    .order("created_at", { ascending: false });

  // 2. Fetch ALL Active Deal Negotiations (Include bid_deck_id for grouping)
  const { data: activeDeals } = await supabase
    .from("deal_negotiations")
    .select(`
            id, status, created_at, updated_at, bid_deck_id,
            startup:profiles!deal_negotiations_startup_id_fkey(company_name, nickname),
            pitch_decks(title)
        `)
    .eq("investor_id", user.id)
    .order("updated_at", { ascending: false });

  // Group deals by their parent mandate
  const dealsByMandate: Record<string, any[]> = {};
  const directDeals: any[] = []; // Deals without a mandate

  if (activeDeals) {
    activeDeals.forEach((deal) => {
      if (deal.bid_deck_id) {
        if (!dealsByMandate[deal.bid_deck_id]) dealsByMandate[deal.bid_deck_id] = [];
        dealsByMandate[deal.bid_deck_id].push(deal);
      } else {
        directDeals.push(deal);
      }
    });
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const displayName = profile?.nickname || profile?.company_name || user.email?.split("@")[0] || "Investor Partner";
  const displayLocation = profile?.city ? `${profile.city}, ${profile.country || ""}` : "Global Network";
  const displayTier = profile?.tier || "freemium";
  const totalMandates = bidDecks?.length || 0;
  const totalDeals = activeDeals?.length || 0;

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10 space-y-8">
        {/* Dynamic Header Banner */}
        <div className="neu-flat-base p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="absolute top-0 right-0 p-8 text-[var(--secondary)] opacity-5 pointer-events-none">
            <Compass size={220} />
          </div>

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="neu-pressed-base px-3 py-1 text-xs font-bold text-[var(--secondary)] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[var(--accent)]" /> Investor Portal
              </span>
              <BetaBadge variant="pill" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[var(--secondary)]">
              Welcome back, <span className="text-[var(--accent)] capitalize">{displayName}</span>
            </h1>
            <p className="text-[var(--secondary)]/70 text-sm leading-relaxed font-medium">
              Window-shop verified early-stage startups, track deal flows, and evaluate pitch cards across deep-tech, AI, and SaaS sectors.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-3 min-w-[200px]">
            <Link href="/dashboard/preferences" className="neu-btn flex items-center justify-center gap-2 w-full py-3 text-sm">
              <Settings size={16} /> Global Settings
            </Link>
            <div className="neu-btn"><LogoutButton /></div>
          </div>
        </div>

        {/* Live Database Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="neu-flat-base p-4 flex flex-col gap-1">
            <span className="text-[10px] text-[var(--secondary)]/60 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} className="text-[var(--accent)]" /> Membership Tier
            </span>
            <span className="text-lg font-black text-[var(--secondary)] capitalize">{displayTier}</span>
          </div>
          <div className="neu-flat-base p-4 flex flex-col gap-1">
            <span className="text-[10px] text-[var(--secondary)]/60 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={12} className="text-[var(--accent)]" /> Operating Region
            </span>
            <span className="text-lg font-black text-[var(--secondary)] truncate">{displayLocation}</span>
          </div>
          <div className="neu-flat-base p-4 flex flex-col gap-1">
            <span className="text-[10px] text-[var(--secondary)]/60 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={12} className="text-[var(--accent)]" /> Target Ticket
            </span>
            <span className="text-lg font-black text-[var(--secondary)]">{profile?.ticket_size || "Flexible"}</span>
          </div>
          <div className="neu-flat-base p-4 flex flex-col gap-1">
            <span className="text-[10px] text-[var(--secondary)]/60 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={12} className="text-[var(--accent)]" /> Sector Focus
            </span>
            <span className="text-lg font-black text-[var(--secondary)] truncate">{profile?.industries_of_interest?.[0] || "Agnostic"}</span>
          </div>
        </div>

        {/* Unified Capital Mandates & Deal Pipelines */}
        <div className="neu-flat-base p-8 relative overflow-hidden mt-8">
          <div className="absolute top-0 right-0 p-6 text-[var(--secondary)] opacity-5 pointer-events-none">
            <Target size={120} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--secondary)]/10 pb-4 relative z-10 gap-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--secondary)] flex items-center gap-2">
                <Target size={20} className="text-[var(--accent)]" /> Mandates & Deal Pipelines
              </h2>
              <p className="text-xs text-[var(--secondary)]/70 mt-1 font-medium">Manage mandates and track nested startup negotiations.</p>
            </div>
            <Link href="/investor/bids/create" className="neu-btn flex items-center justify-center gap-2 px-5 py-2.5 text-xs shrink-0">
              <Plus size={16} /> Create Bid Deck
            </Link>
          </div>

          <div className="pt-6 relative z-10 space-y-6">
            {(!bidDecks || bidDecks.length === 0) && directDeals.length === 0 ? (
              <div className="neu-pressed-base flex flex-col items-center justify-center p-12 text-center">
                <FileText size={40} className="text-[var(--secondary)]/50 mb-4" />
                <p className="text-base font-bold text-[var(--secondary)]">No Active Pipelines</p>
                <p className="text-xs text-[var(--secondary)]/60 mt-2 max-w-sm mx-auto font-medium">
                  You haven't published any Bid Decks or initiated deals yet.
                </p>
              </div>
            ) : (
              <>
                {/* Nested Mandate Pipelines */}
                {bidDecks?.map((deck) => {
                  const mandateDeals = dealsByMandate[deck.id] || [];
                  const isClosed = deck.status === "Closed";
                  const isPrivate = deck.status === "Private";
                  const isNegotiating = deck.status === "Negotiating";
                  const displayStatus = isClosed ? "Closed" : isNegotiating ? "Negotiating" : deck.status;

                  return (
                    <details key={deck.id} className="group neu-pressed-base overflow-hidden transition-all duration-300 rounded-2xl shadow-none border-transparent open:pb-4" open={isPrivate}>
                      <summary className="flex flex-col sm:flex-row sm:items-center justify-between p-6 cursor-pointer list-none hover:bg-[var(--secondary)]/5 transition-colors [&::-webkit-details-marker]:hidden gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${isNegotiating ? 'bg-blue-600/20 text-blue-600' :
                              isPrivate ? 'bg-amber-600/20 text-amber-600' :
                                'bg-[var(--primary)] text-[var(--secondary)] border border-[var(--secondary)]/10'
                              }`}>
                              {displayStatus}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--secondary)]/50">Alloc: ${deck.max_allocation?.toLocaleString()}</span>
                          </div>
                          <h3 className="font-bold text-[var(--secondary)] text-lg leading-tight flex items-center gap-2">
                            {isPrivate && <Handshake size={16} className="text-amber-600" />} {deck.title}
                          </h3>
                          <p className="text-xs text-[var(--secondary)]/70 line-clamp-1 font-medium mt-1">{deck.thesis}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          {mandateDeals.length > 0 && (
                            <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                              <Folder size={14} /> {mandateDeals.length} Deal{mandateDeals.length > 1 ? 's' : ''}
                            </span>
                          )}
                          <div className="flex items-center gap-2 border-l border-[var(--secondary)]/10 pl-4">
                            {!isPrivate && (
                              <Link href={`/bids/${deck.id}`} className="p-2 text-[var(--secondary)]/50 hover:text-[var(--accent)] transition-colors">
                                <Eye size={18} />
                              </Link>
                            )}
                            <DeleteResourceButton table="investor_bid_decks" recordId={deck.id} itemName="Mandate" status={deck.status} />
                            <ChevronDown size={18} className="text-[var(--secondary)]/50 group-open:rotate-180 transition-transform" />
                          </div>
                        </div>
                      </summary>

                      <div className="px-6 border-t border-[var(--secondary)]/10 pt-4 mt-2">
                        {mandateDeals.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="text-[10px] uppercase font-bold tracking-wider text-[var(--secondary)]/50 mb-2">Nested Deal Rooms</h4>
                            {mandateDeals.map((deal) => (
                              <div key={deal.id} className="neu-flat-base p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-2 border-blue-600">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${deal.status === 'Accepted' ? 'bg-emerald-600/10 text-emerald-600' :
                                      deal.status === 'Pending Finalization' ? 'bg-amber-600/10 text-amber-600' :
                                        deal.status === 'Rejected' || deal.status === 'Cancelled' ? 'bg-rose-600/10 text-rose-600' :
                                          'bg-blue-600/10 text-blue-600'
                                      }`}>{deal.status}</span>
                                    <span className="text-[9px] font-bold text-[var(--secondary)]/50">Updated {new Date(deal.updated_at).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-sm font-bold text-[var(--secondary)]">
                                    Pitch: <span className="text-[var(--accent)]">{deal.pitch_decks?.title || "Untitled"}</span>
                                  </p>
                                  <p className="text-xs font-medium text-[var(--secondary)]/60 mt-0.5">
                                    Founder: {deal.startup?.company_name || deal.startup?.nickname || "Undisclosed"}
                                  </p>
                                </div>
                                <Link href={`/negotiations/${deal.id}`} className="flex items-center justify-center gap-2 bg-[var(--primary)] border border-[var(--secondary)]/10 hover:border-[var(--accent)]/50 px-4 py-2 text-xs font-bold rounded-lg transition-colors">
                                  <MessageSquare size={14} /> Enter Room
                                </Link>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-medium text-[var(--secondary)]/50 py-2 italic text-center">No deal applications received for this mandate yet.</p>
                        )}
                      </div>
                    </details>
                  );
                })}

                {/* Standalone Direct Deals */}
                {directDeals.length > 0 && (
                  <details className="group neu-pressed-base overflow-hidden transition-all duration-300 rounded-2xl shadow-none border-transparent open:pb-4 border-l-2 border-violet-600">
                    <summary className="flex flex-col sm:flex-row sm:items-center justify-between p-6 cursor-pointer list-none hover:bg-[var(--secondary)]/5 transition-colors [&::-webkit-details-marker]:hidden gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-violet-600/20 text-violet-600">Direct Deals</span>
                        </div>
                        <h3 className="font-bold text-[var(--secondary)] text-lg leading-tight flex items-center gap-2">
                          <Handshake size={16} className="text-violet-600" /> Direct Startup Negotiations
                        </h3>
                        <p className="text-xs text-[var(--secondary)]/70 line-clamp-1 font-medium mt-1">Deals initiated outside of formal public mandates.</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-xs font-bold text-violet-600 flex items-center gap-1.5">
                          <Folder size={14} /> {directDeals.length} Deal{directDeals.length > 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-2 border-l border-[var(--secondary)]/10 pl-4">
                          <ChevronDown size={18} className="text-[var(--secondary)]/50 group-open:rotate-180 transition-transform" />
                        </div>
                      </div>
                    </summary>
                    <div className="px-6 border-t border-[var(--secondary)]/10 pt-4 mt-2 space-y-3">
                      {directDeals.map((deal) => (
                        <div key={deal.id} className="neu-flat-base p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-2 border-violet-600">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-violet-600/10 text-violet-600">{deal.status}</span>
                            </div>
                            <p className="text-sm font-bold text-[var(--secondary)]">Pitch: <span className="text-[var(--accent)]">{deal.pitch_decks?.title || "Untitled"}</span></p>
                          </div>
                          <Link href={`/negotiations/${deal.id}`} className="flex items-center justify-center gap-2 bg-[var(--primary)] border border-[var(--secondary)]/10 hover:border-[var(--accent)]/50 px-4 py-2 text-xs font-bold rounded-lg transition-colors">
                            <MessageSquare size={14} /> Enter Room
                          </Link>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Cards & Metrics remain unchanged below */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/browse/startups" className="neu-flat-base p-6 space-y-4 hover:scale-[1.02] transition-transform group">
            <div className="flex items-center justify-between">
              <div className="neu-pressed-base p-3 text-[var(--accent)]"><Rocket size={24} /></div>
              <span className="text-xs text-[var(--accent)] font-bold group-hover:underline">Explore →</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--secondary)] group-hover:text-[var(--accent)] transition-colors">Browse Startup Directory</h3>
            <p className="text-xs text-[var(--secondary)]/70 leading-relaxed font-medium">Filter startup pitch cards by raise ask, industry, valuation, and technology moat.</p>
          </Link>
          <Link href="/research" className="neu-flat-base p-6 space-y-4 hover:scale-[1.02] transition-transform group">
            <div className="flex items-center justify-between">
              <div className="neu-pressed-base p-3 text-[var(--accent)]"><BookOpen size={24} /></div>
              <span className="text-xs text-[var(--accent)] font-bold group-hover:underline">Publish →</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--secondary)] group-hover:text-[var(--accent)] transition-colors">Research & Thesis Hub</h3>
            <p className="text-xs text-[var(--secondary)]/70 leading-relaxed font-medium">Publish investment thesis articles, sector reports, and market insights.</p>
          </Link>
          <Link href="/pricing" className="neu-flat-base p-6 space-y-4 hover:scale-[1.02] transition-transform group">
            <div className="flex items-center justify-between">
              <div className="neu-pressed-base p-3 text-[var(--accent)]"><Sparkles size={24} /></div>
              <span className="text-xs text-[var(--accent)] font-bold group-hover:underline">Tier Settings →</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--secondary)] group-hover:text-[var(--accent)] transition-colors">Membership & Quotas</h3>
            <p className="text-xs text-[var(--secondary)]/70 leading-relaxed font-medium">Manage investment transaction caps, post quotas, and verified investor badges.</p>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="neu-flat-base p-6 flex items-center gap-4">
            <div className="neu-pressed-base border-transparent shadow-inner p-4 text-[var(--accent)] rounded-full"><Folder size={28} /></div>
            <div>
              <p className="text-xs text-[var(--secondary)]/70 font-bold uppercase tracking-wider">Active Deal Threads</p>
              <h4 className="text-3xl font-black text-[var(--secondary)]">{totalDeals}</h4>
            </div>
          </div>
          <div className="neu-flat-base p-6 flex items-center gap-4">
            <div className="neu-pressed-base border-transparent shadow-inner p-4 text-[var(--accent)] rounded-full"><FileText size={28} /></div>
            <div>
              <p className="text-xs text-[var(--secondary)]/70 font-bold uppercase tracking-wider">Mandates Published</p>
              <h4 className="text-3xl font-black text-[var(--secondary)]">{totalMandates}</h4>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}