import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regulatory Disclaimers",
  description:
    "Official regulatory, compliance, and legal disclaimers regarding investment activities and representations on Gestalt Arena.",
  alternates: {
    canonical: "/disclaimer",
  },
  openGraph: {
    title: "Regulatory Disclaimers | Gestalt Arena",
    description:
      "Official regulatory, compliance, and legal disclaimers regarding investment activities and representations on Gestalt Arena.",
    url: "https://www.gestalt-arena.com/disclaimer",
    siteName: "Gestalt Arena",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Regulatory Disclaimers | Gestalt Arena",
    description:
      "Official regulatory, compliance, and legal disclaimers regarding investment activities and representations on Gestalt Arena.",
  },
};

export default function DisclaimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

