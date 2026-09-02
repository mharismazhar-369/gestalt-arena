"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";
import {
    Handshake, FileText, Target, DollarSign, PieChart, Activity,
    CheckCircle2, XCircle, RefreshCw, MessageSquare, ShieldAlert,
    ArrowLeft, Lock, Send, Loader2
} from "lucide-react";

export default function NegotiationRoomPage() {
    const params = useParams();
    const dealId = params?.id ? String(params.id) : "";
    const { session } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [deal, setDeal] = useState<any>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Chat State
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sendingMsg, setSendingMsg] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Live Term Sheet State
    const [terms, setTerms] = useState({
        valuation: 0,
        equity: 0,
        ticket_size: 0,
    });

    useEffect(() => {
        if (!dealId || !session?.user) return;

        async function fetchDealAndMessages() {
            // 1. Fetch Deal Context
            const { data, error } = await supabase
                .from("deal_negotiations")
                .select(`
          *,
          pitch_decks (id, title, funding_goal, valuation, equity_offered),
          investor_bid_decks (id, title, max_allocation, min_arr)
        `)
                .eq("id", dealId)
                .single();

            if (error || !data) {
                setLoading(false);
                return;
            }

            // Security Check
            if (session?.user.id === data.startup_id || session?.user.id === data.investor_id) {
                setIsAuthorized(true);
                setDeal(data);
                setTerms({
                    valuation: data.proposed_valuation || data.pitch_decks?.valuation || 0,
                    equity: data.proposed_equity || data.pitch_decks?.equity_offered || 0,
                    ticket_size: data.ticket_size || data.pitch_decks?.funding_goal || 0,
                });

                // 2. Fetch Existing Messages
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

        // 3. Subscribe to Real-Time Chat Updates
        const channel = supabase
            .channel(`room_${dealId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "deal_messages", filter: `deal_id=eq.${dealId}` },
                (payload) => {
                    // Only append if it's not our own message (we optimistically add ours locally)
                    if (payload.new.sender_id !== session?.user.id) {
                        setMessages((prev) => [...prev, payload.new]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [dealId, session]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleUpdateDeal = async (newStatus: string, isCounterOffer = false) => {
        setUpdating(true);
        const payload: any = { status: newStatus };

        if (isCounterOffer) {
            payload.proposed_valuation = terms.valuation;
            payload.proposed_equity = terms.equity;
            payload.ticket_size = terms.ticket_size;
            payload.status = "Negotiating";
        }

        // 1. Update the Deal Status
        const { error } = await supabase.from("deal_negotiations").update(payload).eq("id", dealId);

        if (!error) {
            setDeal({ ...deal, ...payload });

            // 2. Cascade Status to the active Bid Deck if the deal is accepted
            if (newStatus === "Accepted" && deal.bid_deck_id) {
                await supabase.from("investor_bid_decks").update({ status: "Closed" }).eq("id", deal.bid_deck_id);
            }

            // 3. Auto-post a system message to the chat noting the term sheet update
            const systemMessage = isCounterOffer
                ? `has submitted a counter-offer for review.`
                : `has updated the deal status to: ${newStatus}.`;

            await supabase.from("deal_messages").insert({
                deal_id: dealId,
                sender_id: session?.user.id,
                content: `*System:* ${systemMessage}`
            });

        } else {
            alert("Failed to update deal terms.");
        }
        setUpdating(false);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !session?.user || sendingMsg) return;

        setSendingMsg(true);
        const msgText = newMessage.trim();
        setNewMessage(""); // Optimistic UI clear

        // Optimistically add to UI
        const tempMsg = {
            id: "temp-" + Date.now(),
            sender_id: session.user.id,
            content: msgText,
            created_at: new Date().toISOString()
        };
        setMessages((prev) => [...prev, tempMsg]);

        // Push to DB
        const { error } = await supabase.from("deal_messages").insert({
            deal_id: dealId,
            sender_id: session.user.id,
            content: msgText,
        });

        if (error) {
            console.error("Failed to send message", error);
            // Revert optimistic update on failure
            setMessages((prev) => prev.filter(m => m.id !== tempMsg.id));
            setNewMessage(msgText);
        }
        setSendingMsg(false);
    };

    if (loading) return <RoleRoutingLoader message="Encrypting Negotiation Room..." />;

    if (!isAuthorized || !deal) {
        return (
            <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center space-y-4 max-w-md p-8 trionn-glass-card rounded-3xl border border-rose-500/30">
                        <ShieldAlert size={48} className="mx-auto text-rose-500 mb-4" />
                        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
                        <p className="text-slate-400 text-sm">You do not have authorization to view this private deal thread, or the deal does not exist.</p>
                        <Link href="/dashboard" className="mt-4 inline-block px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition">Return to Dashboard</Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const isFounder = session?.user.id === deal.startup_id;
    const isReadOnly = deal.status === "Accepted" || deal.status === "Rejected";

    return (
        <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10 space-y-8">

                {/* Navigation & Status Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition mb-4">
                            <ArrowLeft size={14} /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-black text-white flex items-center gap-3">
                            <Handshake className={isFounder ? "text-violet-400" : "text-cyan-400"} size={32} />
                            Private Deal Room
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">End-to-end encrypted negotiation thread.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-5 py-3 rounded-2xl">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Deal Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${deal.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            deal.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                                deal.status === 'Negotiating' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                            {deal.status}
                        </span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: The Live Term Sheet */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className={`trionn-glass-card rounded-3xl border ${isFounder ? 'border-violet-500/30' : 'border-cyan-500/30'} p-6 shadow-xl relative overflow-hidden`}>
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <FileText size={18} className={isFounder ? "text-violet-400" : "text-cyan-400"} /> Live Term Sheet
                                </h2>
                                <Lock size={14} className="text-emerald-400" />
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <DollarSign size={12} /> Investment Amount (Ticket)
                                    </label>
                                    <input
                                        type="number"
                                        value={terms.ticket_size}
                                        onChange={(e) => setTerms({ ...terms, ticket_size: Number(e.target.value) })}
                                        disabled={isReadOnly}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-lg font-mono font-bold text-white focus:border-emerald-400 focus:outline-none transition disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Activity size={12} /> Pre-Money Valuation
                                    </label>
                                    <input
                                        type="number"
                                        value={terms.valuation}
                                        onChange={(e) => setTerms({ ...terms, valuation: Number(e.target.value) })}
                                        disabled={isReadOnly}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-lg font-mono font-bold text-white focus:border-emerald-400 focus:outline-none transition disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <PieChart size={12} /> Equity Stake (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={terms.equity}
                                        onChange={(e) => setTerms({ ...terms, equity: Number(e.target.value) })}
                                        disabled={isReadOnly}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-lg font-mono font-bold text-white focus:border-emerald-400 focus:outline-none transition disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {!isReadOnly && (
                                <div className="mt-8 space-y-3 pt-6 border-t border-white/10">
                                    <button
                                        onClick={() => handleUpdateDeal("Negotiating", true)}
                                        disabled={updating}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-3 text-xs font-bold text-white transition disabled:opacity-50"
                                    >
                                        <RefreshCw size={14} className={updating ? "animate-spin" : ""} /> Submit Counter Offer
                                    </button>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleUpdateDeal("Rejected")}
                                            disabled={updating}
                                            className="flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-4 py-3 text-xs font-bold text-rose-400 transition"
                                        >
                                            <XCircle size={14} /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleUpdateDeal("Accepted")}
                                            disabled={updating}
                                            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 hover:scale-105 px-4 py-3 text-xs font-bold text-black transition shadow-lg shadow-emerald-500/20"
                                        >
                                            <CheckCircle2 size={14} /> Accept Deal
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Context & Chat */}
                    <div className="lg:col-span-2 flex flex-col space-y-6">

                        {/* Reference Documents */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                    <Target size={12} className="text-cyan-400" /> Investor Mandate
                                </span>
                                {deal.investor_bid_decks ? (
                                    <>
                                        <h3 className="font-bold text-white line-clamp-1">{deal.investor_bid_decks.title}</h3>
                                        <Link href={`/bids/${deal.bid_deck_id}`} target="_blank" className="text-xs text-cyan-400 hover:underline block pt-1">View Original Mandate →</Link>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">Direct Pitch (No Public Mandate)</p>
                                )}
                            </div>
                            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                    <FileText size={12} className="text-violet-400" /> Startup Pitch
                                </span>
                                {deal.pitch_decks ? (
                                    <>
                                        <h3 className="font-bold text-white line-clamp-1">{deal.pitch_decks.title}</h3>
                                        <Link href={`/startup/${deal.pitch_deck_id}/pitch`} target="_blank" className="text-xs text-violet-400 hover:underline block pt-1">View Original Pitch Deck →</Link>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">Pitch Deck Removed</p>
                                )}
                            </div>
                        </div>

                        {/* LIVE DISCUSSION MODULE */}
                        <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 flex-grow flex flex-col shadow-xl min-h-[500px]">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <MessageSquare size={18} className="text-blue-400" /> Secure Discussion
                                </h2>
                            </div>

                            {/* Chat History Area */}
                            <div className="flex-grow bg-black/40 rounded-2xl border border-white/5 p-4 flex flex-col space-y-4 overflow-y-auto mb-4">

                                {/* Genesis Timestamp */}
                                <div className="flex justify-center mb-4">
                                    <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Lock size={12} /> Deal Room Initiated • {new Date(deal.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {messages.length === 0 ? (
                                    <div className="flex-grow flex flex-col items-center justify-center text-slate-500 space-y-2 opacity-50">
                                        <MessageSquare size={24} />
                                        <p className="text-sm">No messages yet. Start the negotiation!</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isSystem = msg.content.startsWith("*System:*");
                                        const isMe = msg.sender_id === session?.user.id;

                                        if (isSystem) {
                                            return (
                                                <div key={msg.id} className="flex justify-center py-2">
                                                    <span className="text-xs italic text-slate-500 bg-white/[0.02] px-4 py-1 rounded-full border border-white/5">
                                                        {msg.content.replace("*System:*", "")}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-5 py-3 text-sm shadow-md ${isMe
                                                    ? 'bg-blue-600/90 text-white rounded-br-sm'
                                                    : 'bg-white/10 text-slate-200 border border-white/5 rounded-bl-sm'
                                                    }`}>
                                                    {msg.content}
                                                    <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-200/70' : 'text-slate-500'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <form onSubmit={handleSendMessage} className="relative flex items-center">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={isReadOnly}
                                    placeholder={isReadOnly ? "This deal has been closed." : "Type a message or discuss terms..."}
                                    className="w-full bg-slate-900/80 border border-white/10 focus:border-blue-500/50 rounded-2xl py-3.5 pl-5 pr-14 text-sm text-white placeholder-slate-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sendingMsg || isReadOnly}
                                    className="absolute right-2 p-2 bg-blue-500 hover:bg-blue-400 text-black rounded-xl transition disabled:opacity-50 disabled:bg-white/10 disabled:text-slate-500"
                                >
                                    {sendingMsg ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
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