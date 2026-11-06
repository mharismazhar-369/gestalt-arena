import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Notice",
  description: "Account status and administrative compliance notice on Gestalt Arena.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WarningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

