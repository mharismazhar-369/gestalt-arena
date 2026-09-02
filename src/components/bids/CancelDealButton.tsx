"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { XOctagon, Loader2 } from "lucide-react";

export default function CancelDealButton({ dealId }: { dealId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to pull out of this negotiation?")) return;

        setLoading(true);

        const { error } = await supabase
            .from("deal_negotiations")
            .update({ status: "Cancelled" })
            .eq("id", dealId);

        if (!error) {
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition text-xs font-bold disabled:opacity-50"
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <XOctagon size={14} />}
            Cancel Deal
        </button>
    );
}