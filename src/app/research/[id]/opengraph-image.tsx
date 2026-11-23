import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const alt = "Gestalt Arena Research Paper";
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

    const { data: article } = await supabase
        .from("articles")
        .select("title, summary, category, read_time, author:profiles(nickname, company_name, username, role)")
        .eq("id", id)
        .maybeSingle();

    const authorData = article?.author
        ? Array.isArray(article.author)
            ? article.author[0]
            : article.author
        : null;

    const authorName =
        authorData?.nickname ||
        authorData?.company_name ||
        (authorData?.username ? `@${authorData.username}` : "Arena Member");

    const authorRole =
        authorData?.role === "investor" ? "Investor" : "Startup Founder";

    const title = (article?.title || "Gestalt Arena Research Paper")
        .replace(/\s+/g, " ")
        .trim();
    const displayTitle = title.length > 100 ? `${title.slice(0, 97)}...` : title;

    const rawSummary = (article?.summary || "In-depth market analysis and founder research on Gestalt Arena.")
        .replace(/\s+/g, " ")
        .trim();
    const displaySummary =
        rawSummary.length > 150 ? `${rawSummary.slice(0, 147)}...` : rawSummary;

    const category = (article?.category || "Research").toUpperCase();
    const readTime = article?.read_time || "5 min read";

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
                {/* Top Tag & Read Time */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span
                        style={{
                            backgroundColor: "rgba(225, 29, 72, 0.16)",
                            color: "#fb7185",
                            padding: "8px 18px",
                            borderRadius: "999px",
                            fontSize: "18px",
                            fontWeight: 800,
                            letterSpacing: "1.5px",
                        }}
                    >
                        {category}
                    </span>
                    <span style={{ fontSize: "20px", color: "#9ca3af", fontWeight: 600 }}>
                        {readTime}
                    </span>
                </div>

                {/* Center Title & Summary */}
                <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "auto", marginBottom: "auto" }}>
                    <div
                        style={{
                            fontSize: displayTitle.length > 65 ? "42px" : "50px",
                            lineHeight: 1.2,
                            fontWeight: 900,
                            color: "#ffffff",
                        }}
                    >
                        {displayTitle}
                    </div>
                    <div
                        style={{
                            fontSize: "24px",
                            lineHeight: 1.4,
                            color: "#9ca3af",
                            fontWeight: 500,
                        }}
                    >
                        {displaySummary}
                    </div>
                </div>

                {/* Footer: Author & Brand */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid rgba(255,255,255,0.12)",
                        paddingTop: "24px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div
                            style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "14px",
                                backgroundColor: "#e11d48",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "22px",
                                fontWeight: 900,
                            }}
                        >
                            {authorName.slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff" }}>
                                {authorName}
                            </span>
                            <span style={{ fontSize: "17px", color: "#9ca3af" }}>{authorRole}</span>
                        </div>
                    </div>

                    <span style={{ fontSize: "20px", fontWeight: 800, color: "#e11d48", letterSpacing: "2px" }}>
                        GESTALT ARENA
                    </span>
                </div>
            </div>
        ),
        { ...size }
    );
}