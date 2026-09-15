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
        return <>{children}</>;
    }

    // 3. Allow Investors to view startup pitch-deck pages
    if (userRole === "investor") {
        const headerList = await headers();
        const currentPath = (headerList.get("x-current-path") || "").trim();

        // Investor is allowed to access ONLY the pitch-deck route
        // inside the startup route tree.
        const isPitchRoute = /^\/startup\/[^/]+\/pitch(?:\/.*)?$/.test(
            currentPath
        );

        if (isPitchRoute) {
            return <>{children}</>;
        }
    }

    // 4. Default fallback for unauthorized role access
    redirect("/dashboard");
}