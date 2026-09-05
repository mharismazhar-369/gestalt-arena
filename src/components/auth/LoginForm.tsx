"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff, Sparkles, Check } from "lucide-react";

// --- Telemetry Utility ---
const trackInteraction = (eventType: "CLICK" | "INPUT", element: string, metadata?: any) => {
  console.log(`[Telemetry] ${eventType} -> ${element}`, metadata);
};

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        trackInteraction("CLICK", "auto_login_bypass_success");
        router.push("/dashboard");
      } else {
        const savedEmail = localStorage.getItem("gestalt_saved_email");
        if (savedEmail) {
          setFormData((prev) => ({ ...prev, email: savedEmail }));
          setRememberMe(true);
        }
        setSessionChecking(false);
      }
    };

    initializeAuth();
  }, [router]);

  const isFilled = (field: string) => formData[field as keyof typeof formData].length > 0;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    trackInteraction("INPUT", `login_form_${field}_changed`, { length: value.length });
  };

  const handleGoogleLogin = async () => {
    trackInteraction("CLICK", "google_login_attempt");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      trackInteraction("CLICK", "google_login_failed", { error: error.message });
      setError(error.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    trackInteraction("CLICK", "login_submit_attempt", { rememberMe });

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (signInError) {
      setError(signInError.message);
      trackInteraction("CLICK", "login_submit_failed", { error: signInError.message });
      setLoading(false);
    } else {
      trackInteraction("CLICK", "login_submit_success");

      if (rememberMe) {
        localStorage.setItem("gestalt_saved_email", formData.email);
      } else {
        localStorage.removeItem("gestalt_saved_email");
      }

      router.push("/dashboard");
    }
  };

  if (sessionChecking) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-[#FF7E67]">
        <Loader2 size={32} className="animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#2D3748]/50">Authenticating...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      className="w-[95vw] max-w-[550px] aspect-square bg-[#FFF9F0] rounded-full shadow-[16px_16px_32px_#dfd9d2,-16px_-16px_32px_#ffffff] relative z-10 flex flex-col items-center justify-center p-8"
    >
      <div className="text-center space-y-1 mb-4 mt-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.3 }}
          className="mx-auto w-10 h-10 bg-[#FFF9F0] shadow-[4px_4px_8px_#dfd9d2,-4px_-4px_8px_#ffffff] rounded-full flex items-center justify-center mb-2"
        >
          <Sparkles className="text-[#FF7E67]" size={20} />
        </motion.div>
        <h1 className="text-xl font-black text-[#2D3748]">Welcome Back</h1>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#FFF9F0] shadow-[inset_4px_4px_8px_#dfd9d2,inset_-4px_-4px_8px_#ffffff] text-rose-500 px-4 py-2 rounded-full text-[10px] font-bold mb-3 text-center max-w-[80%]"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleLogin} className="w-full max-w-[320px] space-y-4">

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-[#FFF9F0] shadow-[6px_6px_12px_#dfd9d2,-6px_-6px_12px_#ffffff] hover:shadow-[inset_2px_2px_5px_#dfd9d2,inset_-2px_-2px_5px_#ffffff] text-[#2D3748] font-bold py-3 rounded-full text-xs transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center w-full opacity-40 py-1">
          <div className="flex-1 border-t border-[#2D3748]/30"></div>
          <span className="px-3 text-[9px] font-bold text-[#2D3748] uppercase tracking-wider">Or Email</span>
          <div className="flex-1 border-t border-[#2D3748]/30"></div>
        </div>

        <div className="relative group">
          <div className="relative">
            <Mail size={16} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFilled("email") ? "text-[#FF7E67]" : "text-[#2D3748]/40 group-focus-within:text-[#FF7E67]"}`} />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full bg-[#FFF9F0] rounded-full py-3 pl-12 pr-6 text-sm font-medium text-[#2D3748] outline-none transition-all duration-300 shadow-[inset_5px_5px_10px_#dfd9d2,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_2px_2px_5px_#dfd9d2,inset_-2px_-2px_5px_#ffffff]"
              placeholder="Email Address"
            />
          </div>
        </div>

        <div className="relative group">
          <div className="relative">
            <Lock size={16} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFilled("password") ? "text-[#FF7E67]" : "text-[#2D3748]/40 group-focus-within:text-[#FF7E67]"}`} />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full bg-[#FFF9F0] rounded-full py-3 pl-12 pr-12 text-sm font-medium text-[#2D3748] outline-none transition-all duration-300 shadow-[inset_5px_5px_10px_#dfd9d2,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_2px_2px_5px_#dfd9d2,inset_-2px_-2px_5px_#ffffff]"
              placeholder="Password"
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

        <div className="flex items-center justify-between px-2 pt-1">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => {
                setRememberMe(!rememberMe);
                trackInteraction("CLICK", "toggle_remember_me", { state: !rememberMe });
              }}
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${rememberMe
                  ? "bg-[#FFF9F0] shadow-[inset_2px_2px_5px_#dfd9d2,inset_-2px_-2px_5px_#ffffff]"
                  : "bg-[#FFF9F0] shadow-[3px_3px_6px_#dfd9d2,-3px_-3px_6px_#ffffff]"
                }`}
            >
              <Check size={12} className={`transition-opacity ${rememberMe ? "opacity-100 text-[#FF7E67]" : "opacity-0"}`} />
            </div>
            <span className="text-[10px] font-bold text-[#2D3748]/60 group-hover:text-[#FF7E67] transition-colors">Remember Me</span>
          </label>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98, boxShadow: "inset 5px 5px 10px #dfd9d2, inset -5px -5px 10px #ffffff" }}
          type="submit"
          disabled={loading || !formData.email || !formData.password}
          className="w-full bg-[#FFF9F0] shadow-[6px_6px_12px_#dfd9d2,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#dfd9d2,-8px_-8px_16px_#ffffff] text-[#FF7E67] font-black py-3.5 rounded-full text-sm transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:shadow-none disabled:border disabled:border-[#dfd9d2]"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : (
            <>Sign In <LogIn size={18} /></>
          )}
        </motion.button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <Link
          href="/forgot-password"
          onClick={() => trackInteraction("CLICK", "nav_forgot_password")}
          className="block text-[11px] font-bold text-[#2D3748]/50 hover:text-[#FF7E67] transition-colors"
        >
          Forgot your password?
        </Link>
        <p className="text-[11px] font-medium text-[#2D3748]/70">
          New here?{" "}
          <Link
            href="/register"
            onClick={() => trackInteraction("CLICK", "nav_register")}
            className="text-[#FF7E67] font-black hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </motion.div>
  );
}