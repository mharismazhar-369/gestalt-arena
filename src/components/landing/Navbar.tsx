"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BetaBadge from "@/components/shared/BetaBadge";
import { useAuth } from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { supabase } from "@/lib/supabase/client";
import { Menu, X, Compass, Rocket, BookOpen, Tag, User, MessageSquare, ChevronDown, Store, Building, ShieldAlert } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const { session, loading, status } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    if (session?.user?.id) {
      const fetchRole = async () => {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (data) setUserRole(data.role);
      };
      fetchRole();
    }
  }, [session]);

  const isGlassTheme = pathname === "/" || pathname === "/about" || pathname === "/pricing";
  const userTier = session?.user?.user_metadata?.tier || (session as any)?.profile?.tier || 'freemium';
  const showPricing = !session || userTier === 'freemium';

  const menuGroups = [
    {
      label: "Vitrine",
      icon: Compass,
      items: [
        { href: "/browse/investors", label: "Investors", icon: Building },
        { href: "/browse/startups", label: "Startups", icon: Rocket },
      ]
    },
    {
      label: "Arena",
      icon: Store,
      items: [
        { href: "/browse/bids", label: "Active Bids", icon: Tag },
        { href: "/emporium", label: "Emporium", icon: Store },
      ]
    },
    {
      label: "Arena Lounge",
      icon: MessageSquare,
      items: [
        { href: "/research", label: "Research", icon: BookOpen },
        { href: "/feed", label: "Arena Feed", icon: MessageSquare },
      ]
    }
  ];

  const userDisplayName = session?.user?.email?.split("@")[0] || "My Profile";
  const homeRoute = session?.user ? "/dashboard" : "/";

  const statusColors: Record<string, string> = {
    online: "bg-emerald-500",
    busy: "bg-rose-500",
    away: "bg-amber-400",
    banned: "bg-red-950",
    suspended: "bg-blue-950"
  };

  const pushButtonClass = "relative flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all duration-150 ease-in-out bg-[var(--primary)] border border-[var(--secondary)]/10 shadow-[4px_4px_10px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.05)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5),inset_-4px_-4px_10px_rgba(255,255,255,0.05)] active:translate-y-[2px] text-[var(--secondary)] hover:text-[var(--accent)]";
  const glassPushButtonClass = "relative flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all duration-150 ease-in-out bg-[#f1f5f9] border border-white shadow-[4px_4px_10px_rgba(0,0,0,0.08),-4px_-4px_10px_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.08),inset_-4px_-4px_10px_rgba(255,255,255,0.9)] active:translate-y-[2px] text-slate-700 hover:text-emerald-600";
  const glassJoinButtonClass = "relative flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all duration-150 ease-in-out bg-[#f1f5f9] border border-emerald-50/50 shadow-[4px_4px_10px_rgba(0,0,0,0.08),-4px_-4px_10px_rgba(255,255,255,0.9),0_0_15px_rgba(16,185,129,0.3)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.08),inset_-4px_-4px_10px_rgba(255,255,255,0.9)] active:translate-y-[2px] text-emerald-600 hover:text-emerald-500";

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 pt-6"
    >
      <div
        className={
          isGlassTheme
            ? "mx-auto flex max-w-7xl items-center justify-between px-6 py-4 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] relative z-20"
            : "neu-flat-base mx-auto flex max-w-7xl items-center justify-between px-6 py-4 relative z-20"
        }
      >
        <div className="flex items-center gap-4">
          <Link
            href={homeRoute}
            onClick={() => setMobileMenuOpen(false)}
            className={`text-xl font-black tracking-widest uppercase ${isGlassTheme ? "text-slate-900" : "text-[var(--secondary)]"}`}
          >
            Gestalt<span className={isGlassTheme ? "text-emerald-500" : "text-[var(--accent)]"}>Arena</span>
          </Link>
          <BetaBadge variant="pill" className="hidden sm:inline-flex opacity-70" />
        </div>

        <nav className="hidden items-center gap-2 lg:flex relative">
          {menuGroups.map((group) => (
            <div
              key={group.label}
              className="relative"
              onMouseEnter={() => setActiveDropdown(group.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 ${isGlassTheme
                  ? "text-slate-600 hover:text-emerald-600 hover:bg-white/80 hover:shadow-[0_4px_10px_rgba(0,0,0,0.03)]"
                  : "text-[var(--secondary)] hover:text-[var(--accent)] hover:bg-[var(--secondary)]/5 hover:shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
                  }`}
              >
                <group.icon size={14} />
                <span>{group.label}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${activeDropdown === group.label ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === group.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 rounded-2xl overflow-hidden shadow-2xl border ${isGlassTheme ? "bg-white/95 border-slate-100 backdrop-blur-xl" : "neu-flat-base border-[var(--secondary)]/10"}`}
                  >
                    <div className="flex flex-col py-2">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-4 py-3 text-xs font-bold transition-all ${isGlassTheme ? "hover:bg-slate-50 text-slate-700 hover:text-emerald-600" : "hover:bg-[var(--secondary)]/5 text-[var(--secondary)] hover:text-[var(--accent)]"}`}
                        >
                          <item.icon size={14} />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {showPricing && (
            <Link
              href="/pricing"
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 ${isGlassTheme
                ? "text-slate-600 hover:text-emerald-600 hover:bg-white/80 hover:shadow-[0_4px_10px_rgba(0,0,0,0.03)]"
                : "text-[var(--secondary)] hover:text-[var(--accent)] hover:bg-[var(--secondary)]/5 hover:shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
                }`}
            >
              <Tag size={14} />
              <span>Pricing</span>
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {isMounted && (
            !loading && session ? (
              <div className="flex items-center gap-4">
                {userRole === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className={isGlassTheme
                      ? "flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-all shadow-sm"
                      : "flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold hover:bg-rose-500/20 transition-all shadow-[0_0_10px_rgba(244,63,94,0.1)]"}
                  >
                    <ShieldAlert size={14} /> Matrix
                  </Link>
                )}

                <NotificationDropdown />
                <Link
                  href="/dashboard"
                  className={isGlassTheme ? glassPushButtonClass : pushButtonClass}
                >
                  <div className="relative flex items-center justify-center">
                    <User size={14} className={isGlassTheme ? "text-emerald-600" : "text-[var(--accent)]"} />
                    <span className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-white ${statusColors[status || "online"]}`} />
                  </div>
                  <span>{userDisplayName}</span>
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <>
                <Link href="/login" className={isGlassTheme ? glassPushButtonClass : pushButtonClass}>
                  Login
                </Link>
                <Link href="/register" className={isGlassTheme ? glassJoinButtonClass : pushButtonClass}>
                  Join Platform
                </Link>
              </>
            )
          )}
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          {isMounted && !loading && session && <NotificationDropdown />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={isGlassTheme ? "p-2 text-slate-600 focus:outline-none" : "p-2 text-[var(--secondary)] hover:text-[var(--accent)] focus:outline-none"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full left-4 right-4 mt-2 p-6 flex flex-col gap-4 rounded-3xl shadow-xl z-10 overflow-y-auto max-h-[80vh] ${isGlassTheme ? "bg-white/95 backdrop-blur-xl border border-white/80" : "neu-flat-base border-t border-[var(--secondary)]/10"}`}
          >
            {menuGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] opacity-70 px-2">{group.label}</span>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 text-sm font-bold p-2 transition-colors rounded-lg ${isGlassTheme ? "text-slate-700 hover:bg-slate-50" : "text-[var(--secondary)] hover:bg-[var(--secondary)]/5"}`}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            ))}

            {showPricing && (
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 text-sm font-bold p-2 transition-colors rounded-lg ${isGlassTheme ? "text-slate-700 hover:bg-slate-50" : "text-[var(--secondary)] hover:bg-[var(--secondary)]/5"}`}>
                <Tag size={16} /><span>Pricing</span>
              </Link>
            )}

            <div className="pt-4 flex flex-col gap-3 border-t border-[var(--secondary)]/10">
              {isMounted && (
                !loading && session ? (
                  <>
                    {userRole === 'admin' && (
                      <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 text-sm font-bold p-2 transition-colors rounded-lg ${isGlassTheme ? "text-rose-600 hover:bg-rose-50" : "text-rose-500 hover:bg-rose-500/10"}`}>
                        <ShieldAlert size={16} /><span>Enter Matrix</span>
                      </Link>
                    )}
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className={isGlassTheme ? glassPushButtonClass + " py-3" : pushButtonClass + " py-3"}>
                      <User size={16} /> <span>Dashboard ({userDisplayName})</span>
                    </Link>
                    <div className="flex justify-center" onClick={() => setMobileMenuOpen(false)}>
                      <LogoutButton />
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className={isGlassTheme ? glassPushButtonClass + " py-3" : pushButtonClass + " py-3"}>
                      Login
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className={isGlassTheme ? glassJoinButtonClass + " py-3" : pushButtonClass + " py-3"}>
                      Join Arena
                    </Link>
                  </>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}