"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Trash2, Loader2, AlertCircle } from "lucide-react";

interface DeleteResourceButtonProps {
    table: "pitch_decks" | "investor_bid_decks" | "deal_negotiations";
    recordId: string;
    itemName: string;
}

export default function DeleteResourceButton({ table, recordId, itemName }: DeleteResourceButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmState, setConfirmState] = useState(false);

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
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
                >
                    No
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirmState(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
        >
            <Trash2 size={14} /> Delete {itemName}
        </button>
    );
}