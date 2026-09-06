"use client";

import { useEffect, useMemo, useState } from "react";
import {
    DollarSign, Activity, PieChart, RefreshCw, XCircle, CheckCircle2, Lock,
    Landmark, FileText, Building, Hash, CreditCard, ShieldAlert, Scale,
    ChevronDown, ChevronUp, Paperclip, Trash2, Info, BriefcaseBusiness
} from "lucide-react";

interface TermSheetPanelProps {
    deal: any;
    offers: any[];
    dealId: string;
    userId?: string;
    timeLeft: string;
    isFullyLocked: boolean;
    onCreateOffer: (terms: any, structure: string, attachments?: any[]) => Promise<boolean>;
    onAcceptOffer: (offerId: string) => Promise<void>;
    onConfirmFunds: (action: "submit_proof" | "confirm_receipt", proof?: { bank: string, mode: string, reference: string }) => void;
    onAppeal: () => void;
}

const DEAL_TYPES = [
    "Equity",
    "SAFE",
    "Convertible Note",
    "Debt",
    "Revenue Share",
    "Acquisition",
    "Strategic Investment",
    "Grant",
    "Asset Acquisition",
    "Secondary Sale",
    "Joint Venture",
    "Other"
];

const CURRENCIES = ["USD", "EUR", "GBP", "PKR", "AED", "SAR", "CAD", "AUD", "SGD"];

const inputClass = "w-full bg-transparent border-transparent neu-pressed-base shadow-inner rounded-xl p-3.5 text-sm font-mono font-bold text-[var(--secondary)] focus:ring-1 focus:ring-blue-500 focus:outline-none transition disabled:opacity-50";
const smallInputClass = "w-full bg-transparent border border-[var(--secondary)]/10 rounded-lg p-2.5 text-xs font-medium text-[var(--secondary)] outline-none focus:border-blue-500 disabled:opacity-50";
const labelClass = "text-[9px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider flex items-center gap-1.5 mb-1.5";

