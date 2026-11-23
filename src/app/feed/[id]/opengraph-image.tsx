import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const alt = "Gestalt Arena Post";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export default async function Image({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: post } = await supabase
        .from("posts")
        .select("content, author:profiles(nickname, company_name, username, role)")
        .eq("id", id)
        .maybeSingle();

    const authorData = post?.author
        ? Array.isArray(post.author)
            ? post.author[0]
            : post.author
        : null;

    const authorName =
        authorData?.nickname ||
        authorData?.company_name ||
        (authorData?.username ? `@${authorData.username}` : "Arena Member");

    const authorRole =
        authorData?.role === "investor" ? "Investor" : "Startup Founder";

    const rawText = (post?.content || "Join the conversation on Gestalt Arena.")
        .replace(/\s+/g, " ")
        .trim();
    const displayText =
        rawText.length > 240 ? `${rawText.slice(0, 237)}...` : rawText;

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "#0b0d12",
                    color: "#f4f4f6",
                    padding: "64px",
                    fontFamily: "sans-serif",
                    border: "2px solid rgba(255,255,255,0.08)",
                }}
            >
                {/* Header: Author Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div
                        style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "18px",
                            backgroundColor: "#e11d48",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "26px",
                            fontWeight: 900,
                        }}
                    >
                        {authorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "30px", fontWeight: 800, color: "#ffffff" }}>
                            {authorName}
                        </span>
                        <span style={{ fontSize: "20px", color: "#9ca3af", marginTop: "4px" }}>
                            {authorRole} • Gestalt Arena
                        </span>
                    </div>
                </div>

                {/* Center: Post Text */}
                <div
                    style={{
                        display: "flex",
                        fontSize: displayText.length > 140 ? "34px" : "42px",
                        lineHeight: 1.35,
                        fontWeight: 600,
                        color: "#e5e7eb",
                        marginTop: "24px",
                        marginBottom: "24px",
                    }}
                >
                    “{displayText}”
                </div>

                {/* Footer: Brand */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid rgba(255,255,255,0.12)",
                        paddingTop: "24px",
                        fontSize: "20px",
                        color: "#9ca3af",
                    }}
                >
                    <span style={{ fontWeight: 800, color: "#e11d48", letterSpacing: "2px" }}>
                        GESTALT ARENA
                    </span>
                    <span>www.gestalt-arena.com</span>
                </div>
            </div>
        ),
        { ...size }
    );
}