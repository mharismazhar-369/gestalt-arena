import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Preferences",
  description: "Customize your investment criteria, startup parameters, and matchmaking preferences on Gestalt Arena.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreferencesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

