import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";
import Background from "@/components/landing/Background";

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