import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arena Feed & Strategic Discussions",
  description:
    "Join discussions, market analyses, and founder updates on the Gestalt Arena real-time community feed.",
  alternates: {
    canonical: "/feed",
  },
  openGraph: {
    title: "Arena Feed & Strategic Discussions | Gestalt Arena",
    description:
      "Join discussions, market analyses, and founder updates on the Gestalt Arena real-time community feed.",
    url: "https://www.gestalt-arena.com/feed",
    siteName: "Gestalt Arena",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Gestalt Arena Feed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arena Feed & Strategic Discussions | Gestalt Arena",
    description:
      "Join discussions, market analyses, and founder updates on the Gestalt Arena real-time community feed.",
    images: ["/og-image.jpg"],
  },
};

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

