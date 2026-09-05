import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF9F0] px-4 overflow-hidden relative">
      {/* Warm, welcoming ambient background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#FFD1C1] rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#E1BEE7] rounded-full mix-blend-multiply filter blur-[120px] opacity-50 animate-pulse" style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-[#FFE0B2] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: "4s" }}></div>

      <Suspense fallback={<RoleRoutingLoader message="Warming up the portal..." />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}