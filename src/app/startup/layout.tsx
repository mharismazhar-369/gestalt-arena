import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

interface StartupLayoutProps {
    children: React.ReactNode;
    params?: Promise<{ id?: string }>;
}

export default async function StartupLayout({
    children,
}: StartupLayoutProps): Promise<React.ReactNode> { // FIX 1: Added <React.ReactNode>
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

    // 1. Strict Server-Side Ban Enforcement
    if (
        profile?.presence_status === "banned" ||
        profile?.presence_status === "suspended"
    ) {
        redirect("/warning");
    }

    // Normalize role to prevent casing mismatches
    const userRole = (profile?.role || "").toLowerCase().trim();

    // 2. Allow Admins and Startups unconditional layout access
    if (userRole === "admin" || userRole === "startup") {
        return <>{children}</>; // FIX 2: Added closing </> tag
    }

    // 3. Allow verified Investors through to view pitch decks (/startup/[id]/pitch)
    if (userRole === "investor") {
        return <>{children}</>; // FIX 3: Added closing </> tag
    }

    // 4. Default fallback for unauthorized role access
    redirect("/dashboard");
}