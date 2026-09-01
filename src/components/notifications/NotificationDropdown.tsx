"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Heart, MessageCircle, Gavel, Star, UserPlus, Bookmark, Check, Repeat } from "lucide-react";
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
        .select(`
          id, type, is_read, message, created_at,
          actor:profiles!actor_id(nickname, company_name)
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) setNotifications(data);
    };

    fetchNotifications();

    // Generate a strictly unique channel name using crypto.randomUUID()
    const uniqueChannelName = `notifications-${session.user.id}-${crypto.randomUUID()}`;

    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    if (!session?.user || unreadCount === 0) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "like": return <Heart size={16} className="text-pink-400" />;
      case "reshare": return <Repeat size={16} className="text-emerald-400" />;
      case "comment":
      case "negotiate": return <MessageCircle size={16} className="text-cyan-400" />;
      case "bid": return <Gavel size={16} className="text-amber-400" />;
      case "rating": return <Star size={16} className="text-amber-400 fill-amber-400" />;
      case "follow": return <UserPlus size={16} className="text-violet-400" />;
      case "interested": return <Bookmark size={16} className="text-cyan-400 fill-cyan-400/20" />;
      default: return <Bell size={16} className="text-slate-400" />;
    }
  };

  if (!isMounted || !session?.user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition border ${isOpen ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/5 text-slate-300 hover:text-white hover:bg-white/10"
          }`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-black text-black border-2 border-[#0a0a0a]">
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
            className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h4 className="font-bold text-white flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-cyan-500/20 text-cyan-400 py-0.5 px-2 rounded-full text-[10px]">
                    {unreadCount} New
                  </span>
                )}
              </h4>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-1">
                  <Check size={12} /> Mark read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  You're all caught up.
                </div>
              ) : (
                notifications.map((notif) => {
                  const actorName = notif.actor?.nickname || notif.actor?.company_name || "A user";

                  return (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-white/5 text-sm transition hover:bg-white/5 flex gap-3 ${!notif.is_read ? "bg-cyan-500/5" : "opacity-70"
                        }`}
                    >
                      <div className="mt-0.5">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-300 text-xs leading-relaxed">
                          <span className="font-bold text-white">{actorName}</span> {notif.message}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium tracking-wide">
                          {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
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