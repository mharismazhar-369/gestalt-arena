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
import {
  Rocket, Compass, BookOpen, ShieldCheck, User, Sparkles,
  Folder, FileText, Radio, Presentation, Settings, MapPin,
  DollarSign, Building2, Briefcase, Plus, Eye, Edit3, Handshake, MessageSquare, ChevronDown
} from "lucide-react";
import StartupProfileBuilder from "@/components/startup/StartupProfileBuilder";

export default async function StartupDashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role === "investor") redirect("/investor/dashboard");

  if (!profile?.profile_completed) {
    return (
      <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
        <Navbar />
        <main className="pt-32 pb-24 px-6 mx-auto max-w-3xl w-full relative z-10 space-y-10">
          <StartupProfileBuilder profile={profile} />
        </main>
        <Footer />
      </div>
    );
  }

  const { data: startupProfile } = await supabase.from("startup_profiles").select("*").eq("profile_id", user.id).single();
  const { data: pitchDecks } = await supabase.from("pitch_decks").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const { data: posts } = await supabase.from("posts").select("id, content, created_at").eq("author_id", user.id).order("created_at", { ascending: false }).limit(10);

  // Fetch ALL Active Deal Negotiations (Including private counter-offers and mandate applications)
  const { data: activeDeals } = await supabase
    .from("deal_negotiations")
    .select(`
        id, status, created_at, updated_at, pitch_deck_id,
        investor:profiles!deal_negotiations_investor_id_fkey(company_name, nickname),
        investor_bid_decks(title, status)
    `)
    .eq("startup_id", user.id)
    .order("updated_at", { ascending: false });

  // Group deals by the Founder's Pitch Deck
  const dealsByPitch: Record<string, any[]> = {};
  const directDeals: any[] = [];

  if (activeDeals) {
    activeDeals.forEach((deal) => {
      if (deal.pitch_deck_id) {
        if (!dealsByPitch[deal.pitch_deck_id]) dealsByPitch[deal.pitch_deck_id] = [];
        dealsByPitch[deal.pitch_deck_id].push(deal);
      } else {
        directDeals.push(deal);
      }
    });
  }

  const displayName = profile?.nickname || profile?.company_name || startupProfile?.company_name || user.email?.split("@")[0] || "Founder Partner";
  const displayLocation = profile?.city ? `${profile.city}, ${profile.state || ""}` : "Global Network";
  const displayTier = profile?.tier || "freemium";
  const targetRaise = profile?.funding_goal ? `$${profile.funding_goal.toLocaleString()}` : "Flexible";
  const primarySector = profile?.industries_of_interest?.[0] || startupProfile?.industry || "Technology";
  const totalPitches = pitchDecks?.length || 0;
  const totalDeals = activeDeals?.length || 0;

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10 space-y-8">

        {/* Dynamic Header Banner */}
        <div className="neu-flat-base p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="absolute top-0 right-0 p-8 text-[var(--secondary)] opacity-5 pointer-events-none">
            <Rocket size={220} />
          </div>

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="neu-pressed-base px-3 py-1 text-xs font-bold text-[var(--secondary)] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[var(--accent)]" /> Founder Portal
              </span>
              <BetaBadge variant="pill" />
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-[var(--secondary)]">
              Welcome back,{" "}
              <span className="text-[var(--accent)] capitalize">
                {displayName}
              </span>
            </h1>

            <p className="text-[var(--secondary)]/70 text-sm leading-relaxed font-medium">
              Showcase your startup pitch card to active angel investors and VCs on Gestalt Arena without paywalls.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-3 min-w-[200px]">
            <Link href="/dashboard/preferences" className="neu-btn flex items-center justify-center gap-2 w-full py-3 text-sm">
              <Settings size={16} /> Global Settings
            </Link>
            <div className="neu-btn">
              <LogoutButton />
            </div>
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
              <MapPin size={12} className="text-[var(--accent)]" /> Headquarters
            </span>
            <span className="text-lg font-black text-[var(--secondary)] truncate">{displayLocation}</span>
          </div>
          <div className="neu-flat-base p-4 flex flex-col gap-1">
            <span className="text-[10px] text-[var(--secondary)]/60 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={12} className="text-[var(--accent)]" /> Target Raise
            </span>
            <span className="text-lg font-black text-[var(--secondary)]">{targetRaise}</span>
          </div>
          <div className="neu-flat-base p-4 flex flex-col gap-1">
            <span className="text-[10px] text-[var(--secondary)]/60 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={12} className="text-[var(--accent)]" /> Primary Sector
            </span>
            <span className="text-lg font-black text-[var(--secondary)] truncate">{primarySector}</span>
          </div>
        </div>

        {/* Unified Pitch Portfolio & Deal Pipelines */}
        <div className="neu-flat-base p-8 relative overflow-hidden mt-8">
          <div className="absolute top-0 right-0 p-6 text-[var(--secondary)] opacity-5 pointer-events-none">
            <Presentation size={120} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--secondary)]/10 pb-4 relative z-10 gap-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--secondary)] flex items-center gap-2">
                <Presentation size={20} className="text-[var(--accent)]" /> Pitch Decks & Deal Pipelines
              </h2>
              <p className="text-xs text-[var(--secondary)]/70 mt-1 font-medium">Manage your pitch cards and track negotiations linked to each asset.</p>
            </div>
            <Link href="/startup/pitch/build" className="neu-btn flex items-center justify-center gap-2 px-5 py-2.5 text-xs shrink-0">
              <Plus size={16} /> Create Pitch Deck
            </Link>
          </div>

          <div className="pt-6 relative z-10 space-y-6">
            {(!pitchDecks || pitchDecks.length === 0) && directDeals.length === 0 ? (
              <div className="neu-pressed-base flex flex-col items-center justify-center p-12 text-center">
                <FileText size={40} className="text-[var(--secondary)]/50 mb-4" />
                <p className="text-base font-bold text-[var(--secondary)]">No Active Pitch Decks</p>
                <p className="text-xs text-[var(--secondary)]/60 mt-2 max-w-sm mx-auto font-medium">
                  You haven't created any pitch decks or initiated deals yet.
                </p>
              </div>
            ) : (
              <>
                {/* Nested Pitch Pipelines */}
                {pitchDecks?.map((deck) => {
                  const pitchDeals = dealsByPitch[deck.id] || [];
                  const isTargeted = deck.target_bid_id !== null;
                  const isClosed = deck.status === "Closed";
                  const isNegotiating = deck.status === "Negotiating";

                  return (
                    <details key={deck.id} className="group neu-pressed-base overflow-hidden transition-all duration-300 rounded-2xl shadow-none border-transparent open:pb-4" open={isTargeted}>
                      <summary className="flex flex-col sm:flex-row sm:items-center justify-between p-6 cursor-pointer list-none hover:bg-[var(--secondary)]/5 transition-colors [&::-webkit-details-marker]:hidden gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${isClosed ? 'bg-rose-600/20 text-rose-600' :
                              isNegotiating ? 'bg-blue-600/20 text-blue-600' :
                                isTargeted ? 'bg-amber-600/20 text-amber-600' :
                                  'bg-[var(--primary)] text-[var(--secondary)] border border-[var(--secondary)]/10'
                              }`}>
                              {isClosed ? "Deal Closed" : isNegotiating ? "Negotiating" : isTargeted ? "Private Target" : "Active Public"}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--secondary)]/50">{deck.stage || "Pre-Seed"}</span>
                          </div>
                          <h3 className="font-bold text-[var(--secondary)] text-lg leading-tight flex items-center gap-2">
                            {isTargeted && <Handshake size={16} className="text-amber-600" />} {deck.title || "Untitled Pitch"}
                          </h3>
                          <p className="text-xs font-mono text-[var(--accent)] font-bold mt-1">Goal: ${deck.funding_goal?.toLocaleString() || "Flexible"}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          {pitchDeals.length > 0 && (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                              <Folder size={14} /> {pitchDeals.length} Deal{pitchDeals.length > 1 ? 's' : ''}
                            </span>
                          )}
                          <div className="flex items-center gap-2 border-l border-[var(--secondary)]/10 pl-4">
                            <Link href={`/startup/${deck.id}/pitch`} className="p-2 text-[var(--secondary)]/50 hover:text-[var(--accent)] transition-colors">
                              <Eye size={18} />
                            </Link>
                            <Link href={`/startup/pitch/build?pitch_id=${deck.id}`} className="p-2 text-[var(--secondary)]/50 hover:text-[var(--accent)] transition-colors">
                              <Edit3 size={18} />
                            </Link>
                            <DeleteResourceButton table="pitch_decks" recordId={deck.id} itemName="Pitch" status={deck.status} />
                            <ChevronDown size={18} className="text-[var(--secondary)]/50 group-open:rotate-180 transition-transform" />
                          </div>
                        </div>
                      </summary>

                      <div className="px-6 border-t border-[var(--secondary)]/10 pt-4 mt-2">
                        {pitchDeals.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="text-[10px] uppercase font-bold tracking-wider text-[var(--secondary)]/50 mb-2">Linked Deal Rooms</h4>
                            {pitchDeals.map((deal) => (
                              <div key={deal.id} className="neu-flat-base p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-2 border-emerald-600">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${deal.status === 'Accepted' ? 'bg-emerald-600/10 text-emerald-600' :
                                      deal.status === 'Pending Founder Approval' || deal.status === 'Pending Finalization' ? 'bg-amber-600/10 text-amber-600' :
                                        deal.status === 'Rejected' || deal.status === 'Cancelled' ? 'bg-rose-600/10 text-rose-600' :
                                          'bg-blue-600/10 text-blue-600'
                                      }`}>{deal.status}</span>
                                    <span className="text-[9px] font-bold text-[var(--secondary)]/50">Updated {new Date(deal.updated_at).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-sm font-bold text-[var(--secondary)]">
                                    Investor: <span className="text-[var(--accent)]">{deal.investor?.company_name || deal.investor?.nickname || "Undisclosed"}</span>
                                  </p>
                                  <p className="text-xs font-medium text-[var(--secondary)]/60 mt-0.5">
                                    Mandate: {deal.investor_bid_decks?.title || "Direct Connection"}
                                  </p>
                                </div>
                                <Link href={`/negotiations/${deal.id}`} className="flex items-center justify-center gap-2 bg-[var(--primary)] border border-[var(--secondary)]/10 hover:border-[var(--accent)]/50 px-4 py-2 text-xs font-bold rounded-lg transition-colors">
                                  <MessageSquare size={14} /> Enter Room
                                </Link>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-medium text-[var(--secondary)]/50 py-2 italic text-center">No negotiations active for this pitch deck yet.</p>
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
                          <Handshake size={16} className="text-violet-600" /> Direct Investor Negotiations
                        </h3>
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
                            <p className="text-sm font-bold text-[var(--secondary)]">Investor: <span className="text-[var(--accent)]">{deal.investor?.company_name || deal.investor?.nickname || "Undisclosed"}</span></p>
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

        {/* Action Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/browse/investors" className="neu-flat-base p-6 space-y-4 hover:scale-[1.02] transition-transform group">
            <div className="flex items-center justify-between">
              <div className="neu-pressed-base p-3 text-[var(--accent)]">
                <Compass size={24} />
              </div>
              <span className="text-xs text-[var(--accent)] font-bold group-hover:underline">Browse →</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--secondary)] group-hover:text-[var(--accent)] transition-colors">Browse Investor Directory</h3>
            <p className="text-xs text-[var(--secondary)]/70 leading-relaxed font-medium">
              Find angel investors and venture funds matching your funding stage and industry sector.
            </p>
          </Link>
          <Link href="/research" className="neu-flat-base p-6 space-y-4 hover:scale-[1.02] transition-transform group">
            <div className="flex items-center justify-between">
              <div className="neu-pressed-base p-3 text-[var(--accent)]">
                <BookOpen size={24} />
              </div>
              <span className="text-xs text-[var(--accent)] font-bold group-hover:underline">Publish →</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--secondary)] group-hover:text-[var(--accent)] transition-colors">Publish Product Updates</h3>
            <p className="text-xs text-[var(--secondary)]/70 leading-relaxed font-medium">
              Publish technical research, product milestones, and metrics in the Research Hub.
            </p>
          </Link>
          <Link href="/pricing" className="neu-flat-base p-6 space-y-4 hover:scale-[1.02] transition-transform group">
            <div className="flex items-center justify-between">
              <div className="neu-pressed-base p-3 text-[var(--accent)]">
                <Sparkles size={24} />
              </div>
              <span className="text-xs text-[var(--accent)] font-bold group-hover:underline">Tier Caps →</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--secondary)] group-hover:text-[var(--accent)] transition-colors">Founder Tier & Limits</h3>
            <p className="text-xs text-[var(--secondary)]/70 leading-relaxed font-medium">
              Check daily post caps, character limits, and article publishing capabilities.
            </p>
          </Link>
        </div>

        {/* Founder Metrics Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="neu-flat-base p-6 flex items-center gap-4">
            <div className="neu-pressed-base border-transparent shadow-inner p-4 text-[var(--accent)] rounded-full">
              <Folder size={28} />
            </div>
            <div>
              <p className="text-xs text-[var(--secondary)]/70 font-bold uppercase tracking-wider">Fundraising Opps</p>
              <h4 className="text-3xl font-black text-[var(--secondary)]">{totalDeals}</h4>
            </div>
          </div>
          <div className="neu-flat-base p-6 flex items-center gap-4">
            <div className="neu-pressed-base border-transparent shadow-inner p-4 text-[var(--accent)] rounded-full">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-xs text-[var(--secondary)]/70 font-bold uppercase tracking-wider">Pitch Decks Created</p>
              <h4 className="text-3xl font-black text-[var(--secondary)]">{totalPitches}</h4>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Detailed Profile Data Card */}
          <div className="neu-flat-base p-8 space-y-6 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-[0.03] pointer-events-none">
              <Building2 size={300} />
            </div>
            <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4 relative z-10">
              <h3 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <User size={18} className="text-[var(--accent)]" /> Startup Profile Record
              </h3>
            </div>
            <div className="grid md:grid-cols-1 gap-6 relative z-10">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[var(--secondary)]/60 font-bold uppercase tracking-wider block text-[10px]">User Account Email</span>
                  <p className="font-mono text-[var(--secondary)] text-sm neu-pressed-base border-transparent shadow-inner p-2 px-3 inline-block rounded-lg">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[var(--secondary)]/60 font-bold uppercase tracking-wider block text-[10px]">System Role</span>
                  <span className="inline-flex items-center gap-1.5 neu-pressed-base border-transparent shadow-inner px-3 py-1 font-bold text-[var(--secondary)] capitalize text-xs mt-1 rounded-full">
                    <ShieldCheck size={12} className="text-[var(--accent)]" /> {profile?.role || "startup"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[var(--secondary)]/60 font-bold uppercase tracking-wider block text-[10px]">Elevator Pitch</span>
                  <p className="text-[var(--secondary)]/90 text-sm leading-relaxed line-clamp-3 neu-pressed-base border-transparent shadow-inner rounded-xl p-4 font-medium">
                    {profile?.elevator_pitch || startupProfile?.description || profile?.bio || "No elevator pitch provided yet."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Arena Feed Activity Card */}
          <div className="neu-flat-base p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-[var(--secondary)] opacity-5 pointer-events-none">
              <Radio size={120} />
            </div>
            <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4 relative z-10">
              <h3 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <Radio size={18} className="text-[var(--accent)]" /> My Recent Arena Posts
              </h3>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
              {!posts || posts.length === 0 ? (
                <p className="text-sm text-[var(--secondary)]/70 font-medium">You haven't broadcasted to the Arena Feed yet.</p>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="neu-pressed-base border-transparent shadow-inner rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-start mb-1">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--secondary)]/80">
                        Broadcast
                      </span>
                      <span className="text-[10px] text-[var(--secondary)]/50 font-mono">
                        {new Date(post.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--secondary)] line-clamp-3 leading-relaxed font-medium">{post.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}