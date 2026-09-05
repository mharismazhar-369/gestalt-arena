"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Trash2, Loader2, AlertCircle, ShieldAlert } from "lucide-react";

interface DeleteResourceButtonProps {
    table: "pitch_decks" | "investor_bid_decks" | "deal_negotiations";
    recordId: string;
    itemName: string;
    status?: string; // NEW: Pass the status to check for backend locks
}

export default function DeleteResourceButton({ table, recordId, itemName, status }: DeleteResourceButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmState, setConfirmState] = useState(false);

    // If the database has locked this asset, render the Appeal button instead of Delete
    const isLocked = status === "Accepted" || status === "Closed" || status === "Pending Finalization" || status === "Negotiating";

    if (isLocked) {
        return (
            <a
                href={`mailto:support@gestaltarena.com?subject=Appeal Request - ${itemName} (${recordId})&body=Hello Gestalt Arena Support,%0D%0A%0D%0APlease review my appeal for ${itemName} (ID: ${recordId}).%0D%0A%0D%0AReason for appeal:%0D%0A`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                title="This asset is locked by an active or finalized deal. Click to appeal."
            >
                <ShieldAlert size={14} /> Appeal Decision
            </a>
        );
    }

    const handleDelete = async () => {
        setIsDeleting(true);

        const { error } = await supabase
            .from(table)
            .delete()
            .eq("id", recordId);

        if (!error) {
            router.refresh(); // Instantly removes the item from the UI
        } else {
            setIsDeleting(false);
            setConfirmState(false);
            alert(`Error deleting ${itemName}: ${error.message}`);
        }
    };

    if (confirmState) {
        return (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-xl p-1">
                <span className="text-xs text-rose-400 font-bold px-2 flex items-center gap-1">
                    <AlertCircle size={12} /> Confirm Delete?
                </span>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition"
                >
                    {isDeleting ? <Loader2 size={12} className="animate-spin" /> : "Yes"}
                </button>
                <button
                    onClick={() => setConfirmState(false)}
                    disabled={isDeleting}
                    className="px-3 py-1.5 bg-[var(--primary)] border border-[var(--secondary)]/20 hover:bg-[var(--secondary)]/10 text-[var(--secondary)] text-xs font-bold rounded-lg transition"
                >
                    No
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirmState(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[var(--secondary)]/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
        >
            <Trash2 size={14} /> Delete {itemName}
        </button>
    );
}