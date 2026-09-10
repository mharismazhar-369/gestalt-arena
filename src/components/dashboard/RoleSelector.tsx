"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Compass, Rocket, Loader2 } from "lucide-react";

export default function RoleSelector({ userId }: { userId?: string }) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleRoleSelection = async (role: "investor" | "startup") => {
        setLoading(role);

        const { data: { user } } = await supabase.auth.getUser();
        const activeUserId = user?.id || userId;

        if (!activeUserId) {
            setLoading(null);
            alert("Authentication Error: Could not verify user identity.");
            return;
        }

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

        if (!data || data.length === 0) {
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

        window.location.href = `/${role}/dashboard`;
    };

    return (
        <div className="grid md:grid-cols-2 gap-6 pt-4">
            <button
                onClick={() => handleRoleSelection("investor")}
                disabled={!!loading}
                className="neu-pressed-base rounded-2xl p-6 space-y-3 transition-all duration-200 group text-left disabled:opacity-50 relative border border-[var(--secondary)]/5 hover:border-[var(--accent)]/30"
            >
                <div className="p-3 rounded-xl bg-[var(--secondary)]/5 text-[var(--accent)] w-fit">
                    {loading === "investor" ? <Loader2 className="animate-spin" size={24} /> : <Compass size={24} />}
                </div>
                <h3 className="text-lg font-bold text-[var(--secondary)] group-hover:text-[var(--accent)] transition-colors">Investor Account</h3>
                <p className="text-xs text-[var(--secondary)]/70">Browse startups, review pitch decks, and allocate capital.</p>
            </button>

            <button
                onClick={() => handleRoleSelection("startup")}
                disabled={!!loading}
                className="neu-pressed-base rounded-2xl p-6 space-y-3 transition-all duration-200 group text-left disabled:opacity-50 relative border border-[var(--secondary)]/5 hover:border-[var(--accent)]/30"
            >
                <div className="p-3 rounded-xl bg-[var(--secondary)]/5 text-[var(--accent)] w-fit">
                    {loading === "startup" ? <Loader2 className="animate-spin" size={24} /> : <Rocket size={24} />}
                </div>
                <h3 className="text-lg font-bold text-[var(--secondary)] group-hover:text-[var(--accent)] transition-colors">Startup Founder</h3>
                <p className="text-xs text-[var(--secondary)]/70">Publish pitch cards, connect with VCs, and track raises.</p>
            </button>
        </div>
    );
}