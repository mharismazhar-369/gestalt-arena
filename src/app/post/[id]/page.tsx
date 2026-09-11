import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PostCard from "@/components/social/PostCard";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(
    props: PageProps
): Promise<Metadata> {
    const params = await props.params;
    const supabase = await createClient();

    const { data: post } = await supabase
        .from("posts")
        .select(`
            content,
            author:profiles(nickname, company_name)
        `)
        .eq("id", params.id)
        .single();

    if (!post) {
        return {
            title: "Post Not Found | Gestalt Arena",
        };
    }

    // Supabase may infer the relationship as an array.
    // Normalize it to a single author object.
    const author = Array.isArray(post.author)
        ? post.author[0]
        : post.author;

    const authorName =
        author?.nickname ||
        author?.company_name ||
        "Arena Member";

    const content =
        typeof post.content === "string"
            ? post.content
            : "";

    const previewText =
        content.substring(0, 150) +
        (content.length > 150 ? "..." : "");

    return {
        title: `${authorName}'s Post | Gestalt Arena`,
        description: previewText,
        openGraph: {
            title: `${authorName}'s Post | Gestalt Arena`,
            description: previewText,
            type: "article",
        },
    };
}

export default async function SinglePostPage(
    props: PageProps
) {
    const params = await props.params;
    const supabase = await createClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const currentUserId = session?.user?.id;

    const { data: post, error } = await supabase
        .from("posts")
        .select(`
            *,
            author:profiles(nickname, company_name, role, tier),
            likes(id, user_id),
            dislikes(id, user_id),
            bookmarks(id, user_id),
            comments(count)
        `)
        .eq("id", params.id)
        .single();

    if (error || !post) {
        notFound();
    }

    // Supabase may infer the profiles relationship as an array.
    // Normalize it before accessing author properties.
    const author = Array.isArray(post.author)
        ? post.author[0]
        : post.author;

    const formattedPost = {
        id: post.id,
        authorName:
            author?.nickname ||
            author?.company_name ||
            "Unknown User",
        authorRole:
            author?.role === "investor"
                ? "Investor"
                : "Startup Founder",
        tier: author?.tier || "freemium",
        timestamp: new Date(post.created_at).toLocaleDateString(),
        content: post.content || "",
        likesCount: post.likes?.length || 0,
        dislikesCount: post.dislikes?.length || 0,
        repostsCount: 0,
        commentsCount: post.comments?.[0]?.count || 0,
        tags: [],
    };

    return (
        <div className="min-h-screen bg-[var(--primary)]">
            <Navbar />

            <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
                <PostCard
                    post={formattedPost}
                    dbPost={post}
                    currentUserId={currentUserId}
                />
            </main>

            <Footer />
        </div>
    );
}