"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export default function NotificationDropdown() {
  const { session } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!session?.user) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select(`
          id, type, read, created_at,
          actor:profiles!actor_id(nickname, company_name)
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20);
        
      if (data) setNotifications(data);
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          // Ideally fetch the actor profile as well, but for simplicity we can just trigger a refetch
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const markAllAsRead = async () => {
    if (!session?.user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", session.user.id)
      .eq("read", false);
      
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) markAllAsRead();
        }}
        className="relative p-2 rounded-full hover:bg-white/10 transition text-slate-300 hover:text-white"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h4 className="font-bold text-white">Notifications</h4>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  All caught up.
                </div>
              ) : (
                notifications.map((notif) => {
                  const actorName = notif.actor?.nickname || notif.actor?.company_name || "Someone";
                  let actionText = "";
                  if (notif.type === "like") actionText = "liked your post.";
                  if (notif.type === "comment") actionText = "commented on your post.";
                  if (notif.type === "follow") actionText = "followed you.";
                  if (notif.type === "message") actionText = "sent you a message.";

                  return (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-white/5 text-sm transition hover:bg-white/5 ${
                        !notif.read ? "bg-cyan-500/5" : ""
                      }`}
                    >
                      <span className="font-semibold text-white">{actorName}</span>{" "}
                      <span className="text-slate-400">{actionText}</span>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
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
