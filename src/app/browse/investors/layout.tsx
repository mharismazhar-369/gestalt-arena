import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Strategic Investors & Venture Funds",
  description:
    "Discover active angel investors, family offices, and venture capital firms looking to deploy capital on Gestalt Arena.",
  alternates: {
    canonical: "/browse/investors",
  },
  openGraph: {
    title: "Browse Strategic Investors & Venture Funds | Gestalt Arena",
    description:
      "Discover active angel investors, family offices, and venture capital firms looking to deploy capital on Gestalt Arena.",
    url: "https://www.gestalt-arena.com/browse/investors",
    siteName: "Gestalt Arena",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Browse Investors on Gestalt Arena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Strategic Investors & Venture Funds | Gestalt Arena",
    description:
      "Discover active angel investors, family offices, and venture capital firms looking to deploy capital on Gestalt Arena.",
    images: ["/og-image.jpg"],
  },
};

export default function BrowseInvestorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

