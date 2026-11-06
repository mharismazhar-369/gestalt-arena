import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Deal Room & Term Sheet",
  description: "Private encrypted deal room and structured term sheet negotiations on Gestalt Arena.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NegotiationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

