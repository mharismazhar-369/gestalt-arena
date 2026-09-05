"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Heart, MessageCircle, Gavel, Star, UserPlus, Bookmark, Check, Repeat, Handshake } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export default function NotificationDropdown() {
  const { session } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!session?.user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        // FIX: Added reference_id to the query
        .select(`id, type, is_read, message, created_at, reference_id, actor:profiles!actor_id(nickname, company_name)`)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) setNotifications(data);
    };

    fetchNotifications();

    const uniqueChannelName = `notifications-${session.user.id}-${crypto.randomUUID()}`;

    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${session.user.id}` },
        () => fetchNotifications()
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    if (!session?.user || unreadCount === 0) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", session.user.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markSingleAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  // Helper function to resolve the correct URL route
  const getNotificationLink = (type: string, refId: string) => {
    if (!refId) return "#";
    switch (type) {
      case "negotiate":
      case "deal_initiated": return `/negotiations/${refId}`;
      case "rating":
      case "interested": return `/startup/${refId}/pitch`;
      case "bid": return `/bids/${refId}`;
      case "like":
      case "comment":
      case "reshare": return `/feed`;
      default: return "#";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "like": return <Heart size={16} className="text-rose-600" />;
      case "reshare": return <Repeat size={16} className="text-emerald-600" />;
      case "comment": return <MessageCircle size={16} className="text-blue-600" />;
      case "negotiate":
      case "deal_initiated": return <Handshake size={16} className="text-[var(--accent)]" />;
      case "bid": return <Gavel size={16} className="text-amber-600" />;
      case "rating": return <Star size={16} className="text-amber-500 fill-amber-500" />;
      case "follow": return <UserPlus size={16} className="text-violet-600" />;
      case "interested": return <Bookmark size={16} className="text-[var(--accent)] fill-[var(--accent)]/20" />;
      default: return <Bell size={16} className="text-[var(--secondary)]/60" />;
    }
  };

  if (!isMounted || !session?.user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-all duration-300 ${isOpen
          ? "neu-pressed-base border-transparent shadow-inner text-[var(--accent)]"
          : unreadCount > 0
            ? "neu-flat-base text-[var(--accent)] shadow-[0_0_15px_var(--accent)] animate-pulse"
            : "bg-transparent text-[var(--secondary)]/60 hover:text-[var(--secondary)]"
          }`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-black text-black border-2 border-[var(--primary)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-4 w-80 md:w-96 rounded-2xl neu-flat-base overflow-hidden z-50 border border-[var(--secondary)]/10"
          >
            <div className="p-4 border-b border-[var(--secondary)]/10 flex justify-between items-center">
              <h4 className="font-bold text-[var(--secondary)] flex items-center gap-2 text-sm">
                Notifications
                {unreadCount > 0 && (
                  <span className="neu-pressed-base border-transparent shadow-inner text-[var(--accent)] py-0.5 px-2 rounded-full text-[10px]">
                    {unreadCount} New
                  </span>
                )}
              </h4>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-[10px] text-[var(--secondary)]/60 hover:text-[var(--accent)] font-bold transition flex items-center gap-1">
                  <Check size={12} /> Mark read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[var(--secondary)]/50 font-medium text-sm">
                  You're all caught up.
                </div>
              ) : (
                notifications.map((notif) => {
                  const actorName = notif.actor?.nickname || notif.actor?.company_name || "A user";
                  const routeUrl = getNotificationLink(notif.type, notif.reference_id);

                  return (
                    <Link
                      href={routeUrl}
                      key={notif.id}
                      onClick={() => !notif.is_read && markSingleAsRead(notif.id)}
                      className={`p-4 border-b border-[var(--secondary)]/5 text-sm transition flex gap-3 hover:bg-[var(--secondary)]/5 ${!notif.is_read ? "bg-[var(--secondary)]/[0.03]" : "opacity-70"
                        }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-[var(--secondary)]/80 text-xs leading-relaxed font-medium">
                          <span className="font-bold text-[var(--secondary)]">{actorName}</span> {notif.message}
                        </p>
                        <p className="text-[10px] text-[var(--secondary)]/50 mt-1 font-bold tracking-wide">
                          {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}