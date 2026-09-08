import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // 1. Verify Session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 2. Server-side Role Check
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        redirect("/feed");
    }

    return (
        <div className="min-h-screen bg-[#050505] text-[#00f3ff] antialiased">
            {children}
        </div>
    );
}