import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research & Market Intelligence",
  description:
    "In-depth research papers, venture capital trends, macroeconomic analyses, and market intelligence published on Gestalt Arena.",
  alternates: {
    canonical: "/research",
  },
  openGraph: {
    title: "Research & Market Intelligence | Gestalt Arena",
    description:
      "In-depth research papers, venture capital trends, macroeconomic analyses, and market intelligence published on Gestalt Arena.",
    url: "https://www.gestalt-arena.com/research",
    siteName: "Gestalt Arena",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Gestalt Arena Research",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Research & Market Intelligence | Gestalt Arena",
    description:
      "In-depth research papers, venture capital trends, macroeconomic analyses, and market intelligence published on Gestalt Arena.",
    images: ["/og-image.jpg"],
  },
};

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

