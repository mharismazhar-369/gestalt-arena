import { Suspense } from "react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";

export default function ForgotPasswordPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#FFF9F0] px-4 overflow-hidden relative">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#FFD1C1] rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#E1BEE7] rounded-full mix-blend-multiply filter blur-[120px] opacity-50 animate-pulse" style={{ animationDelay: "2s" }}></div>

            <Suspense fallback={<RoleRoutingLoader message="Loading Recovery Portal..." />}>
                <ForgotPasswordForm />
            </Suspense>
        </main>
    );
}