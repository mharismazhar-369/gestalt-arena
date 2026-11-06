import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";
import Background from "@/components/landing/Background"; // Adjust import path as needed

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to Gestalt Arena to access the deal room, discover investment opportunities, and connect with partners.",
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Login | Gestalt Arena",
    description: "Sign in to Gestalt Arena to access the deal room, discover investment opportunities, and connect with partners.",
    url: "https://www.gestalt-arena.com/login",
    siteName: "Gestalt Arena",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Login | Gestalt Arena",
    description: "Sign in to Gestalt Arena to access the deal room, discover investment opportunities, and connect with partners.",
  },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF9F0] px-4 overflow-hidden relative">
      <Background />
      <Suspense fallback={<RoleRoutingLoader message="Warming up the portal..." />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}