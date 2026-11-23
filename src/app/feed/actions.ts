"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createFeedPost(content: string, mediaUrl?: string) {
    const trimmedContent = content.trim();
    if (!trimmedContent && !mediaUrl) {
        return { error: "Post cannot be empty." };
    }

    const supabase = await createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: "You must be signed in to publish a post." };
    }

    const { data, error } = await supabase
        .from("posts")
        .insert({
            author_id: user.id,
            content: trimmedContent,
            media_url: mediaUrl || null,
        })
        .select("id")
        .single();

    if (error) {
        return { error: error.message || "Failed to publish post." };
    }

    revalidatePath("/feed");
    return { success: true, id: data.id };
}