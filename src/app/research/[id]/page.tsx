import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ArticleClient from "./ArticleClient";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();

    const { data: article } = await supabase
        .from("articles")
        .select("title, summary, image_url")
        .eq("id", id)
        .maybeSingle();

    if (!article) {
        return {
            title: "Article Not Found | Gestalt Arena",
        };
    }

    const description = article.summary || "Research paper on Gestalt Arena.";
    const imageUrl =
        article.image_url ||
        "https://www.gestalt-arena.com/default-og-image.jpg";

    return {
        title: `${article.title} | Gestalt Arena`,
        description,
        openGraph: {
            title: article.title,
            description,
            url: `https://www.gestalt-arena.com/research/${id}`,
            siteName: "Gestalt Arena",
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: article.title,
                },
            ],
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: article.title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function ResearchArticlePage({
    params,
}: Props) {
    const { id } = await params;

    return <ArticleClient articleId={id} />;
}