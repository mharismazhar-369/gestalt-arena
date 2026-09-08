import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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

    // 2. Role Enforcement (Optional but recommended)
    if (profile?.role !== "startup" && profile?.role !== "admin") {
        redirect("/dashboard"); // Sends them back to the router if they aren't a founder
    }

    return <>{children}</>;
}