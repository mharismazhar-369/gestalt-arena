"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Compass, Rocket, Loader2 } from "lucide-react";

export default function RoleSelector({ userId }: { userId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const handleRoleSelection = async (role: "investor" | "startup") => {
        setLoading(role);

        // Removed .single() to prevent the JSON coercion crash
        const { data, error } = await supabase
            .from("profiles")
            .update({ role: role })
            .eq("id", userId)
            .select();

        if (error) {
            console.error("Role Update Error:", error);
            setLoading(null);
            alert(`Database error: ${error.message}`);
            return;
        }

        // If the update succeeded but 0 rows were affected, the profile is missing
        if (!data || data.length === 0) {
            console.warn("No rows updated. Attempting forced upsert...");

            // Failsafe: Upsert the row if it was completely missing
            const { error: upsertError } = await supabase
                .from("profiles")
                .upsert({ id: userId, role: role, profile_completed: false, presence_status: 'online' });

            if (upsertError) {
                setLoading(null);
                alert("Critical error: Profile row is missing and could not be created.");
                return;
            }
        }

        // Success: Force a hard browser navigation
        window.location.href = `/${role}/dashboard`;
    };
}