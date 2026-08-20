import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { UserTierProvider } from "@/components/context/UserTierContext";
import CookieConsent from "@/components/shared/CookieConsent";
import TierSwitcherBar from "@/components/shared/TierSwitcherBar";
import EncryptedChatPopup from "@/components/chat/EncryptedChatPopup";

export const metadata: Metadata = {
  title: "Gestalt Arena | Window-Shopping Marketplace for Investors & Startups",
  description:
    "TRIONN-styled matchmaking marketplace connecting verified investors, founders, and startups globally.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#02040a] text-slate-100 antialiased selection:bg-cyan-400 selection:text-black">
        <AuthProvider>
          <UserTierProvider>
            {children}
            <CookieConsent />
            <TierSwitcherBar />
            <EncryptedChatPopup />
          </UserTierProvider>
        </AuthProvider>
      </body>
    </html>
  );
}