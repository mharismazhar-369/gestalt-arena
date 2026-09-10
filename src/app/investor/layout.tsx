import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export const dynamic = "force-dynamic";
export default async function InvestorLayout({
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

    // 2. Role Enforcement: Allow ONLY Investors and Admins
    if (profile?.role !== "investor" && profile?.role !== "admin") {
        redirect("/dashboard"); // Sends non-investors back to the main router
    }

    return <>{children}</>;
}