"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { Mail, Lock, User, Briefcase, ChevronRight, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";

// --- Telemetry Utility ---
const trackInteraction = (eventType: "CLICK" | "INPUT", element: string, metadata?: any) => {
  console.log(`[Telemetry] ${eventType} -> ${element}`, metadata);
};

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "startup" // Default role
  });

  const isFilled = (field: string) => formData[field as keyof typeof formData].length > 0;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    trackInteraction("INPUT", `register_form_${field}_changed`, { length: value.length });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    trackInteraction("CLICK", "register_submit_attempt", { role: formData.role });

    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { role: formData.role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      trackInteraction("CLICK", "register_submit_failed", { error: signUpError.message });
      setLoading(false);
    } else {
      trackInteraction("CLICK", "register_submit_success", { role: formData.role });
      router.push("/verify-email");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      className="w-[95vw] max-w-[550px] aspect-square bg-[#F4F7F6] rounded-full shadow-[16px_16px_32px_#d0d3d2,-16px_-16px_32px_#ffffff] relative z-10 flex flex-col items-center justify-center p-10"
    >
      <div className="text-center space-y-1 mb-6 mt-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.3 }}
          className="mx-auto w-10 h-10 bg-[#F4F7F6] shadow-[4px_4px_8px_#d0d3d2,-4px_-4px_8px_#ffffff] rounded-full flex items-center justify-center mb-4"
        >
          <Briefcase className="text-[#81D4FA]" size={20} />
        </motion.div>
        <h1 className="text-2xl font-black text-[#4A148C]">Join the Arena</h1>
        <p className="text-[#4A148C]/60 text-xs font-medium px-4">Create your account to access the ecosystem.</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-[12%] bg-[#F4F7F6] shadow-[inset_4px_4px_8px_#d0d3d2,inset_-4px_-4px_8px_#ffffff] text-rose-500 px-4 py-2 rounded-full text-[10px] font-bold text-center max-w-[70%] z-20"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleRegister} className="w-full max-w-[320px] space-y-5">
        {/* Neumorphic Role Toggles */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <button
            type="button"
            onClick={() => {
              setFormData({ ...formData, role: "startup" });
              trackInteraction("CLICK", "select_role_startup");
            }}
            className={`flex-1 py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${formData.role === "startup"
                ? "bg-[#F4F7F6] shadow-[inset_4px_4px_8px_#d0d3d2,inset_-4px_-4px_8px_#ffffff] text-[#81D4FA]"
                : "bg-[#F4F7F6] shadow-[4px_4px_8px_#d0d3d2,-4px_-4px_8px_#ffffff] text-[#4A148C]/50 hover:text-[#81D4FA]"
              }`}
          >
            <User size={14} /> Founder
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({ ...formData, role: "investor" });
              trackInteraction("CLICK", "select_role_investor");
            }}
            className={`flex-1 py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${formData.role === "investor"
                ? "bg-[#F4F7F6] shadow-[inset_4px_4px_8px_#d0d3d2,inset_-4px_-4px_8px_#ffffff] text-[#81D4FA]"
                : "bg-[#F4F7F6] shadow-[4px_4px_8px_#d0d3d2,-4px_-4px_8px_#ffffff] text-[#4A148C]/50 hover:text-[#81D4FA]"
              }`}
          >
            <Briefcase size={14} /> Investor
          </button>
        </div>

        {/* Email Input */}
        <div className="relative group">
          <div className="relative">
            <Mail size={16} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFilled("email") ? "text-[#81D4FA]" : "text-[#4A148C]/40 group-focus-within:text-[#81D4FA]"}`} />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full bg-[#F4F7F6] rounded-full py-3.5 pl-12 pr-12 text-sm font-medium text-[#4A148C] outline-none transition-all duration-300 shadow-[inset_5px_5px_10px_#d0d3d2,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_2px_2px_5px_#d0d3d2,inset_-2px_-2px_5px_#ffffff]"
              placeholder="Work Email"
            />
            <AnimatePresence>
              {isFilled("email") && (
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#81D4FA]">
                  <CheckCircle2 size={16} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Password Input */}
        <div className="relative group">
          <div className="relative">
            <Lock size={16} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFilled("password") ? "text-[#81D4FA]" : "text-[#4A148C]/40 group-focus-within:text-[#81D4FA]"}`} />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full bg-[#F4F7F6] rounded-full py-3.5 pl-12 pr-12 text-sm font-medium text-[#4A148C] outline-none transition-all duration-300 shadow-[inset_5px_5px_10px_#d0d3d2,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_2px_2px_5px_#d0d3d2,inset_-2px_-2px_5px_#ffffff]"
              placeholder="Secure Password"
            />
            <button
              type="button"
              onClick={() => {
                setShowPassword(!showPassword);
                trackInteraction("CLICK", "toggle_password_visibility");
              }}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-[#4A148C]/40 hover:text-[#81D4FA] transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98, boxShadow: "inset 5px 5px 10px #d0d3d2, inset -5px -5px 10px #ffffff" }}
          type="submit"
          disabled={loading || !formData.email || !formData.password}
          className="w-full bg-[#F4F7F6] shadow-[6px_6px_12px_#d0d3d2,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#d0d3d2,-8px_-8px_16px_#ffffff] text-[#81D4FA] font-black py-3.5 rounded-full text-sm transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:shadow-none disabled:border disabled:border-[#d0d3d2]"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : (
            <>Create Account <ChevronRight size={18} /></>
          )}
        </motion.button>
      </form>

      <div className="mt-8 text-center space-y-2">
        <p className="text-[11px] font-medium text-[#4A148C]/70">
          Already have an account?{" "}
          <Link
            href="/login"
            onClick={() => trackInteraction("CLICK", "nav_login")}
            className="text-[#81D4FA] font-black hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
}