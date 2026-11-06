import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Review the Gestalt Arena Privacy Policy. Learn how we handle platform data, end-to-end encrypted deal messages, and user information.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Gestalt Arena",
    description:
      "Review the Gestalt Arena Privacy Policy. Learn how we handle platform data, end-to-end encrypted deal messages, and user information.",
    url: "https://www.gestalt-arena.com/privacy",
    siteName: "Gestalt Arena",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Gestalt Arena",
    description:
      "Review the Gestalt Arena Privacy Policy. Learn how we handle platform data, end-to-end encrypted deal messages, and user information.",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

