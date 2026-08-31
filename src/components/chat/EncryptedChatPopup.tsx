"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Lock, ChevronDown, Send, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

interface EncryptedChatPopupProps {
  currentUserId: string;
  recipientId: string;
  recipientName?: string;
  recipientInitials?: string;
}

export default function EncryptedChatPopup({
  currentUserId,
  recipientId,
  recipientName = "Strategic Partner",
  recipientInitials = "SP"
}: EncryptedChatPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchOrInitConversation = async () => {
      setIsLoading(true);

      // Check for existing conversation in both directions
      const { data: convData } = await supabase
        .from("conversations")
        .select("*")
        .or(`and(initiator_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(initiator_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
        .single();

      if (convData) {
        setConversation(convData);
        const { data: msgData } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", convData.id)
          .order("created_at", { ascending: true });

        if (msgData) setMessages(msgData);
      }
      setIsLoading(false);
    };

    fetchOrInitConversation();

    // Subscribe to new messages
    const channel = supabase
      .channel("chat_updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (conversation && payload.new.conversation_id === conversation.id) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, currentUserId, recipientId, conversation?.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    let currentConvId = conversation?.id;

    // Create conversation if it doesn't exist
    if (!currentConvId) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert([{ initiator_id: currentUserId, recipient_id: recipientId, status: "pending" }])
        .select()
        .single();

      if (newConv) {
        setConversation(newConv);
        currentConvId = newConv.id;
      }
    }

    if (currentConvId) {
      await supabase.from("messages").insert([{
        conversation_id: currentConvId,
        sender_id: currentUserId,
        content: messageInput,
      }]);
      setMessageInput("");
    }
  };

  const isPending = conversation?.status === "pending";
  const messagesSentByMe = messages.filter(m => m.sender_id === currentUserId).length;
  const isLimitReached = isPending && messagesSentByMe >= 5 && conversation?.initiator_id === currentUserId;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-3 w-80 sm:w-96 rounded-3xl border border-white/15 bg-slate-950/95 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col h-[480px]"
          >
            {/* Header with Encrypted Badge */}
            <div className="bg-slate-900/90 border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center font-bold text-black text-xs uppercase shadow-md">
                    {recipientInitials}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{recipientName}</span>
                  </h4>
                  <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                    <Lock size={10} className="text-cyan-400 animate-pulse" /> E2E Encrypted Protocol
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                aria-label="Close Chat"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Encryption Notice Banner */}
            <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-4 py-1.5 text-center text-[10px] text-cyan-300 font-semibold flex items-center justify-center gap-1.5">
              <ShieldCheck size={12} className="text-cyan-400" />
              <span>Messages protected with zero-knowledge encryption</span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {isLoading ? (
                <div className="text-center text-xs text-slate-500 mt-10">Establishing secure connection...</div>
              ) : messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender_id === currentUserId ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${msg.sender_id === currentUserId
                      ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-br-none shadow-md"
                      : "bg-white/10 text-slate-200 border border-white/10 rounded-bl-none"
                      }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>

            {/* Input / Limit Warning */}
            {isLimitReached ? (
              <div className="border-t border-white/10 p-3 bg-slate-900/50 text-center">
                <p className="text-xs text-orange-400 font-semibold">Message limit reached.</p>
                <p className="text-[10px] text-slate-400">Waiting for {recipientName} to approve connection.</p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="border-t border-white/10 p-3 bg-slate-900/50 flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={isPending ? `Type message (${5 - messagesSentByMe} remaining)...` : "Type encrypted message..."}
                  className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-black font-bold disabled:opacity-40 transition hover:scale-105"
                  aria-label="Send Message"
                >
                  <Send size={14} />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 rounded-full border border-cyan-400/40 bg-slate-950/90 px-4 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-2xl transition hover:border-cyan-400 hover:scale-105 hover:shadow-cyan-500/20"
        >
          <div className="relative">
            <MessageSquare size={18} className="text-cyan-400" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <span>Direct Arena Chat</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 px-2 py-0.5 text-[9px] text-cyan-300 font-bold">
            <Lock size={9} /> Encrypted
          </span>
        </button>
      )}
    </div>
  );
}