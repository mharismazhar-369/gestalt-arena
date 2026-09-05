import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#4A148C] px-4 overflow-hidden relative">
      {/* Dynamic Animated Ambient Orbs for psychological depth */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#81D4FA] rounded-full mix-blend-overlay filter blur-[120px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#81D4FA] rounded-full mix-blend-overlay filter blur-[150px] opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-[#F4F7F6] rounded-full mix-blend-overlay filter blur-[100px] opacity-10 animate-pulse" style={{ animationDelay: "4s" }}></div>

      <Suspense fallback={<RoleRoutingLoader message="Initializing Registration Portal..." />}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}