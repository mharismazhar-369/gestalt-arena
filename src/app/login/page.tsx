import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#02040a] px-6 trionn-grid-bg relative">
      <Suspense fallback={<RoleRoutingLoader message="Initializing Login Portal..." />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}