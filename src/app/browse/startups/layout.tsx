import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Innovative Startups",
  description:
    "Explore high-growth startups, vetted pitch decks, and investable opportunities across tech, AI, healthcare, and fin-tech on Gestalt Arena.",
  alternates: {
    canonical: "/browse/startups",
  },
  openGraph: {
    title: "Browse Innovative Startups | Gestalt Arena",
    description:
      "Explore high-growth startups, vetted pitch decks, and investable opportunities across tech, AI, healthcare, and fin-tech on Gestalt Arena.",
    url: "https://www.gestalt-arena.com/browse/startups",
    siteName: "Gestalt Arena",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Browse Startups on Gestalt Arena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Innovative Startups | Gestalt Arena",
    description:
      "Explore high-growth startups, vetted pitch decks, and investable opportunities across tech, AI, healthcare, and fin-tech on Gestalt Arena.",
    images: ["/og-image.jpg"],
  },
};

export default function BrowseStartupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

