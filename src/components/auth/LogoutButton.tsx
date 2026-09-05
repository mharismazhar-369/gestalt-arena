"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{
        scale: 0.95,
        boxShadow: "inset 4px 4px 8px var(--neu-dark, rgba(0,0,0,0.1)), inset -4px -4px 8px var(--neu-light, rgba(255,255,255,0.7))"
      }}
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="group flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-rose-500 transition-all shadow-[4px_4px_8px_var(--neu-dark,rgba(0,0,0,0.1)),-4px_-4px_8px_var(--neu-light,rgba(255,255,255,0.7))] hover:shadow-[6px_6px_12px_var(--neu-dark,rgba(0,0,0,0.1)),-6px_-6px_12px_var(--neu-light,rgba(255,255,255,0.7))] bg-[var(--primary,transparent)] disabled:opacity-50 disabled:shadow-none disabled:border disabled:border-rose-200"
    >
      {isLoggingOut ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <LogOut size={16} className="transition-transform group-hover:-translate-x-0.5" />
      )}
      <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
    </motion.button>
  );
}