"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";
import TermSheetPanel from "@/components/negotiations/TermSheetPanel";
import {
    Handshake, FileText, Target, ShieldAlert, ArrowLeft, Lock, Send,
    Loader2, MessageSquare, UserPlus, CheckCircle2, History, Paperclip,
    Clock3, Scale, AlertTriangle, ExternalLink
} from "lucide-react";

export default function NegotiationRoomPage() {
    const params = useParams();
    const dealId = params?.id ? String(params.id) : "";
    const { session } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [deal, setDeal] = useState<any>(null);
    const [offers, setOffers] = useState<any[]>([]);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    const [isFullyLocked, setIsFullyLocked] = useState(false);
    const [accepting, setAccepting] = useState(false);

    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sendingMsg, setSendingMsg] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const loadOffers = useCallback(async () => {
        if (!dealId) return;
        const { data, error } = await supabase
            .from("deal_offers")
            .select(`
                *,
                deal_offer_acceptances(*)
            `)
            .eq("deal_id", dealId)
            .order("offer_number", { ascending: true });

        if (!error && data) setOffers(data);
        else if (error) console.error("Offer load error:", error);
    }, [dealId]);

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

            // FIX: Applied optional chaining to avoid strict TS compilation errors
            if (session?.user?.id === data.startup_id || session?.user?.id === data.investor_id) {
                setIsAuthorized(true);
                setDeal(data);
                await loadOffers();

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
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "deal_messages", filter: `deal_id=eq.${dealId}` },
                (payload) => {
                    if (payload.new.sender_id !== session?.user?.id) {
                        setMessages((prev) => [...prev, payload.new]);
                    }
                }
            )
            .subscribe();

        const dealChannel = supabase
            .channel(`deal_${dealId}`)
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "deal_negotiations", filter: `id=eq.${dealId}` },
                (payload) => setDeal((prev: any) => ({ ...prev, ...payload.new }))
            )
            .subscribe();

        const offerChannel = supabase
            .channel(`offers_${dealId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "deal_offers", filter: `deal_id=eq.${dealId}` },
                () => loadOffers()
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "deal_offer_acceptances" },
                () => loadOffers()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(chatChannel);
            supabase.removeChannel(dealChannel);
            supabase.removeChannel(offerChannel);
        };
    }, [dealId, session?.user?.id, loadOffers]);

    useEffect(() => {
        if (!deal || deal?.status !== "Pending Finalization" || !deal?.accepted_at) return;

        const acceptedTimestamp = deal.accepted_at;

        const interval = setInterval(() => {
            const targetTime = new Date(acceptedTimestamp).getTime() + 24 * 60 * 60 * 1000;
            const difference = targetTime - Date.now();

            if (difference <= 0) {
                setTimeLeft("00:00:00");
                setIsFullyLocked(true);
                clearInterval(interval);

                supabase.rpc("lock_permanent_deal", {
                    p_deal_id: dealId,
                    p_funds_transferred: false
                }).then(() => {
                    setDeal((prev: any) => prev ? { ...prev, status: "Accepted" } : prev);
                });
            } else {
                const hours = Math.floor(difference / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft(
                    `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
                );
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [deal?.status, deal?.accepted_at, dealId]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleAcceptConnection = async () => {
        setAccepting(true);
        const { error } = await supabase
            .from("deal_negotiations")
            .update({ status: "Negotiating" })
            .eq("id", dealId)
            .eq("status", "Pending");

        if (!error) {
            await supabase.from("deal_messages").insert({
                deal_id: dealId,
                sender_id: session?.user?.id,
                content: "*System:* has accepted the connection. The negotiation room is now fully open."
            });
            setDeal((prev: any) => ({ ...prev, status: "Negotiating" }));
        } else {
            alert(`Unable to open negotiation: ${error.message}`);
        }
        setAccepting(false);
    };

    const handleCreateOffer = async (terms: any, structure: string, attachments: any[] = []) => {
        if (!session?.user?.id) return false;

        // FIX: Wrapped in try/catch and added fallbacks to prevent silent crashes
        try {
            const { data, error } = await supabase.rpc("create_deal_offer", {
                p_deal_id: dealId,
                p_deal_structure: structure,
                p_terms: { ...terms, attachments }
            });

            if (error) {
                alert(`Counter Offer could not be created: ${error.message}`);
                return false;
            }

            const nextOfferNum = data?.offer_number || offers.length + 1;

            await supabase.from("deal_messages").insert({
                deal_id: dealId,
                sender_id: session?.user?.id,
                content: `*System:* Counter Offer #${nextOfferNum} was submitted for review.`
            });

            await loadOffers();

            const { data: refreshedDeal } = await supabase
                .from("deal_negotiations")
                .select("*")
                .eq("id", dealId)
                .single();

            if (refreshedDeal) setDeal((prev: any) => ({ ...prev, ...refreshedDeal }));

            return true;
        } catch (err: any) {
            console.error("Submission Error:", err);
            alert(`An unexpected error occurred during submission: ${err.message}`);
            return false;
        }
    };

    const handleAcceptOffer = async (offerId: string) => {
        if (!session?.user?.id || accepting) return;
        setAccepting(true);

        try {
            const { data, error } = await supabase.rpc("accept_deal_offer", {
                p_offer_id: offerId
            });

            if (error) {
                alert(`Offer acceptance failed: ${error.message}`);
                setAccepting(false);
                return;
            }

            await loadOffers();

            const offerNumber = data?.offer_number || offers.find((o) => o.id === offerId)?.offer_number;

            if (data?.became_deal_maker) {
                await supabase.from("deal_messages").insert({
                    deal_id: dealId,
                    sender_id: session?.user?.id,
                    content: `*System:* Counter Offer #${offerNumber} has been accepted by both parties and is now the Deal Maker. The governing terms are locked to this offer.`
                });
            } else {
                await supabase.from("deal_messages").insert({
                    deal_id: dealId,
                    sender_id: session?.user?.id,
                    content: `*System:* Counter Offer #${offerNumber} was accepted by one party. Awaiting the other party's acceptance.`
                });
            }

            const { data: refreshedDeal } = await supabase
                .from("deal_negotiations")
                .select("*")
                .eq("id", dealId)
                .single();

            if (refreshedDeal) setDeal((prev: any) => ({ ...prev, ...refreshedDeal }));
        } catch (err: any) {
            console.error("Acceptance Error:", err);
        } finally {
            setAccepting(false);
        }
    };

    const handleConfirmFunds = async (
        action: "submit_proof" | "confirm_receipt",
        proof?: { bank: string; mode: string; reference: string }
    ) => {
        const isFounder = session?.user?.id === deal?.startup_id;

        if (action === "submit_proof" && !isFounder && proof) {
            const { error } = await supabase.rpc("lock_permanent_deal", {
                p_deal_id: dealId,
                p_funds_transferred: false,
                p_bank_name: proof.bank,
                p_transfer_mode: proof.mode,
                p_transfer_ref: proof.reference
            });

            if (!error) {
                await supabase.from("deal_messages").insert({
                    deal_id: dealId,
                    sender_id: session?.user?.id,
                    content: `*System:* The investor submitted proof of transfer (${proof.mode} via ${proof.bank}). Awaiting founder confirmation.`
                });
                setDeal((prev: any) => ({ ...prev, status: "Awaiting Receipt Confirmation" }));
            } else {
                alert(`Error submitting proof: ${error.message}`);
            }
        } else if (action === "confirm_receipt" && isFounder) {
            const { error } = await supabase
                .from("deal_negotiations")
                .update({ status: "Accepted", funds_transferred: true })
                .eq("id", dealId);

            if (!error) {
                await supabase.from("deal_messages").insert({
                    deal_id: dealId,
                    sender_id: session?.user?.id,
                    content: "*System:* The founder confirmed receipt of funds. The deal is officially finalized between the parties."
                });
                setDeal((prev: any) => ({ ...prev, status: "Accepted", funds_transferred: true }));
                setIsFullyLocked(true);
            } else {
                alert(`Error confirming receipt: ${error.message}`);
            }
        }
    };

    const handleAppealDeal = async () => {
        if (!confirm("Mark this transaction as disputed? This does not determine the legal outcome between the parties.")) return;

        const { error } = await supabase
            .from("deal_negotiations")
            .update({ status: "Disputed" })
            .eq("id", dealId);

        if (!error) {
            await supabase.from("deal_messages").insert({
                deal_id: dealId,
                sender_id: session?.user?.id,
                content: "*System:* A party marked the transaction as Disputed. The platform records the event but is not a party to the underlying financial transaction."
            });
            setDeal((prev: any) => ({ ...prev, status: "Disputed" }));
        } else {
            alert(`Error opening dispute: ${error.message}`);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !session?.user?.id || sendingMsg) return;

        setSendingMsg(true);
        const msgText = newMessage.trim();
        setNewMessage("");

        const tempId = `temp-${Date.now()}`;
        setMessages((prev) => [
            ...prev,
            { id: tempId, sender_id: session?.user?.id, content: msgText, created_at: new Date().toISOString() }
        ]);

        const { data, error } = await supabase.from("deal_messages").insert({
            deal_id: dealId,
            sender_id: session?.user?.id,
            content: msgText
        }).select().single();

        if (error) {
            alert(`Message failed to send: ${error.message}`);
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            setNewMessage(msgText);
        } else if (data) {
            setMessages((prev) => prev.map((m) => m.id === tempId ? data : m));
        }

        setSendingMsg(false);
    };

    if (loading) return <RoleRoutingLoader message="Encrypting Negotiation Room..." />;

    if (!isAuthorized || !deal) {
        return (
            <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center space-y-4 max-w-md p-10 neu-flat-base rounded-3xl">
                        <ShieldAlert size={48} className="mx-auto text-rose-600 mb-4" />
                        <h1 className="text-2xl font-bold">Access Denied</h1>
                        <p className="text-[var(--secondary)]/70 text-sm font-medium">
                            You do not have authorization to view this private deal thread.
                        </p>
                        <Link href="/dashboard" className="mt-4 neu-btn px-6 py-3 text-xs inline-block">Return to Dashboard</Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const isFounder = session?.user?.id === deal?.startup_id;
    const startupName = deal?.startup?.company_name || deal?.startup?.nickname || "Startup Partner";
    const investorName = deal?.investor?.company_name || deal?.investor?.nickname || "Investor Partner";
    const otherPartyName = isFounder ? investorName : startupName;
    const connectionLocked = deal?.status === "Pending";
    const chatLocked = connectionLocked;
    const dealMakerOffer = offers.find((o) => o.id === deal?.deal_maker_offer_id || o.status === "deal_maker");

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-[1500px] w-full relative z-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--secondary)]/10">
                    <div className="space-y-2">
                        <Link
                            href={isFounder ? "/startup/dashboard" : "/investor/dashboard"}
                            className="flex items-center gap-2 text-xs font-bold text-[var(--secondary)]/60 hover:text-[var(--accent)] transition mb-4"
                        >
                            <ArrowLeft size={14} /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4">
                            <Handshake className={isFounder ? "text-violet-600" : "text-[var(--accent)]"} size={32} />
                            Deal with <span className="text-[var(--accent)]">{otherPartyName}</span>
                        </h1>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-600/10 text-blue-600">
                                {deal?.deal_structure || "Negotiation"}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--secondary)]/5 text-[var(--secondary)]/60">
                                {offers.length} Counter Offer{offers.length === 1 ? "" : "s"}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                        <div className="flex items-center gap-3 neu-pressed-base px-5 py-3 rounded-2xl">
                            <span className="text-xs font-bold uppercase text-[var(--secondary)]/60 tracking-wider">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isFullyLocked || deal?.status === "Accepted" ? "text-emerald-600 bg-emerald-600/10" :
                                deal?.status === "Disputed" ? "text-rose-600 bg-rose-600/10" :
                                    deal?.status === "Pending Finalization" ? "text-amber-600 bg-amber-600/10" :
                                        deal?.status === "Rejected" || deal?.status === "Cancelled" ? "text-rose-600 bg-rose-600/10" :
                                            "text-blue-600 bg-blue-600/10"
                                }`}>
                                {isFullyLocked || deal?.status === "Accepted" ? <Lock size={12} /> : <Clock3 size={12} />}
                                {deal?.status === "Accepted" ? "Finalized" : deal?.status}
                            </span>
                        </div>
                    </div>
                </div>

                {dealMakerOffer && (
                    <div className="neu-flat-base rounded-3xl p-5 border border-emerald-600/20 bg-emerald-600/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-wider">
                                    <CheckCircle2 size={15} /> Deal Maker — Counter Offer #{dealMakerOffer.offer_number}
                                </div>
                                <p className="text-xs text-[var(--secondary)]/60 mt-1">
                                    This offer contains the governing terms selected by both parties. Other offers remain preserved as negotiation history.
                                </p>
                            </div>
                            <button
                                onClick={() => document.getElementById(`offer-${dealMakerOffer.id}`)?.scrollIntoView({ behavior: "smooth" })}
                                className="neu-btn px-4 py-2 text-[10px] font-bold"
                            >
                                View Governing Terms
                            </button>
                        </div>
                    </div>
                )}

                {connectionLocked && (
                    <div className="neu-flat-base rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 border-2 border-blue-600/30 bg-blue-600/5">
                        <UserPlus size={48} className="text-blue-600 mb-2" />
                        <h2 className="text-xl font-bold">Connection Pending</h2>
                        <p className="text-sm font-medium text-[var(--secondary)]/70 max-w-lg">
                            {isFounder
                                ? `${otherPartyName} wants to enter negotiations. Accepting will unlock the deal board and chat room.`
                                : `Waiting for ${otherPartyName} to accept the connection.`}
                        </p>
                        {isFounder && (
                            <button
                                onClick={handleAcceptConnection}
                                disabled={accepting}
                                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition shadow-lg disabled:opacity-50"
                            >
                                {accepting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                {accepting ? "Connecting..." : "Accept Connection & Open Deal Room"}
                            </button>
                        )}
                    </div>
                )}

                <div className={`grid xl:grid-cols-12 gap-8 items-start transition-opacity duration-500 ${connectionLocked ? "opacity-40 pointer-events-none grayscale-[0.5]" : "opacity-100"}`}>
                    <div className="xl:col-span-5 min-h-[720px]">
                        <TermSheetPanel
                            deal={deal}
                            offers={offers}
                            dealId={dealId}
                            userId={session?.user?.id}
                            timeLeft={timeLeft}
                            isFullyLocked={isFullyLocked}
                            onCreateOffer={handleCreateOffer}
                            onAcceptOffer={handleAcceptOffer}
                            onConfirmFunds={handleConfirmFunds}
                            onAppeal={handleAppealDeal}
                        />
                    </div>

                    <div className="xl:col-span-4 h-[720px] flex flex-col neu-flat-base rounded-3xl p-7 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4 mb-5 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <History size={18} className="text-amber-500" /> Counter Offer Ledger
                                </h2>
                                <p className="text-[9px] text-[var(--secondary)]/50 font-medium mt-1">
                                    Every offer is an immutable snapshot.
                                </p>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-[var(--secondary)]/50">
                                {offers.length} records
                            </span>
                        </div>

                        <div className="flex-grow overflow-y-auto custom-scrollbar space-y-4 pr-2">
                            {offers.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-[var(--secondary)]/40 space-y-3 font-medium text-center">
                                    <History size={34} />
                                    <p className="text-sm">No counter offers yet.<br />The first submitted offer will become #1.</p>
                                </div>
                            ) : (
                                offers.slice().reverse().map((offer: any) => {
                                    const isMyOffer = offer.sender_id === session?.user?.id;
                                    const acceptances = offer.deal_offer_acceptances || [];
                                    const myAcceptance = acceptances.find((a: any) => a.user_id === session?.user?.id);
                                    const otherAccepted = acceptances.some((a: any) => a.user_id !== session?.user?.id);
                                    const isDealMaker = offer.status === "deal_maker" || offer.id === deal?.deal_maker_offer_id;

                                    return (
                                        <div
                                            id={`offer-${offer.id}`}
                                            key={offer.id}
                                            className={`p-5 rounded-2xl shadow-inner border ${isDealMaker ? "border-emerald-600/40 bg-emerald-600/5" :
                                                isMyOffer ? "border-blue-600/20" : "border-transparent"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start gap-3 mb-3">
                                                <div>
                                                    <div className={`text-xs font-black uppercase tracking-wider ${isDealMaker ? "text-emerald-600" : isMyOffer ? "text-blue-500" : "text-[var(--accent)]"}`}>
                                                        Counter Offer #{offer.offer_number}
                                                    </div>
                                                    <div className="text-[9px] font-bold uppercase text-[var(--secondary)]/50 mt-1">
                                                        {isMyOffer ? "Submitted by you" : `Submitted by ${otherPartyName}`}
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${isDealMaker ? "text-emerald-600 bg-emerald-600/10" :
                                                    offer.status === "accepted" ? "text-blue-600 bg-blue-600/10" :
                                                        "text-amber-600 bg-amber-600/10"
                                                    }`}>
                                                    {isDealMaker ? "Deal Maker" : offer.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                                                {[
                                                    ["Amount", offer.terms?.ticket_size],
                                                    ["Valuation", offer.terms?.valuation],
                                                    ["Equity", offer.terms?.equity != null ? `${offer.terms.equity}%` : null],
                                                    ["Structure", offer.deal_structure]
                                                ].map(([label, value]) => (
                                                    <div key={String(label)}>
                                                        <span className="text-[9px] text-[var(--secondary)]/50 block uppercase">{label}</span>
                                                        <span className="font-mono font-bold">{value || "—"}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {offer.terms?.additional_terms && (
                                                <div className="pt-3 border-t border-[var(--secondary)]/10">
                                                    <span className="text-[9px] text-[var(--secondary)]/50 block uppercase mb-1">Key Terms</span>
                                                    <p className="text-xs font-medium text-[var(--secondary)]/80 line-clamp-3">
                                                        {offer.terms.additional_terms}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--secondary)]/10">
                                                <span className="text-[9px] text-[var(--secondary)]/50">
                                                    {new Date(offer.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                                                </span>
                                                <div className="flex items-center gap-2 text-[9px] font-bold">
                                                    <span className={myAcceptance ? "text-emerald-600" : "text-[var(--secondary)]/40"}>
                                                        You {myAcceptance ? "✓" : "○"}
                                                    </span>
                                                    <span className={otherAccepted ? "text-emerald-600" : "text-[var(--secondary)]/40"}>
                                                        Other {otherAccepted ? "✓" : "○"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="xl:col-span-3 flex flex-col space-y-6 h-[720px]">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="neu-pressed-base rounded-2xl p-4 space-y-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--secondary)]/60 flex items-center gap-1.5">
                                    <Target size={10} className="text-[var(--accent)]" /> Mandate
                                </span>
                                <h3 className="text-xs font-bold line-clamp-1">{deal?.investor_bid_decks?.title || "Direct Pitch"}</h3>
                            </div>
                            <div className="neu-pressed-base rounded-2xl p-4 space-y-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--secondary)]/60 flex items-center gap-1.5">
                                    <FileText size={10} className="text-violet-600" /> Pitch Deck
                                </span>
                                <h3 className="text-xs font-bold line-clamp-1">{deal?.pitch_decks?.title || "Removed"}</h3>
                            </div>
                        </div>

                        <div className="neu-flat-base rounded-3xl p-6 flex-grow flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-3 mb-4 shrink-0">
                                <h2 className="text-sm font-bold flex items-center gap-2">
                                    <MessageSquare size={16} className="text-blue-600" /> Chat
                                </h2>
                                <span className="text-[8px] font-black uppercase tracking-wider text-[var(--secondary)]/40">
                                    Negotiation record
                                </span>
                            </div>

                            <div ref={chatContainerRef} className="flex-grow neu-pressed-base rounded-2xl p-4 flex flex-col space-y-4 overflow-y-auto mb-4 custom-scrollbar">
                                {messages.map((msg) => {
                                    const isSystem = msg.content.startsWith("*System:*");
                                    const isMe = msg.sender_id === session?.user?.id;

                                    if (isSystem) {
                                        return (
                                            <div key={msg.id} className="flex justify-center">
                                                <span className="text-[9px] italic font-medium text-[var(--secondary)]/60 bg-[var(--primary)] px-3 py-1.5 rounded-full text-center max-w-[95%]">
                                                    {msg.content.replace("*System:*", "")}
                                                </span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[88%] rounded-xl px-4 py-2.5 text-xs shadow-md font-medium ${isMe ? "bg-blue-600 text-white rounded-br-sm" : "neu-flat-base rounded-bl-sm"}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <form onSubmit={handleSendMessage} className="relative flex items-center shrink-0">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={chatLocked}
                                    placeholder={chatLocked ? "Accept the connection to chat..." : "Type a negotiation message..."}
                                    className="w-full bg-transparent border-transparent neu-pressed-base shadow-inner focus:ring-1 focus:ring-blue-500 rounded-xl py-3 pl-4 pr-12 text-xs font-medium text-[var(--secondary)] placeholder-[var(--secondary)]/40 outline-none transition disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sendingMsg || chatLocked}
                                    className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50"
                                >
                                    {sendingMsg ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                </button>
                            </form>

                            <div className="mt-4 pt-3 border-t border-[var(--secondary)]/10 flex gap-2">
                                <AlertTriangle size={12} className="text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-[8px] leading-4 text-[var(--secondary)]/50">
                                    The platform records negotiation activity but does not execute, custody, settle, or guarantee financial transactions between the parties.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}