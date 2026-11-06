import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Gestalt Arena, the premier capital and execution ecosystem connecting high-caliber investors, venture funds, and ambitious startup founders.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Gestalt Arena",
    description:
      "Learn about Gestalt Arena, the premier capital and execution ecosystem connecting high-caliber investors, venture funds, and ambitious startup founders.",
    url: "https://www.gestalt-arena.com/about",
    siteName: "Gestalt Arena",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "About Gestalt Arena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Gestalt Arena",
    description:
      "Learn about Gestalt Arena, the premier capital and execution ecosystem connecting high-caliber investors, venture funds, and ambitious startup founders.",
    images: ["/og-image.jpg"],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

