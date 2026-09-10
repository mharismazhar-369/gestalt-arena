import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { UserTierProvider } from "@/components/context/UserTierContext";
import { ChatProvider } from "@/components/context/ChatContext";
import { ThemeProvider } from "@/components/context/ThemeProvider";
import CookieConsent from "@/components/shared/CookieConsent";
import OnboardingWrapper from "@/components/onboarding/OnboardingWrapper";

export const metadata: Metadata = {
  title: "Gestalt Arena | Market Execution Infrastructure",
  description: "Neumorphic matchmaking marketplace connecting verified investors, founders, and startups globally.",
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