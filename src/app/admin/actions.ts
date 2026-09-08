"use server";

import { createClient } from "@supabase/supabase-js";

export async function executeModeration(adminId: string, targetUserId: string, action: 'ban' | 'suspend' | 'restore') {
    // Initialize client with Service Role Key to bypass RLS
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const newStatus = action === 'ban' ? 'banned' : action === 'suspend' ? 'suspended' : 'online';

    // 1. Force update the target user's profile
    const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ presence_status: newStatus })
        .eq("id", targetUserId);

    if (profileError) throw new Error(profileError.message);

    // 2. Dispatch the system notification
    const message = action === 'ban' ? 'Your account has been permanently banned for violating platform guidelines.'
        : action === 'suspend' ? 'Your account has been temporarily suspended pending an administrative review.'
            : 'Your account access has been fully restored. Welcome back to the Arena.';

    await supabaseAdmin.from("notifications").insert({
        user_id: targetUserId,
        actor_id: adminId,
        type: "system_alert",
        message: message
    });

    return { success: true };
}