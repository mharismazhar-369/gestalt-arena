import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Gestalt Arena | Where Capital Meets Execution",
  description:
    "The premier matchmaking marketplace connecting strategic investors, founders, and groundbreaking startups globally.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Gestalt Arena | Where Capital Meets Execution",
    description:
      "The premier matchmaking marketplace connecting strategic investors, founders, and groundbreaking startups globally.",
    url: "https://www.gestalt-arena.com",
    siteName: "Gestalt Arena",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Gestalt Arena — Where Capital Meets Execution",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gestalt Arena | Where Capital Meets Execution",
    description:
      "The premier matchmaking marketplace connecting strategic investors, founders, and groundbreaking startups globally.",
    images: ["/og-image.jpg"],
  },
};

export default function Home() {
  return <LandingPage />;
}
