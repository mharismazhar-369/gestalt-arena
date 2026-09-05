"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";
import TermSheetPanel from "@/components/negotiations/TermSheetPanel";
import {
    Handshake, FileText, Target, ShieldAlert,
    ArrowLeft, Lock, Send, Loader2, Clock, MessageSquare, UserPlus, CheckCircle2, History
} from "lucide-react";

export default function NegotiationRoomPage() {
    const params = useParams();
    const dealId = params?.id ? String(params.id) : "";
    const { session } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [deal, setDeal] = useState<any>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    const [isFullyLocked, setIsFullyLocked] = useState(false);
    const [accepting, setAccepting] = useState(false);

    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sendingMsg, setSendingMsg] = useState(false);

    // Auto-scroll ref attached to the scrollable container
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!dealId || !session?.user) return;

        async function fetchDealAndMessages() {
            const { data, error } = await supabase
                .from("deal_negotiations")
                .select(`
                    *,
                    pitch_decks (id, title, funding_goal, valuation, equity_offered),
                    investor_bid_decks (id, title, max_allocation, min_arr, status),
                    startup:profiles!deal_negotiations_startup_id_fkey(company_name, nickname),
                    investor:profiles!deal_negotiations_investor_id_fkey(company_name, nickname)
                `)
                .eq("id", dealId)
                .single();

            if (error || !data) {
                setLoading(false);
                return;
            }

            if (session?.user.id === data.startup_id || session?.user.id === data.investor_id) {
                setIsAuthorized(true);
                setDeal(data);

                const { data: msgData } = await supabase
                    .from("deal_messages")
                    .select("*")
                    .eq("deal_id", dealId)
                    .order("created_at", { ascending: true });

                if (msgData) setMessages(msgData);
            }
            setLoading(false);
        }

        fetchDealAndMessages();

        const chatChannel = supabase
            .channel(`chat_${dealId}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "deal_messages", filter: `deal_id=eq.${dealId}` },
                (payload) => {
                    if (payload.new.sender_id !== session?.user.id) {
                        setMessages((prev) => [...prev, payload.new]);
                    }
                }
            )
            .subscribe();

        const dealChannel = supabase
            .channel(`deal_${dealId}`)
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "deal_negotiations", filter: `id=eq.${dealId}` },
                (payload) => {
                    setDeal((prev: any) => ({ ...prev, ...payload.new }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(chatChannel);
            supabase.removeChannel(dealChannel);
        };
    }, [dealId, session]);

    useEffect(() => {
        if (deal?.status === "Pending Finalization" && deal?.accepted_at) {
            const interval = setInterval(() => {
                const acceptedTime = new Date(deal.accepted_at).getTime();
                const targetTime = acceptedTime + 24 * 60 * 60 * 1000;
                const now = new Date().getTime();
                const difference = targetTime - now;

                if (difference <= 0) {
                    setTimeLeft("00:00:00");
                    setIsFullyLocked(true);
                    clearInterval(interval);
                    // Automatically lock the deal permanently when 24h expire
                    supabase.rpc('lock_permanent_deal', { p_deal_id: dealId, p_funds_transferred: false }).then(() => {
                        setDeal((prev: any) => ({ ...prev, status: 'Accepted' }));
                    });
                } else {
                    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                    setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [deal]);

    // Handle smooth auto-scroll to bottom of chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleAcceptConnection = async () => {
        setAccepting(true);
        // Only update the deal status to Negotiating. The backend RLS protects the assets.
        const { error } = await supabase.from("deal_negotiations").update({ status: "Negotiating" }).eq("id", dealId);
        if (!error) {
            await supabase.from("deal_messages").insert({
                deal_id: dealId,
                sender_id: session?.user.id,
                content: `*System:* has accepted the connection. The negotiation room is now fully open.`
            });
            setDeal({ ...deal, status: "Negotiating" });
        }
        setAccepting(false);
    };

    // New handler to confirm funds transfer and permanently lock the deal
    const handleConfirmFunds = async (proof: { bank: string, mode: string, reference: string }) => {
        const { error } = await supabase.rpc('lock_permanent_deal', {
            p_deal_id: dealId,
            p_funds_transferred: true,
            p_bank_name: proof.bank,
            p_transfer_mode: proof.mode,
            p_transfer_ref: proof.reference
        });

        if (!error) {
            await supabase.from("deal_messages").insert({
                deal_id: dealId, sender_id: session?.user.id,
                content: `*System:* The investor submitted proof of transfer (${proof.mode} via ${proof.bank}). The deal is now permanently locked and recorded in the ledger.`
            });
            setDeal({ ...deal, status: 'Accepted', funds_transferred: true });
            setIsFullyLocked(true);
        } else {
            alert(`Error locking deal: ${error.message}`);
        }
    };

    const handleUpdateDealStatus = async (newStatus: string, isCounterOffer: boolean, newTerms?: any) => {

        // --- ATOMIC BACKEND TRANSACTION (START GRACE PERIOD) ---
        if (newStatus === "Pending Finalization" && newTerms) {
            const { data, error } = await supabase.rpc('finalize_deal', {
                p_deal_id: dealId,
                p_ticket: newTerms.ticket_size,
                p_val: newTerms.valuation,
                p_eq: newTerms.equity,
                p_terms: newTerms.additional_terms || ""
            });

            if (error) {
                alert(`Failed to finalize deal: ${error.message}`);
                return;
            }

            await supabase.from("deal_messages").insert({
                deal_id: dealId,
                sender_id: session?.user.id,
                content: `*System:* locked the terms and initiated the 24-hour grace period. Transaction Hash: ${data.transaction_hash}`
            });

            // Re-fetch the deal to get the new hash and ledger data
            const { data: updatedDeal } = await supabase.from("deal_negotiations").select("*").eq("id", dealId).single();
            if (updatedDeal) setDeal(updatedDeal);
            return;
        }

        // --- STANDARD COUNTER OFFERS & CANCELLATIONS ---
        const payload: any = { status: newStatus };

        if (isCounterOffer && newTerms) {
            payload.proposed_valuation = newTerms.valuation;
            payload.proposed_equity = newTerms.equity;
            payload.ticket_size = newTerms.ticket_size;
            payload.additional_terms = newTerms.additional_terms;

            const currentHistory = deal.offer_history || [];
            const newOfferLog = {
                valuation: newTerms.valuation,
                equity: newTerms.equity,
                ticket_size: newTerms.ticket_size,
                additional_terms: newTerms.additional_terms,
                sender_id: session?.user.id,
                created_at: new Date().toISOString()
            };
            payload.offer_history = [...currentHistory, newOfferLog];
        }

        if (newStatus === "Cancelled" || newStatus === "Rejected") {
            if (deal.bid_deck_id && deal.investor_bid_decks?.status !== "Private") {
                await supabase.from("investor_bid_decks").update({ status: "active" }).eq("id", deal.bid_deck_id);
            }
            if (deal.pitch_deck_id) {
                await supabase.from("pitch_decks").update({ status: "active" }).eq("id", deal.pitch_deck_id);
            }
        }

        const { error } = await supabase.from("deal_negotiations").update(payload).eq("id", dealId);
        if (!error) {
            const systemMessage = isCounterOffer ? `has submitted a counter-offer for review.` : `has updated the deal status to: ${newStatus}.`;
            await supabase.from("deal_messages").insert({ deal_id: dealId, sender_id: session?.user.id, content: `*System:* ${systemMessage}` });
            setDeal({ ...deal, ...payload });
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !session?.user || sendingMsg) return;

        setSendingMsg(true);
        const msgText = newMessage.trim();
        setNewMessage("");

        const tempId = "temp-" + Date.now();
        const tempMsg = { id: tempId, sender_id: session.user.id, content: msgText, created_at: new Date().toISOString() };
        setMessages((prev) => [...prev, tempMsg]);

        const { data, error } = await supabase.from("deal_messages").insert({
            deal_id: dealId, sender_id: session.user.id, content: msgText,
        }).select().single();

        if (error) {
            console.error("Chat Insert Error:", error);
            alert(`Message failed to send: ${error.message}`);
            setMessages((prev) => prev.filter(m => m.id !== tempId));
            setNewMessage(msgText);
        } else if (data) {
            setMessages((prev) => prev.map(m => m.id === tempId ? data : m));
        }
        setSendingMsg(false);
    };

    if (loading) return <RoleRoutingLoader message="Encrypting Negotiation Room..." />;

    if (!isAuthorized || !deal) {
        return (
            <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center space-y-4 max-w-md p-10 neu-flat-base rounded-3xl">
                        <ShieldAlert size={48} className="mx-auto text-rose-600 mb-4" />
                        <h1 className="text-2xl font-bold text-[var(--secondary)]">Access Denied</h1>
                        <p className="text-[var(--secondary)]/70 text-sm font-medium">You do not have authorization to view this private deal thread.</p>
                        <Link href="/dashboard" className="mt-4 neu-btn px-6 py-3 text-xs inline-block">Return to Dashboard</Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const isFounder = session?.user.id === deal.startup_id;
    const startupName = deal.startup?.company_name || deal.startup?.nickname || "Startup Partner";
    const investorName = deal.investor?.company_name || deal.investor?.nickname || "Investor Partner";
    const otherPartyName = isFounder ? investorName : startupName;

    const isTargetedCounter = deal.investor_bid_decks?.status === "Private";
    const needsMyApproval = deal.status === "Pending" && (isTargetedCounter ? isFounder : !isFounder);
    const isWaitingOnOther = deal.status === "Pending" && (isTargetedCounter ? !isFounder : isFounder);
    const connectionLocked = deal.status === "Pending";

    const chatLocked = deal.status === "Accepted" || deal.status === "Rejected" || deal.status === "Cancelled" || isFullyLocked || connectionLocked;

    const offerHistory = deal.offer_history || [];

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-[1400px] w-full relative z-10 space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--secondary)]/10">
                    <div className="space-y-2">
                        <Link href={isFounder ? "/startup/dashboard" : "/investor/dashboard"} className="flex items-center gap-2 text-xs font-bold text-[var(--secondary)]/60 hover:text-[var(--accent)] transition mb-4">
                            <ArrowLeft size={14} /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-black text-[var(--secondary)] flex items-center gap-4">
                            <Handshake className={isFounder ? "text-violet-600" : "text-[var(--accent)]"} size={32} />
                            Deal with <span className="text-[var(--accent)]">{otherPartyName}</span>
                        </h1>
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                        <div className="flex items-center gap-3 neu-pressed-base border-transparent shadow-inner px-5 py-3 rounded-2xl">
                            <span className="text-xs font-bold uppercase text-[var(--secondary)]/60 tracking-wider">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 
                                ${isFullyLocked || deal.status === 'Accepted' ? 'text-emerald-600 bg-emerald-600/10' :
                                    deal.status === 'Pending Finalization' ? 'text-amber-600 bg-amber-600/10' :
                                        deal.status === 'Rejected' || deal.status === 'Cancelled' ? 'text-rose-600 bg-rose-600/10' :
                                            'text-blue-600 bg-blue-600/10'}`}>
                                {isFullyLocked ? "Finalized" : deal.status}
                            </span>
                        </div>
                    </div>
                </div>

                {connectionLocked && (
                    <div className="neu-flat-base rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 border-2 border-blue-600/30 bg-blue-600/5">
                        <UserPlus size={48} className="text-blue-600 mb-2" />
                        <h2 className="text-xl font-bold text-[var(--secondary)]">Connection Pending</h2>

                        {needsMyApproval ? (
                            <>
                                <p className="text-sm font-medium text-[var(--secondary)]/70 max-w-lg">
                                    {otherPartyName} wants to enter negotiations. Accepting will unlock the deal board and chat room.
                                </p>
                                <button onClick={handleAcceptConnection} disabled={accepting} className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition shadow-lg mt-4 disabled:opacity-50">
                                    {accepting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    {accepting ? "Connecting..." : "Accept Connection & Open Deal Room"}
                                </button>
                            </>
                        ) : (
                            <p className="text-sm font-medium text-[var(--secondary)]/70 max-w-lg">
                                Waiting for {otherPartyName} to accept the connection.
                            </p>
                        )}
                    </div>
                )}

                <div className={`grid lg:grid-cols-3 gap-8 items-start transition-opacity duration-500 ${connectionLocked ? 'opacity-40 pointer-events-none grayscale-[0.5]' : 'opacity-100'}`}>

                    {/* COL 1: Live Term Sheet */}
                    <div className="lg:col-span-1 h-full min-h-[600px]">
                        <TermSheetPanel
                            deal={deal}
                            dealId={dealId}
                            userId={session?.user?.id}
                            timeLeft={timeLeft}
                            isFullyLocked={isFullyLocked}
                            onUpdateStatus={handleUpdateDealStatus}
                            onConfirmFunds={handleConfirmFunds}
                        />
                    </div>

                    {/* COL 2: Counter Offer Deal Board */}
                    <div className="lg:col-span-1 h-[600px] flex flex-col neu-flat-base rounded-3xl p-8 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4 mb-6 shrink-0">
                            <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                                <History size={18} className="text-amber-500" /> Counter Offer Board
                            </h2>
                        </div>

                        <div className="flex-grow overflow-y-auto custom-scrollbar space-y-4 pr-2">
                            {offerHistory.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-[var(--secondary)]/40 space-y-3 font-medium text-center">
                                    <History size={32} />
                                    <p className="text-sm">No counter offers made yet.<br />The history will appear here.</p>
                                </div>
                            ) : (
                                offerHistory.slice().reverse().map((offer: any, idx: number) => {
                                    const isMyOffer = offer.sender_id === session?.user.id;
                                    return (
                                        <div key={idx} className={`p-4 rounded-2xl shadow-inner text-sm ${isMyOffer ? 'neu-pressed-base border-blue-600/30' : 'neu-pressed-base border-transparent'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`text-[10px] font-bold uppercase ${isMyOffer ? 'text-blue-500' : 'text-[var(--accent)]'}`}>
                                                    {isMyOffer ? 'You Offered' : `${otherPartyName} Offered`}
                                                </span>
                                                <span className="text-[9px] text-[var(--secondary)]/50 font-bold">{new Date(offer.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                                                <div>
                                                    <span className="text-[10px] text-[var(--secondary)]/50 block">Amount</span>
                                                    <span className="font-mono font-bold">${Number(offer.ticket_size).toLocaleString()}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-[var(--secondary)]/50 block">Equity</span>
                                                    <span className="font-mono font-bold">{offer.equity}%</span>
                                                </div>
                                            </div>
                                            {offer.additional_terms && (
                                                <div className="pt-2 border-t border-[var(--secondary)]/10">
                                                    <span className="text-[10px] text-[var(--secondary)]/50 block mb-1">Notes</span>
                                                    <p className="text-xs font-medium text-[var(--secondary)]/80 italic">"{offer.additional_terms}"</p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* COL 3: Context Links & Chat */}
                    <div className="lg:col-span-1 flex flex-col space-y-6 h-[600px]">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="neu-pressed-base border-transparent shadow-inner rounded-2xl p-4 space-y-1 relative">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--secondary)]/60 flex items-center gap-1.5"><Target size={10} className="text-[var(--accent)]" /> Mandate</span>
                                <h3 className="text-xs font-bold text-[var(--secondary)] line-clamp-1">{deal.investor_bid_decks?.title || "Direct Pitch"}</h3>
                            </div>
                            <div className="neu-pressed-base border-transparent shadow-inner rounded-2xl p-4 space-y-1 relative">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--secondary)]/60 flex items-center gap-1.5"><FileText size={10} className="text-violet-600" /> Pitch Deck</span>
                                <h3 className="text-xs font-bold text-[var(--secondary)] line-clamp-1">{deal.pitch_decks?.title || "Removed"}</h3>
                            </div>
                        </div>

                        <div className="neu-flat-base rounded-3xl p-6 flex-grow flex flex-col overflow-hidden relative">
                            <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-3 mb-4 shrink-0">
                                <h2 className="text-sm font-bold text-[var(--secondary)] flex items-center gap-2">
                                    <MessageSquare size={16} className="text-blue-600" /> Chat
                                </h2>
                            </div>

                            <div ref={chatContainerRef} className="flex-grow bg-transparent border-transparent neu-pressed-base shadow-inner rounded-2xl p-4 flex flex-col space-y-4 overflow-y-auto mb-4 custom-scrollbar h-full">
                                {messages.map((msg) => {
                                    const isSystem = msg.content.startsWith("*System:*");
                                    const isMe = msg.sender_id === session?.user.id;
                                    if (isSystem) {
                                        return (
                                            <div key={msg.id} className="flex justify-center">
                                                <span className="text-[10px] italic font-medium text-[var(--secondary)]/60 bg-[var(--primary)] px-3 py-1 rounded-full text-center max-w-[90%]">{msg.content.replace("*System:*", "")}</span>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs shadow-md font-medium ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'neu-flat-base text-[var(--secondary)] rounded-bl-sm'}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <form onSubmit={handleSendMessage} className="relative flex items-center shrink-0 mt-4">
                                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={chatLocked} placeholder="Type a message..." className="w-full bg-transparent border-transparent neu-pressed-base shadow-inner focus:ring-1 focus:ring-blue-500 rounded-xl py-3 pl-4 pr-12 text-xs font-medium text-[var(--secondary)] placeholder-[var(--secondary)]/40 outline-none transition disabled:opacity-50" />
                                <button type="submit" disabled={!newMessage.trim() || sendingMsg || chatLocked} className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50">
                                    {sendingMsg ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}