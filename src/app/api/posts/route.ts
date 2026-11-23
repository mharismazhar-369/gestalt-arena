import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const trimmedContent = typeof body?.content === "string" ? body.content.trim() : "";
        const mediaUrl =
            typeof body?.mediaUrl === "string" && body.mediaUrl.trim() ? body.mediaUrl.trim() : null;

        if (!trimmedContent && !mediaUrl) {
            return NextResponse.json({ error: "Post cannot be empty." }, { status: 400 });
        }

        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "You must be signed in to publish a post." }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("posts")
            .insert({
                author_id: user.id,
                content: trimmedContent,
                media_url: mediaUrl,
            })
            .select("id")
            .single();

        if (error) {
            return NextResponse.json({ error: error.message || "Failed to publish post." }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data.id }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Server error creating post." }, { status: 500 });
    }
}