import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { UserTierProvider } from "@/components/context/UserTierContext";
import { ChatProvider } from "@/components/context/ChatContext";
import { ThemeProvider } from "@/components/context/ThemeProvider";
import CookieConsent from "@/components/shared/CookieConsent";
import OnboardingWrapper from "@/components/onboarding/OnboardingWrapper";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gestalt-arena.com"),

  title: "Gestalt Arena | Where Capital Meets Execution",

  description:
    "Gestalt Arena connects investors and startups, enabling opportunity discovery, meaningful connections, and structured negotiation.",

  keywords: [
    "Gestalt Arena",
    "investors",
    "startups",
    "startup investors",
    "investment opportunities",
    "startup funding",
    "investor startup marketplace",
    "venture capital",
    "angel investors",
    "startup funding platform",
  ],

  alternates: {
    canonical: "https://www.gestalt-arena.com/",
  },

  openGraph: {
    title: "Gestalt Arena | Where Capital Meets Execution",
    description:
      "Connect investors and startups, discover opportunities, and move from connection to negotiation.",
    url: "https://www.gestalt-arena.com/",
    siteName: "Gestalt Arena",
    type: "website",
    locale: "en_US",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Gestalt Arena — Where Capital Meets Execution",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Gestalt Arena | Where Capital Meets Execution",
    description:
      "Connect investors and startups, discover opportunities, and move from connection to negotiation.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="szixoqouSou5jIVNRsufe2AB6yoINqFQbIoIdU5CL6c"
        />
      </head>

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