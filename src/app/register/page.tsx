import { Suspense } from "react";
import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";
import Background from "@/components/landing/Background";

export const metadata: Metadata = {
  title: "Join Gestalt Arena",
  description: "Create your investor or startup founder account on Gestalt Arena to begin structured fundraising and deal matching.",
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: "Join Gestalt Arena | Create an Account",
    description: "Create your investor or startup founder account on Gestalt Arena to begin structured fundraising and deal matching.",
    url: "https://www.gestalt-arena.com/register",
    siteName: "Gestalt Arena",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Gestalt Arena | Create an Account",
    description: "Create your investor or startup founder account on Gestalt Arena to begin structured fundraising and deal matching.",
  },
};

export default function RegisterPage() {
  return (
    // Changed bg-[#4A148C] to bg-[#FFF9F0] to allow the text particles to be visible
    <main className="flex min-h-screen items-center justify-center bg-[#FFF9F0] px-4 overflow-hidden relative">

      <Background />

      <Suspense fallback={<RoleRoutingLoader message="Initializing Registration Portal..." />}>
        <RegisterForm />
      </Suspense>

    </main>
  );
}