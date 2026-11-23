import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PostCard from "@/components/social/PostCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
    params: Promise<{ id: string }>;
}

// Generate dynamic metadata for social media scrapers
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();

    const { data: post } = await supabase
        .from("posts")
        .select("content, media_url, author:profiles(nickname, company_name)")
        .eq("id", id)
        .single();

    if (!post) {
        return {
            title: "Post Not Found | Gestalt Arena",
        };
    }

    // Handle author whether Supabase returns an array or object
    const authorData = Array.isArray(post.author) ? post.author[0] : post.author;
    const authorName = authorData?.nickname || authorData?.company_name || "Arena Member";
    const snippet = post.content.slice(0, 120) + (post.content.length > 120 ? "..." : "");

    return {
        title: `${authorName} on Gestalt Arena: "${snippet}"`,
        description: post.content,
        openGraph: {
            title: `${authorName} on Gestalt Arena`,
            description: snippet,
            url: `https://www.gestalt-arena.com/feed/${id}`,
            images: post.media_url ? [{ url: post.media_url }] : [{ url: "/og-image.jpg" }],
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: `${authorName} on Gestalt Arena`,
            description: snippet,
            images: post.media_url ? [post.media_url] : ["/og-image.jpg"],
        },
    };
}

export default async function SinglePostPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: post } = await supabase
        .from("posts")
        .select(`
      *,
      author:profiles(*),
      likes(id, user_id),
      dislikes(id, user_id),
      bookmarks(id, user_id),
      comments(count)
    `)
        .eq("id", id)
        .single();

    if (!post) notFound();

    const { data: { user } } = await supabase.auth.getUser();
    const authorData = Array.isArray(post.author) ? post.author[0] : post.author;

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-4 md:px-6 mx-auto max-w-2xl w-full relative z-10 space-y-6">
                <Link href="/feed" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--secondary)]/70 hover:text-[var(--accent)] transition-colors">
                    <ArrowLeft size={14} /> Back to Live Feed
                </Link>

                <PostCard
                    post={{
                        id: post.id,
                        authorName: authorData?.nickname || authorData?.company_name || "Unknown User",
                        authorRole: authorData?.role === "investor" ? "Investor" : "Startup Founder",
                        tier: authorData?.tier || "freemium",
                        timestamp: new Date(post.created_at).toLocaleDateString(),
                        content: post.content,
                        mediaUrl: post.media_url,
                        likesCount: post.likes?.length || 0,
                        dislikesCount: post.dislikes?.length || 0,
                        repostsCount: 0,
                        commentsCount: post.comments?.[0]?.count || 0,
                        tags: [],
                    }}
                    dbPost={post}
                    currentUserId={user?.id}
                />
            </main>

            <Footer />
        </div>
    );
}