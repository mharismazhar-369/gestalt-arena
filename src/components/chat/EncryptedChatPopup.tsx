"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Lock, ChevronDown, Send, ShieldCheck, UserX, UserPlus, Loader2 } from "lucide-react";
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
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // REFS: For auto-scrolling and preventing stale closures in the realtime listener
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConvIdRef = useRef<string | null>(null);

  // Auto-scroll to the newest message whenever the messages array changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Keep the ref synced with the active conversation ID
  useEffect(() => {
    activeConvIdRef.current = conversation?.id || null;
  }, [conversation]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadConversationData = async () => {
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
  };

  useEffect(() => {
    if (!isOpen || !currentUserId || !recipientId) return;

    const initializeChatEnvironment = async () => {
      setIsLoading(true);

      const { data: followData, error: followError } = await supabase
        .from("follows")
        .select("*")
        .or(`and(follower_id.eq.${currentUserId},following_id.eq.${recipientId}),and(follower_id.eq.${recipientId},following_id.eq.${currentUserId})`);

      if (!followData || followData.length === 0 || followError) {
        setIsConnected(false);
        setIsLoading(false);
        return;
      }

      setIsConnected(true);
      await loadConversationData();
      setIsLoading(false);
    };

    initializeChatEnvironment();

    const uniqueChannelName = `chat-${currentUserId}-${recipientId}-${crypto.randomUUID()}`;
    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          // Use the ref to ensure we only capture messages for the current chat
          if (activeConvIdRef.current && payload.new.conversation_id === activeConvIdRef.current) {
            setMessages((prev) => {
              if (prev.find(m => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, currentUserId, recipientId]);

  const handleEstablishConnection = async () => {
    setIsConnecting(true);

    const { error } = await supabase.from("follows").insert({
      follower_id: currentUserId,
      following_id: recipientId
    });

    if (!error) {
      await supabase.from("notifications").insert({
        user_id: recipientId,
        actor_id: currentUserId,
        type: "follow",
        message: "added you to their network to initiate a secure chat.",
      });

      setIsConnected(true);
      await loadConversationData();
    } else {
      console.error("Failed to connect:", error.message);
    }

    setIsConnecting(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !isConnected) return;

    let currentConvId = conversation?.id;

    if (!currentConvId) {
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert([{ initiator_id: currentUserId, recipient_id: recipientId, status: "approved" }])
        .select()
        .single();

      if (convError) {
        console.error("Failed to create conversation:", convError.message);
        return;
      }

      if (newConv) {
        setConversation(newConv);
        currentConvId = newConv.id;
        activeConvIdRef.current = newConv.id;
      }
    }

    if (currentConvId) {
      const msgContent = messageInput;
      setMessageInput(""); // Clear UI instantly for good UX

      // Include .select().single() to return the newly generated row immediately
      const { data: insertedMsg, error: msgError } = await supabase.from("messages").insert([{
        conversation_id: currentConvId,
        sender_id: currentUserId,
        content: msgContent,
      }]).select().single();

      if (msgError) {
        console.error("Failed to send message:", msgError.message);
      } else if (insertedMsg) {
        // Push the new message directly into the state so the sender sees it immediately
        setMessages((prev) => {
          if (prev.find(m => m.id === insertedMsg.id)) return prev;
          return [...prev, insertedMsg];
        });

        await supabase.from("notifications").insert({
          user_id: recipientId,
          actor_id: currentUserId,
          type: "message",
          message: "sent you a secure message.",
          reference_id: currentConvId
        });
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {isMounted && (
        <>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="mb-3 w-80 sm:w-96 rounded-3xl border border-white/15 bg-slate-950/95 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col h-[480px]"
              >
                <div className="bg-slate-900/90 border-b border-white/10 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center font-bold text-black text-xs uppercase shadow-md">
                        {recipientInitials}
                      </div>
                      {isConnected && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />}
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
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>

                {!isConnected && !isLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 bg-slate-900/50">
                    <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <UserX size={28} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-white font-bold text-sm">Network Connection Required</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        End-to-End Encrypted Chat is strictly isolated to your active network. You must add <strong>{recipientName}</strong> to your network before initiating a secure channel.
                      </p>
                    </div>

                    <button
                      onClick={handleEstablishConnection}
                      disabled={isConnecting}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-black font-bold text-xs transition hover:scale-105 disabled:opacity-50 shadow-lg shadow-cyan-500/20"
                    >
                      {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                      Add to Network & Connect
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-4 py-1.5 text-center text-[10px] text-cyan-300 font-semibold flex items-center justify-center gap-1.5">
                      <ShieldCheck size={12} className="text-cyan-400" />
                      <span>Messages protected with zero-knowledge encryption</span>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                      {isLoading ? (
                        <div className="text-center text-xs text-slate-500 mt-10">Establishing secure connection...</div>
                      ) : messages.length === 0 ? (
                        <div className="text-center text-xs text-slate-500 mt-10 italic">Connection secured. Start the conversation.</div>
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
                      {/* Invisible element to anchor the auto-scroll */}
                      <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="border-t border-white/10 p-3 bg-slate-900/50 flex items-center gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type encrypted message..."
                        className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="p-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-black font-bold disabled:opacity-40 transition hover:scale-105"
                      >
                        <Send size={14} />
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

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
        </>
      )}
    </div>
  );
}