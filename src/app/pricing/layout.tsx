import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Membership Tiers",
  description:
    "Explore Gestalt Arena membership tiers. Transparent pricing for founders, angels, and venture capital syndicates looking to scale execution.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing & Membership Tiers | Gestalt Arena",
    description:
      "Explore Gestalt Arena membership tiers. Transparent pricing for founders, angels, and venture capital syndicates looking to scale execution.",
    url: "https://www.gestalt-arena.com/pricing",
    siteName: "Gestalt Arena",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Gestalt Arena Pricing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing & Membership Tiers | Gestalt Arena",
    description:
      "Explore Gestalt Arena membership tiers. Transparent pricing for founders, angels, and venture capital syndicates looking to scale execution.",
    images: ["/og-image.jpg"],
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

