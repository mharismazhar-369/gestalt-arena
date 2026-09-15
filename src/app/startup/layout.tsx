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

    // Normalize role exactly as the main dashboard does.
    const userRole = (profile?.role || "").toLowerCase().trim();

    // 2. Allow Admins and Startups unconditional layout access
    if (userRole === "admin" || userRole === "startup") {
        return { children };
    }

    // 3. Algorithmic Investor Access: Negative Block Strategy
    if (profile?.role === "investor") {
        const headerList = await headers();

        // Pool all possible Next.js routing headers to catch both hard reloads and RSC transitions
        const customPath = headerList.get("x-current-path") || "";
        const nextUrl = headerList.get("next-url") || "";
        const invokePath = headerList.get("x-invoke-path") || "";
        const referer = headerList.get("referer") || "";

        const routeSignature = `\({customPath}\){nextUrl} \({invokePath}\){referer}`.toLowerCase();

        // If headers explicitly reveal they are trying to access startup admin tools, block them
        if (routeSignature.includes("/dashboard") || routeSignature.includes("/build")) {
            redirect("/dashboard");
        }

        // Safely allow them through using explicit React Fragment to prevent parsing errors
        return { children };
    }

    // 4. Default fallback for unauthorized role access
    redirect("/dashboard");
}