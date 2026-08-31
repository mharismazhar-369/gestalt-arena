import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { UserTierProvider } from "@/components/context/UserTierContext";
import CookieConsent from "@/components/shared/CookieConsent";
import TierSwitcherBar from "@/components/shared/TierSwitcherBar";
import EncryptedChatPopup from "@/components/chat/EncryptedChatPopup";
import OnboardingWrapper from "@/components/onboarding/OnboardingWrapper";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Gestalt Arena | Window-Shopping Marketplace for Investors & Startups",
  description:
    "TRIONN-styled matchmaking marketplace connecting verified investors, founders, and startups globally.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Platform admin/support user ID for global layout chat
  const DEFAULT_RECIPIENT_ID = "00000000-0000-0000-0000-000000000000";

  return (
    <html lang="en">
      <body className="bg-[#02040a] text-slate-100 antialiased selection:bg-cyan-400 selection:text-black">
        <AuthProvider>
          <UserTierProvider>
            {children}
            <CookieConsent />
            <TierSwitcherBar />
            {user && (
              <EncryptedChatPopup
                currentUserId={user.id}
                recipientId={DEFAULT_RECIPIENT_ID}
              />
            )}
            <OnboardingWrapper />
          </UserTierProvider>
        </AuthProvider>
      </body>
    </html>
  );
}