export default function TermSheetPanel({
    deal, offers, dealId, userId, timeLeft, isFullyLocked,
    onCreateOffer, onAcceptOffer, onConfirmFunds, onAppeal
}: TermSheetPanelProps) {
    const isFounder = userId === deal?.startup_id;
    const dealClosed = !!deal?.deal_maker_offer_id || ["Accepted", "Rejected", "Cancelled"].includes(deal?.status) || isFullyLocked;
    const activeOffer = offers.length ? offers[offers.length - 1] : null;

    const [structure, setStructure] = useState(deal?.deal_structure || activeOffer?.deal_structure || "Equity");
    const [expanded, setExpanded] = useState<string[]>(["headline", "structure"]);
    const [updating, setUpdating] = useState(false);
    const [showProofForm, setShowProofForm] = useState(false);
    const [transferProof, setTransferProof] = useState({ bank: "", mode: "Wire Transfer", reference: "" });
    const [attachments, setAttachments] = useState<File[]>([]);

    const [terms, setTerms] = useState<any>({
        currency: "USD",
        ticket_size: deal?.proposed_valuation ? deal.ticket_size || 0 : 0,
        valuation: deal?.proposed_valuation || 0,
        equity: deal?.proposed_equity || 0,
        funding_goal: deal?.pitch_decks?.funding_goal || 0,
        minimum_investment: deal?.investor_bid_decks?.min_arr || 0,
        maximum_investment: deal?.investor_bid_decks?.max_allocation || 0,
        round: "",
        share_class: "Preferred",
        price_per_share: 0,
        shares: 0,
        fully_diluted_ownership: 0,
        valuation_cap: 0,
        discount_percent: 0,
        interest_rate: 0,
        maturity_months: 0,
        grace_period_months: 0,
        repayment_frequency: "Monthly",
        security_collateral: "",
        revenue_share_percent: 0,
        repayment_cap: 0,
        transaction_value: 0,
        cash_consideration: 0,
        stock_consideration: 0,
        earn_out: 0,
        earn_out_period_months: 0,
        acquisition_scope: "Share Acquisition",
        board_seat: false,
        board_observer: false,
        pro_rata_rights: false,
        information_rights: true,
        voting_rights: "Standard",
        liquidation_preference: "1x Non-Participating",
        anti_dilution: "None",
        rofr: false,
        tag_along: false,
        drag_along: false,
        founder_vesting: "",
        esop_pool: 0,
        closing_date: "",
        tranche_count: 1,
        conditions_precedent: "",
        additional_terms: "",
        clauses: []
    });

    useEffect(() => {
        const source = activeOffer?.terms || {};
        setStructure(deal?.deal_structure || activeOffer?.deal_structure || source.deal_structure || "Equity");
        setTerms((prev: any) => ({ ...prev, ...source }));
    }, [deal?.deal_structure, activeOffer?.id]);

    const set = (key: string, value: any) => setTerms((prev: any) => ({ ...prev, [key]: value }));

    const toggleSection = (key: string) =>
        setExpanded((prev) => prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]);

    // FIX: Correctly assess if the form is dirty, explicitly allowing the very first offer to pass
    const latestTerms = activeOffer?.terms || {};
    const isDirty = offers.length === 0 ||
        structure !== activeOffer?.deal_structure ||
        JSON.stringify(terms) !== JSON.stringify({ ...terms, ...latestTerms });

    const platformFee = Number(terms.ticket_size || terms.transaction_value || 0) * 0.02;

    const validateFiles = (files: FileList | null) => {
        if (!files) return;
        const accepted: File[] = [];
        for (const file of Array.from(files)) {
            const validType = file.type === "application/pdf" || file.type === "image/png";
            const validSize = file.size <= 2 * 1024 * 1024;
            if (!validType) {
                alert(`${file.name}: only PDF and PNG files are allowed.`);
                continue;
            }
            if (!validSize) {
                alert(`${file.name}: maximum file size is 2 MB.`);
                continue;
            }
            accepted.push(file);
        }
        setAttachments((prev) => [...prev, ...accepted].slice(0, 5));
    };

    const handleCounter = async () => {
        if (dealClosed || updating) return;

        if (!isDirty) {
            alert("Change at least one term before submitting a new counter offer.");
            return;
        }

        setUpdating(true);
        const metadata = attachments.map((file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
            note: "Attachment selected locally. Upload storage integration should use the approved deal-offer bucket."
        }));

        const success = await onCreateOffer({ ...terms, deal_structure: structure }, structure, metadata);
        if (success) {
            setAttachments([]);
        }
        setUpdating(false);
    };

    const handleAcceptLatest = async () => {
        if (!activeOffer || dealClosed || updating) return;
        if (activeOffer.sender_id === userId) {
            alert("You cannot accept your own counter offer.");
            return;
        }

        const confirmed = confirm(
            `Accept Counter Offer #${activeOffer.offer_number}?\n\n` +
            `This records your acceptance. The offer becomes the Deal Maker only after the other party also accepts it.`
        );

        if (!confirmed) return;

        setUpdating(true);
        await onAcceptOffer(activeOffer.id);
        setUpdating(false);
    };

    const submitProof = () => {
        if (!transferProof.bank || !transferProof.reference) return;
        setUpdating(true);
        onConfirmFunds("submit_proof", transferProof);
        setUpdating(false);
    };

    const Section = ({ id, title, icon: Icon, children }: any) => {
        const open = expanded.includes(id);
        return (
            <div className="border border-[var(--secondary)]/10 rounded-2xl overflow-hidden">
                <button
                    type="button"
                    onClick={() => toggleSection(id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--secondary)]/[0.03] transition"
                >
                    <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                        <Icon size={13} className="text-blue-600" /> {title}
                    </span>
                    {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {open && <div className="p-4 pt-0 space-y-4">{children}</div>}
            </div>
        );
    };

    return (
        <div className="neu-flat-base p-6 relative overflow-hidden h-full flex flex-col rounded-3xl">
            <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4 mb-5">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Activity size={18} className={isFounder ? "text-violet-600" : "text-[var(--accent)]"} />
                        Transaction Term Sheet
                    </h2>
                    <p className="text-[9px] text-[var(--secondary)]/50 font-medium mt-1">
                        Role-aware financial negotiation controls
                    </p>
                </div>
                {dealClosed ? <Lock size={15} className="text-rose-600" /> : <RefreshCw size={15} className="text-emerald-600" />}
            </div>

            <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-1">
                <div className="neu-pressed-base rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[var(--secondary)]/50">Negotiation Snapshot</span>
                        <span className="text-[9px] font-black text-blue-600 uppercase">{isFounder ? "Founder / Startup" : "Investor"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-[9px] text-[var(--secondary)]/50 block uppercase">Agreed / Proposed Amount</span>
                            <span className="text-xl font-mono font-black">
                                {terms.currency} {Number(terms.ticket_size || terms.transaction_value || 0).toLocaleString()}
                            </span>
                        </div>
                        <div>
                            <span className="text-[9px] text-[var(--secondary)]/50 block uppercase">Equity</span>
                            <span className="text-xl font-mono font-black">{terms.equity || 0}%</span>
                        </div>
                    </div>
                </div>

                <Section id="structure" title="Deal Structure" icon={BriefcaseBusiness}>
                    <div>
                        <label className={labelClass}>Transaction Type</label>
                        <select value={structure} disabled={dealClosed} onChange={(e) => setStructure(e.target.value)} className={smallInputClass}>
                            {DEAL_TYPES.map((type) => <option key={type}>{type}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Currency</label>
                            <select value={terms.currency} disabled={dealClosed} onChange={(e) => set("currency", e.target.value)} className={smallInputClass}>
                                {CURRENCIES.map((currency) => <option key={currency}>{currency}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Funding Round</label>
                            <input value={terms.round} disabled={dealClosed} onChange={(e) => set("round", e.target.value)} placeholder="Seed / Series A" className={smallInputClass} />
                        </div>
                    </div>
                </Section>

                <Section id="headline" title="Headline Financial Terms" icon={DollarSign}>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Investment / Transaction Amount</label>
                            <input type="number" min="0" value={terms.ticket_size} disabled={dealClosed} onChange={(e) => set("ticket_size", Number(e.target.value))} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Funding Goal</label>
                            <input type="number" min="0" value={terms.funding_goal} disabled={dealClosed} onChange={(e) => set("funding_goal", Number(e.target.value))} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Pre-Money Valuation</label>
                            <input type="number" min="0" value={terms.valuation} disabled={dealClosed} onChange={(e) => set("valuation", Number(e.target.value))} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Post-Money Valuation</label>
                            <input type="number" min="0" value={terms.post_money_valuation || (Number(terms.valuation) + Number(terms.ticket_size))} disabled={dealClosed} onChange={(e) => set("post_money_valuation", Number(e.target.value))} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}><PieChart size={10} /> Equity Stake (%)</label>
                            <input type="number" min="0" max="100" step="0.01" value={terms.equity} disabled={dealClosed} onChange={(e) => set("equity", Number(e.target.value))} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Maximum Dilution (%)</label>
                            <input type="number" min="0" max="100" step="0.01" value={terms.maximum_dilution || 0} disabled={dealClosed} onChange={(e) => set("maximum_dilution", Number(e.target.value))} className={inputClass} />
                        </div>
                    </div>
                </Section>

                {(structure === "Equity" || structure === "Strategic Investment" || structure === "Secondary Sale") && (
                    <Section id="equity" title="Equity & Ownership" icon={PieChart}>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Share Class</label>
                                <select value={terms.share_class} disabled={dealClosed} onChange={(e) => set("share_class", e.target.value)} className={smallInputClass}>
                                    <option>Common</option><option>Preferred</option><option>Preferred A</option><option>Preferred B</option><option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Price / Share</label>
                                <input type="number" min="0" value={terms.price_per_share} disabled={dealClosed} onChange={(e) => set("price_per_share", Number(e.target.value))} className={smallInputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Shares Issued / Transferred</label>
                                <input type="number" min="0" value={terms.shares} disabled={dealClosed} onChange={(e) => set("shares", Number(e.target.value))} className={smallInputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Fully Diluted Ownership (%)</label>
                                <input type="number" min="0" max="100" value={terms.fully_diluted_ownership} disabled={dealClosed} onChange={(e) => set("fully_diluted_ownership", Number(e.target.value))} className={smallInputClass} />
                            </div>
                        </div>
                    </Section>
                )}

                {(structure === "SAFE" || structure === "Convertible Note") && (
                    <Section id="convertible" title="Convertible / SAFE Terms" icon={Scale}>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Valuation Cap</label>
                                <input type="number" min="0" value={terms.valuation_cap} disabled={dealClosed} onChange={(e) => set("valuation_cap", Number(e.target.value))} className={smallInputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Discount (%)</label>
                                <input type="number" min="0" max="100" value={terms.discount_percent} disabled={dealClosed} onChange={(e) => set("discount_percent", Number(e.target.value))} className={smallInputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Interest Rate (%)</label>
                                <input type="number" min="0" value={terms.interest_rate} disabled={dealClosed} onChange={(e) => set("interest_rate", Number(e.target.value))} className={smallInputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Maturity (Months)</label>
                                <input type="number" min="0" value={terms.maturity_months} disabled={dealClosed} onChange={(e) => set("maturity_months", Number(e.target.value))} className={smallInputClass} />
                            </div>
                        </div>
                    </Section>
                )}

                {structure === "Debt" && (
                    <Section id="debt" title="Debt Terms" icon={Landmark}>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Principal</label>
                                <input type="number" min="0" value={terms.ticket_size} disabled={dealClosed} onChange={(e) => set("ticket_size", Number(e.target.value))} className={smallInputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Interest Rate (%)</label>
                                <input type="number" min="0" value={terms.interest_rate} disabled={dealClosed} onChange={(e) => set("interest_rate", Number(e.target.value))} className={smallInputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Tenor (Months)</label>
                                <input type="number" min="0" value={terms.maturity_months} disabled={dealClosed} onChange={(e) => set("maturity_months", Number(e.target.value))} className={smallInputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Grace Period (Months)</label>
                                <input type="number" min="0" value={terms.grace_period_months} disabled={dealClosed} onChange={(e) => set("grace_period_months", Number(e.target.value))} className={smallInputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Repayment Frequency</label>
                                <select value={terms.repayment_frequency} disabled={dealClosed} onChange={(e) => set("repayment_frequency", e.target.value)} className={smallInputClass}>
                                    <option>Monthly</option><option>Quarterly</option><option>Biannual</option><option>Annual</option><option>Bullet</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Security / Collateral</label>
                                <input value={terms.security_collateral} disabled={dealClosed} onChange={(e) => set("security_collateral", e.target.value)} placeholder="Unsecured / Asset-backed" className={smallInputClass} />
                            </div>
                        </div>
                    </Section>
                )}

                {structure === "Revenue Share" && (
                    <Section id="revenue" title="Revenue Share Terms" icon={Activity}>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Capital Provided</label>
                                <input type="number" min="0" value={terms.ticket_size} disabled={dealClosed} onChange={(e) => set("ticket_size", Number(e.target.value))} className={smallInputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Revenue Share (%)</label>
                                <input type="number" min="0" max="100" step="0.01" value={terms.revenue_share_percent} disabled={dealClosed} onChange={(e) => set("revenue_share_percent", Number(e.target.value))} className={smallInputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Repayment Cap</label>
                                <input type="number" min="0" value={terms.repayment_cap} disabled={dealClosed} onChange={(e) => set("repayment_cap", Number(e.target.value))} className={smallInputClass} />
                            </div>
                        </div>
                    </Section>
                )}

                {structure.includes("Acquisition") || structure === "Acquisition" ? (
                    <Section id="acquisition" title="Acquisition Terms" icon={Building}>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Transaction Value</label>
                                <input type="number" min="0" value={terms.transaction_value} disabled={dealClosed} onChange={(e) => set("transaction_value", Number(e.target.value))} className={smallInputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Acquisition Scope</label>
                                <select value={terms.acquisition_scope} disabled={dealClosed} onChange={(e) => set("acquisition_scope", e.target.value)} className={smallInputClass}>
                                    <option>Share Acquisition</option><option>Asset Acquisition</option><option>100% Acquisition</option><option>Majority Acquisition</option><option>Minority Acquisition</option><option>Merger</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Cash Consideration</label>
                                <input type="number" min="0" value={terms.cash_consideration} disabled={dealClosed} onChange={(e) => set("cash_consideration", Number(e.target.value))} className={smallInputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Stock Consideration</label>
                                <input type="number" min="0" value={terms.stock_consideration} disabled={dealClosed} onChange={(e) => set("stock_consideration", Number(e.target.value))} className={smallInputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Earn-out</label>
                                <input type="number" min="0" value={terms.earn_out} disabled={dealClosed} onChange={(e) => set("earn_out", Number(e.target.value))} className={smallInputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Earn-out Period (Months)</label>
                                <input type="number" min="0" value={terms.earn_out_period_months} disabled={dealClosed} onChange={(e) => set("earn_out_period_months", Number(e.target.value))} className={smallInputClass} />
                            </div>
                        </div>
                    </Section>
                ) : null}

                <Section id="governance" title={isFounder ? "Founder / Startup Controls" : "Investor Protection & Governance"} icon={ShieldAlert}>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 text-[10px] font-bold">
                            <input type="checkbox" checked={terms.board_seat} disabled={dealClosed} onChange={(e) => set("board_seat", e.target.checked)} /> Board Seat
                        </label>
                        <label className="flex items-center gap-2 text-[10px] font-bold">
                            <input type="checkbox" checked={terms.board_observer} disabled={dealClosed} onChange={(e) => set("board_observer", e.target.checked)} /> Board Observer
                        </label>
                        <label className="flex items-center gap-2 text-[10px] font-bold">
                            <input type="checkbox" checked={terms.pro_rata_rights} disabled={dealClosed} onChange={(e) => set("pro_rata_rights", e.target.checked)} /> Pro-rata Rights
                        </label>
                        <label className="flex items-center gap-2 text-[10px] font-bold">
                            <input type="checkbox" checked={terms.information_rights} disabled={dealClosed} onChange={(e) => set("information_rights", e.target.checked)} /> Information Rights
                        </label>
                        <label className="flex items-center gap-2 text-[10px] font-bold">
                            <input type="checkbox" checked={terms.rofr} disabled={dealClosed} onChange={(e) => set("rofr", e.target.checked)} /> ROFR
                        </label>
                        <label className="flex items-center gap-2 text-[10px] font-bold">
                            <input type="checkbox" checked={terms.tag_along} disabled={dealClosed} onChange={(e) => set("tag_along", e.target.checked)} /> Tag Along
                        </label>
                        <label className="flex items-center gap-2 text-[10px] font-bold">
                            <input type="checkbox" checked={terms.drag_along} disabled={dealClosed} onChange={(e) => set("drag_along", e.target.checked)} /> Drag Along
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Voting Rights</label>
                            <select value={terms.voting_rights} disabled={dealClosed} onChange={(e) => set("voting_rights", e.target.value)} className={smallInputClass}>
                                <option>Standard</option><option>Enhanced</option><option>None</option><option>As Defined in Terms</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Liquidation Preference</label>
                            <select value={terms.liquidation_preference} disabled={dealClosed} onChange={(e) => set("liquidation_preference", e.target.value)} className={smallInputClass}>
                                <option>None</option><option>1x Non-Participating</option><option>1x Participating</option><option>2x Non-Participating</option><option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Anti-Dilution</label>
                            <select value={terms.anti_dilution} disabled={dealClosed} onChange={(e) => set("anti_dilution", e.target.value)} className={smallInputClass}>
                                <option>None</option><option>Broad-Based Weighted Average</option><option>Narrow-Based Weighted Average</option><option>Full Ratchet</option><option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Founder Vesting</label>
                            <input value={terms.founder_vesting} disabled={dealClosed} onChange={(e) => set("founder_vesting", e.target.value)} placeholder="e.g. 4 years / 1 year cliff" className={smallInputClass} />
                        </div>
                    </div>
                </Section>

                <Section id="closing" title="Closing & Conditions" icon={Landmark}>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Expected Closing Date</label>
                            <input type="date" value={terms.closing_date} disabled={dealClosed} onChange={(e) => set("closing_date", e.target.value)} className={smallInputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Funding Tranches</label>
                            <input type="number" min="1" value={terms.tranche_count} disabled={dealClosed} onChange={(e) => set("tranche_count", Number(e.target.value))} className={smallInputClass} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Conditions Precedent</label>
                        <textarea rows={3} value={terms.conditions_precedent} disabled={dealClosed} onChange={(e) => set("conditions_precedent", e.target.value)} placeholder="Due diligence, approvals, documentation, etc." className={`${smallInputClass} resize-none`} />
                    </div>
                </Section>

                <Section id="legal" title="Terms & Conditions" icon={FileText}>
                    <textarea
                        rows={5}
                        value={terms.additional_terms}
                        disabled={dealClosed}
                        onChange={(e) => set("additional_terms", e.target.value)}
                        placeholder="Enter commercial terms, obligations, conditions and agreed clauses..."
                        className={`${smallInputClass} resize-none`}
                    />
                    <div className="bg-blue-600/5 border border-blue-600/15 rounded-xl p-3 flex gap-2">
                        <Info size={13} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-[9px] leading-4 text-[var(--secondary)]/60">
                            These are negotiation terms, not legal advice or a platform-executed financial contract. The parties remain responsible for their own definitive agreements and transactions outside the platform.
                        </p>
                    </div>
                </Section>

                <Section id="attachments" title="Supporting Documents" icon={Paperclip}>
                    <input
                        type="file"
                        accept="application/pdf,image/png"
                        multiple
                        disabled={dealClosed}
                        onChange={(e) => validateFiles(e.target.files)}
                        className="w-full text-[10px] font-medium text-[var(--secondary)]/70"
                    />
                    <p className="text-[8px] text-[var(--secondary)]/50">PDF or PNG only. Maximum 2 MB each. Up to 5 files per offer.</p>

                    {attachments.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="flex items-center justify-between neu-pressed-base rounded-lg p-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                                <Paperclip size={11} className="text-blue-600 shrink-0" />
                                <span className="text-[9px] font-bold truncate">{file.name}</span>
                            </div>
                            <button type="button" onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))} className="text-rose-600">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </Section>

                <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4 space-y-1">
                    <div className="flex items-center justify-between text-blue-600">
                        <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"><Landmark size={12} /> Platform Facilitation Fee (2%)</span>
                        <span className="font-mono font-bold">{terms.currency} {platformFee.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] font-medium text-[var(--secondary)]/60 pt-1">
                        Calculated at 2% of the amount agreed for investment / transaction. The platform does not process, custody or settle these funds.
                    </p>
                </div>

                {deal.status === "Pending Finalization" && !isFullyLocked && (
                    <div className="space-y-4 pt-5 border-t border-amber-600/20 bg-amber-600/5 p-5 rounded-xl">
                        <div className="text-center space-y-1">
                            <h4 className="text-sm font-bold text-amber-600">24-Hour Closing Window</h4>
                            <p className="text-[10px] text-[var(--secondary)]/70 uppercase tracking-wider">
                                Time remaining: <span className="font-mono font-bold">{timeLeft}</span>
                            </p>
                        </div>

                        {!isFounder && !showProofForm && (
                            <button onClick={() => setShowProofForm(true)} className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 text-xs font-bold transition">
                                <CheckCircle2 size={14} /> I Have Issued the Funds
                            </button>
                        )}

                        {!isFounder && showProofForm && (
                            <div className="bg-[var(--primary)] p-4 rounded-xl border border-blue-600/30 space-y-4">
                                <h5 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Transfer Notice</h5>
                                <div>
                                    <label className={labelClass}><Building size={10} /> Issuing Bank</label>
                                    <input type="text" value={transferProof.bank} onChange={(e) => setTransferProof({ ...transferProof, bank: e.target.value })} placeholder="Bank name" className={smallInputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}><CreditCard size={10} /> Transfer Mode</label>
                                    <select value={transferProof.mode} onChange={(e) => setTransferProof({ ...transferProof, mode: e.target.value })} className={smallInputClass}>
                                        <option>Wire Transfer</option><option>ACH</option><option>Crypto (USDC/USDT)</option><option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}><Hash size={10} /> Reference / TXID</label>
                                    <input type="text" value={transferProof.reference} onChange={(e) => setTransferProof({ ...transferProof, reference: e.target.value })} placeholder="Reference or TXID" className={smallInputClass} />
                                </div>
                                <button onClick={submitProof} disabled={!transferProof.bank || !transferProof.reference || updating} className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2.5 text-[10px] font-bold disabled:opacity-50">
                                    {updating ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Record Transfer Notice
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {deal.status === "Awaiting Receipt Confirmation" && (
                    <div className="space-y-4 pt-5 border-t border-blue-600/20 bg-blue-600/5 p-5 rounded-xl">
                        <div className="text-center">
                            <h4 className="text-sm font-bold text-blue-600">Funds Transfer Notice Recorded</h4>
                            <p className="text-[10px] text-[var(--secondary)]/70 mt-1">
                                {isFounder ? "Confirm only if funds have actually arrived in your external account." : "Waiting for the founder to confirm receipt."}
                            </p>
                        </div>

                        {isFounder && (
                            <>
                                <button onClick={() => onConfirmFunds("confirm_receipt")} className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 text-xs font-bold">
                                    <CheckCircle2 size={14} /> Confirm External Receipt
                                </button>
                                <button onClick={onAppeal} className="w-full flex items-center justify-center gap-2 bg-transparent text-rose-600 border border-rose-600/30 hover:bg-rose-600/10 rounded-xl px-4 py-3 text-xs font-bold">
                                    <ShieldAlert size={14} /> Did Not Receive / Record Dispute
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {!dealClosed && deal.status !== "Pending Finalization" && (
                <div className="mt-6 space-y-3 pt-5 border-t border-[var(--secondary)]/10 shrink-0">
                    {activeOffer && activeOffer.sender_id !== userId && (
                        <button
                            onClick={handleAcceptLatest}
                            disabled={updating}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 text-xs font-bold disabled:opacity-50"
                        >
                            {updating ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            Accept Counter Offer #{activeOffer.offer_number}
                        </button>
                    )}

                    <button
                        onClick={handleCounter}
                        disabled={updating || !isDirty}
                        className="w-full flex items-center justify-center gap-2 neu-btn px-4 py-3 text-xs disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={updating ? "animate-spin" : ""} /> Submit New Counter Offer
                    </button>

                    {isDirty && (
                        <p className="text-[9px] text-amber-600 font-bold text-center">
                            You are editing a new immutable offer snapshot. Nothing changes until you submit it.
                        </p>
                    )}
                </div>
            )}

            {dealClosed && (
                <div className="mt-6 pt-5 border-t border-emerald-600/20 text-center shrink-0">
                    <div className="flex justify-center items-center gap-2 text-emerald-600 text-xs font-black uppercase">
                        <Lock size={14} /> Governing Deal Terms Locked
                    </div>
                    <p className="text-[9px] text-[var(--secondary)]/50 mt-1">
                        The Deal Maker remains preserved as the governing negotiation record.
                    </p>
                </div>
            )}
        </div>
    );
}