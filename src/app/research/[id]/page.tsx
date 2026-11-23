import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ArticleClient from "./ArticleClient";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.gestalt-arena.com";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: article } = await supabase
            .from("articles")
            .select("title, summary, content, author:profiles(nickname, company_name, username)")
            .eq("id", id)
            .maybeSingle();

        if (!article) {
            return {
                title: "Article Not Found | Gestalt Arena",
                description: "This research paper could not be found on Gestalt Arena.",
            };
        }

        const authorData = Array.isArray(article.author) ? article.author[0] : article.author;
        const authorName =
            authorData?.nickname ||
            authorData?.company_name ||
            (authorData?.username ? `@${authorData.username}` : "Arena Member");

        const rawSummary = (article.summary || article.content || "Research paper on Gestalt Arena.")
            .replace(/\s+/g, " ")
            .trim();
        const description =
            rawSummary.length > 160 ? `${rawSummary.slice(0, 157)}...` : rawSummary;

        const ogTitle = `${article.title} — by ${authorName}`;
        const articleUrl = `${SITE_URL}/research/${id}`;

        return {
            title: `${article.title} | Gestalt Arena`,
            description,
            alternates: {
                canonical: `/research/${id}`,
            },
            openGraph: {
                title: ogTitle,
                description,
                url: articleUrl,
                siteName: "Gestalt Arena",
                type: "article",
            },
            twitter: {
                card: "summary_large_image",
                title: ogTitle,
                description,
            },
        };
    } catch {
        return {
            title: "Research Paper | Gestalt Arena",
            description: "Explore startup research, market analyses, and founder insights on Gestalt Arena.",
        };
    }
}

export default async function ResearchArticlePage({ params }: Props) {
    const { id } = await params;

    return <ArticleClient articleId={id} />;
}