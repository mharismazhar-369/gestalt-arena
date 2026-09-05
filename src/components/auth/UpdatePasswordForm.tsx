"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { Lock, Loader2, ShieldCheck, Eye, EyeOff, CheckCircle2 } from "lucide-react";

// --- Telemetry Utility ---
const trackInteraction = (eventType: "CLICK" | "INPUT", element: string, metadata?: any) => {
    console.log(`[Telemetry] ${eventType} -> ${element}`, metadata);
};

export default function UpdatePasswordForm() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            trackInteraction("CLICK", "update_password_mismatch");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        trackInteraction("CLICK", "update_password_attempt");

        const { error: updateError } = await supabase.auth.updateUser({
            password: password,
        });

        if (updateError) {
            setError(updateError.message);
            trackInteraction("CLICK", "update_password_failed", { error: updateError.message });
            setLoading(false);
        } else {
            setSuccess(true);
            trackInteraction("CLICK", "update_password_success");

            // Automatically route to dashboard after showing the success checkmark
            setTimeout(() => {
                router.push("/dashboard");
            }, 2500);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
            className="w-[90vw] max-w-[450px] aspect-square bg-[#FFF9F0] rounded-full shadow-[16px_16px_32px_#dfd9d2,-16px_-16px_32px_#ffffff] relative z-10 flex flex-col items-center justify-center p-10"
        >
            <div className="text-center space-y-2 mb-6 mt-2">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="mx-auto w-12 h-12 bg-[#FFF9F0] shadow-[4px_4px_8px_#dfd9d2,-4px_-4px_8px_#ffffff] rounded-full flex items-center justify-center mb-4"
                >
                    <ShieldCheck className="text-[#FF7E67]" size={24} />
                </motion.div>
                <h1 className="text-xl font-black text-[#2D3748]">Secure Account</h1>
                <p className="text-[#2D3748]/60 text-xs font-medium px-6 leading-relaxed">
                    Please enter your new password below.
                </p>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#FFF9F0] shadow-[inset_4px_4px_8px_#dfd9d2,inset_-4px_-4px_8px_#ffffff] text-rose-500 px-4 py-2 rounded-full text-[10px] font-bold mb-4 text-center max-w-[80%]"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {success ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center space-y-4 w-full px-6 text-center"
                >
                    <div className="w-16 h-16 rounded-full bg-[#FFF9F0] shadow-[inset_4px_4px_8px_#dfd9d2,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center text-emerald-500">
                        <CheckCircle2 size={32} />
                    </div>
                    <p className="text-[#2D3748] font-bold text-sm">Password Updated!</p>
                    <p className="text-xs text-[#2D3748]/60">Redirecting to your dashboard...</p>
                </motion.div>
            ) : (
                <form onSubmit={handleUpdate} className="w-full max-w-[300px] space-y-5">
                    <div className="relative group">
                        <div className="relative">
                            <Lock size={16} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${password.length > 0 ? "text-[#FF7E67]" : "text-[#2D3748]/40 group-focus-within:text-[#FF7E67]"}`} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    trackInteraction("INPUT", "update_password_input_changed", { length: e.target.value.length });
                                }}
                                className="w-full bg-[#FFF9F0] rounded-full py-3.5 pl-12 pr-12 text-sm font-medium text-[#2D3748] outline-none transition-all duration-300 shadow-[inset_5px_5px_10px_#dfd9d2,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_2px_2px_5px_#dfd9d2,inset_-2px_-2px_5px_#ffffff]"
                                placeholder="New Password"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPassword(!showPassword);
                                    trackInteraction("CLICK", "toggle_password_visibility");
                                }}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2D3748]/40 hover:text-[#FF7E67] transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="relative">
                            <Lock size={16} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${confirmPassword.length > 0 ? "text-[#FF7E67]" : "text-[#2D3748]/40 group-focus-within:text-[#FF7E67]"}`} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    trackInteraction("INPUT", "confirm_password_input_changed", { length: e.target.value.length });
                                }}
                                className="w-full bg-[#FFF9F0] rounded-full py-3.5 pl-12 pr-12 text-sm font-medium text-[#2D3748] outline-none transition-all duration-300 shadow-[inset_5px_5px_10px_#dfd9d2,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_2px_2px_5px_#dfd9d2,inset_-2px_-2px_5px_#ffffff]"
                                placeholder="Confirm Password"
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98, boxShadow: "inset 5px 5px 10px #dfd9d2, inset -5px -5px 10px #ffffff" }}
                        type="submit"
                        disabled={loading || !password || !confirmPassword}
                        className="w-full bg-[#FFF9F0] shadow-[6px_6px_12px_#dfd9d2,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#dfd9d2,-8px_-8px_16px_#ffffff] text-[#FF7E67] font-black py-3.5 rounded-full text-sm transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:shadow-none disabled:border disabled:border-[#dfd9d2]"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : "Save New Password"}
                    </motion.button>
                </form>
            )}
        </motion.div>
    );
}