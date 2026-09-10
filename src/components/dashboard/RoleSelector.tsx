"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Compass, Rocket, Loader2 } from "lucide-react";

export default function RoleSelector({ userId }: { userId?: string }) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleRoleSelection = async (role: "investor" | "startup") => {
        setLoading(role);

        // 1. Fetch user directly on the client to guarantee a valid UUID string
        const { data: { user } } = await supabase.auth.getUser();
        const activeUserId = user?.id || userId;

        if (!activeUserId) {
            setLoading(null);
            alert("Authentication Error: Could not verify user identity.");
            return;
        }

        // 2. Attempt to update the existing profile row
        const { data, error } = await supabase
            .from("profiles")
            .update({ role: role })
            .eq("id", activeUserId)
            .select();

        if (error) {
            console.error("Role Update Error:", error);
            setLoading(null);
            alert(`Database error: ${error.message}`);
            return;
        }

        // 3. If the update succeeded but 0 rows were affected, the profile is missing
        if (!data || data.length === 0) {
            console.warn("No rows updated. Attempting forced upsert...");

            // Failsafe: Upsert the row if it was completely missing
            const { error: upsertError } = await supabase
                .from("profiles")
                .upsert({
                    id: activeUserId,
                    role: role,
                    profile_completed: false,
                    presence_status: 'online'
                });

            if (upsertError) {
                setLoading(null);
                alert(`Critical error: ${upsertError.message}`);
                return;
            }
        }

        // Success: Force a hard browser navigation to break the cache
        window.location.href = `/${role}/dashboard`;
    };

    return (
        <div className="grid md:grid-cols-2 gap-6 pt-4">
            <button
                onClick={() => handleRoleSelection("investor")}
                disabled={!!loading}
                className="trionn-glass rounded-2xl border border-cyan-500/30 p-6 space-y-3 hover:border-cyan-400 transition group text-left disabled:opacity-50 relative"
            >
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
                    {loading === "investor" ? <Loader2 className="animate-spin" size={24} /> : <Compass size={24} />}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300">Investor Account</h3>
                <p className="text-xs text-slate-400">Browse startups, review pitch decks, and allocate capital.</p>
            </button>

            <button
                onClick={() => handleRoleSelection("startup")}
                disabled={!!loading}
                className="trionn-glass rounded-2xl border border-violet-500/30 p-6 space-y-3 hover:border-violet-400 transition group text-left disabled:opacity-50 relative"
            >
                <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 w-fit">
                    {loading === "startup" ? <Loader2 className="animate-spin" size={24} /> : <Rocket size={24} />}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-violet-300">Startup Founder</h3>
                <p className="text-xs text-slate-400">Publish pitch cards, connect with VCs, and track raises.</p>
            </button>
        </div>
    );
}