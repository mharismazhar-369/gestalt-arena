"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import { ShieldAlert, AlertOctagon, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function WarningPage() {
    const { status, loading } = useAuth();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    if (!isMounted || loading) return null;

    const isSuspended = status === "suspended";

    return (
        <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-6 font-mono selection:bg-white selection:text-black">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`max-w-2xl w-full p-10 md:p-14 rounded-3xl border relative overflow-hidden shadow-2xl backdrop-blur-xl bg-[#0a0a0a]/80 ${isSuspended
                    ? "border-blue-500/30 shadow-[inset_0_0_60px_rgba(59,130,246,0.1)]"
                    : "border-rose-600/30 shadow-[inset_0_0_60px_rgba(225,29,72,0.1)]"
                    }`}
            >
                {/* Animated Background Glow */}
                <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 animate-pulse ${isSuspended ? "bg-blue-500" : "bg-rose-600"}`} />

                <div className="relative z-10 space-y-8 text-center">

                    {/* Icon Header */}
                    <div className={`mx-auto w-24 h-24 rounded-2xl flex items-center justify-center border shadow-inner ${isSuspended
                        ? "bg-blue-950/30 border-blue-500/40 text-blue-400"
                        : "bg-rose-950/30 border-rose-500/40 text-rose-500"
                        }`}>
                        {isSuspended ? <AlertOctagon size={48} /> : <ShieldAlert size={48} />}
                    </div>

                    {/* Dynamic Content */}
                    <div className="space-y-4">
                        <h1 className={`text-2xl md:text-3xl font-black tracking-widest uppercase ${isSuspended ? "text-blue-400" : "text-rose-500"}`}>
                            {isSuspended ? "Administrative Suspension" : "Notice of Account Termination"}
                        </h1>

                        <div className="h-px w-16 mx-auto bg-gray-800" />

                        {isSuspended ? (
                            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
                                Your account access has been temporarily suspended pending a formal administrative review.
                                This precautionary measure was automatically triggered due to anomalous system activity,
                                suspected platform malpractices, or corroborated feedback reports from other verified ecosystem participants.
                            </p>
                        ) : (
                            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
                                Your access to the Gestalt Arena network has been permanently and irrevocably revoked.
                                This action constitutes a final administrative decision resulting from a material breach of our Terms of Service.
                                All associated data, active negotiations, and platform privileges have been severed immediately.
                            </p>
                        )}
                    </div>

                    {/* Contact Administrator Block */}
                    <div className={`p-6 rounded-xl border flex flex-col items-center gap-3 ${isSuspended ? "bg-blue-500/5 border-blue-500/10" : "bg-rose-500/5 border-rose-500/10"
                        }`}>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Official Correspondence</span>
                        <p className="text-sm text-gray-300">
                            To appeal this decision or request further clarification regarding your account status, direct your inquiries to the Platform Administrator.
                        </p>
                        <a
                            href="mailto:hanniball.lecter420@gmail.com"
                            className={`mt-2 flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all border ${isSuspended
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                                : "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20"
                                }`}
                        >
                            <Mail size={16} />
                            hanniball.lecter420@gmail.com
                        </a>
                    </div>

                    {/* Exit Action */}
                    <div className="pt-6 border-t border-gray-800/50 flex flex-col items-center gap-4">
                        <span className="text-xs text-gray-600 font-medium">You must sever your active session to continue.</span>
                        <LogoutButton />
                    </div>

                </div>
            </motion.div>
        </div>
    );
}