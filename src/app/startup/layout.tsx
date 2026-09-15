import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
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

    // 1. Strict Server-Side Ban Enforcement
    if (
        profile?.presence_status === "banned" ||
        profile?.presence_status === "suspended"
    ) {
        redirect("/warning");
    }

    // Normalize role exactly as the main dashboard does to prevent casing bugs.
    const userRole = (profile?.role || "").toLowerCase().trim();

    // 2. Allow Admins and Startups unconditional layout access
    if (userRole === "admin" || userRole === "startup") {
        return { children };
    }

    // 3. Algorithmic Investor Access: True Negative Block
    if (userRole === "investor") {
        const headerList = await headers();

        // strictly check DESTINATION headers, never ORIGIN headers.
        const invokePath = headerList.get("x-invoke-path") || "";
        const nextUrl = headerList.get("next-url") || "";

        const destination = `\({invokePath}\){nextUrl}`.toLowerCase();

        // Only block if they explicitly type the exact URL for startup-only admin tools.
        if (destination.includes("/startup/dashboard") || destination.includes("/startup/pitch/build")) {
            redirect("/dashboard");
        }

        // If the router drops headers during a soft  click, default to ALLOWING them through.
        // The child pitch deck page will handle its own secure data loading.
        return { children };
    }

    // 4. Default fallback for unauthorized role access
    redirect("/dashboard");
}