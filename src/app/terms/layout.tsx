import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Review Gestalt Arena's Terms and Conditions governing marketplace operations, member conduct, mandate bidding, and deal execution.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms and Conditions | Gestalt Arena",
    description:
      "Review Gestalt Arena's Terms and Conditions governing marketplace operations, member conduct, mandate bidding, and deal execution.",
    url: "https://www.gestalt-arena.com/terms",
    siteName: "Gestalt Arena",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms and Conditions | Gestalt Arena",
    description:
      "Review Gestalt Arena's Terms and Conditions governing marketplace operations, member conduct, mandate bidding, and deal execution.",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

