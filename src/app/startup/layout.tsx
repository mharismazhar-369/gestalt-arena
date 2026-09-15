import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers"; // <-- FIXED: headers comes from next/headers
import React from "react";

export default async function StartupLayout({
    children,
}: {
    children: React.ReactNode;
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

    // Check if the current route is a public pitch viewing page (e.g., /startup/[id]/pitch)
    const headersList = await headers();
    const pathname = headersList.get("x-invoke-path") || headersList.get("referer") || "";
    const isViewingPitch = pathname.includes("/pitch");

    // 2. Role Enforcement: Allow founders/admins, AND allow investors if they are viewing a pitch
    const isFounderOrAdmin = profile?.role === "startup" || profile?.role === "admin";
    const isInvestorViewing = profile?.role === "investor" && isViewingPitch;

    if (!isFounderOrAdmin && !isInvestorViewing) {
        redirect("/dashboard"); // Sends unauthorized roles back to dashboard
    }

    return <>{children}</>;
}