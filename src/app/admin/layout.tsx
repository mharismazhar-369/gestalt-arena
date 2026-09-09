import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin, presence_status")
        .eq("id", user.id)
        .single();

    if (profile?.presence_status === "banned" || profile?.presence_status === "suspended") {
        redirect("/warning");
    }

    // Strict Server-Side Admin Enforcement
    if (profile?.is_admin !== true) {
        redirect("/dashboard");
    }

    return <>{children}</>;
}