import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function StartupLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params?: Promise<{ id?: string }>;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, presence_status")
        .eq("id", user.id)
        .single();

    // 1. Strict Server-Side Ban/Suspension Enforcement
    if (profile?.presence_status === "banned" || profile?.presence_status === "suspended") {
        redirect("/warning");
    }

    // 2. Allow Admins and Startups unconditionally
    if (profile?.role === "admin" || profile?.role === "startup") {
        return <>{children}</>;
    }

    // 3. For Investors: Allow them through ONLY if they are viewing a valid pitch deck
    if (profile?.role === "investor") {
        // Resolve params safely if available in this layout segment
        const resolvedParams = params ? await params : {};
        const pitchId = resolvedParams.id;

        if (pitchId) {
            // Check if the pitch deck actually exists in the database
            const { data: deck } = await supabase
                .from("pitch_decks")
                .select("id")
                .eq("id", pitchId)
                .maybeSingle();

            if (deck) {
                return <>{children}</>; // Valid pitch deck view for investor - let them through!
            }
        }
    }

    // Default fallback: redirect unauthorized access back to dashboard
    redirect("/dashboard");
}