import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";
import Background from "@/components/landing/Background"; // Adjust import path as needed

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