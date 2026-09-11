import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { UserTierProvider } from "@/components/context/UserTierContext";
import { ChatProvider } from "@/components/context/ChatContext";
import { ThemeProvider } from "@/components/context/ThemeProvider";
import CookieConsent from "@/components/shared/CookieConsent";
import OnboardingWrapper from "@/components/onboarding/OnboardingWrapper";

export const metadata: Metadata = {
  title: "Gestalt Arena | Where Capital Meets Execution",
  description: "Platform connecting Investors, Founders, Startups and supporting Ideas Globally.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <UserTierProvider>
              <ChatProvider>
                {children}
                <CookieConsent />
                <OnboardingWrapper />
              </ChatProvider>
            </UserTierProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}