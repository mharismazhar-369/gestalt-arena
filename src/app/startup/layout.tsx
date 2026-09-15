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
    if (profile?.presence_status === "banned" || profile?.presence_status === "suspended") {
        redirect("/warning");
    }

    // 2. Allow Admins and Startups unconditional layout access
    if (profile?.role === "admin" || profile?.role === "startup") {
        return <>{children}</>;
    }

            // 3. Algorithmic Investor Access: Read path from Middleware headers
            if (profile?.role === "investor") {
        const headerList = await headers();
            const currentPath = headerList.get("x-current-path") || "";

            // Verify the Investor is strictly accessing a pitch deck view
            const isPitchRoute = /\/startup\/[^/]+\/pitch/.test(currentPath);

            if (isPitchRoute) {
            return <>{children}</>; 
        }
    }

            // Default fallback: Redirect unauthorized role attempts to dashboard
            redirect("/dashboard");
}