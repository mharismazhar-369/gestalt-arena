"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare, X, ChevronLeft, Send, Paperclip, Smile,
  Edit2, Trash2, BellRing, Check, CheckCheck, Clock, User, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

export interface EncryptedChatPopupProps {
  currentUserId: string;
  recipientId?: string;
  recipientName?: string;
  recipientInitials?: string;
  onClose?: () => void;
}

export default function EncryptedChatPopup({
  currentUserId,
  recipientId,
  recipientName,
  recipientInitials,
  onClose
}: EncryptedChatPopupProps) {
  const [isOpen, setIsOpen] = useState(Boolean(recipientId));
  const [view, setView] = useState<'inbox' | 'chat'>(recipientId ? 'chat' : 'inbox');
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const [messageInput, setMessageInput] = useState("");
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('none');
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeConvIdRef = useRef<string | null>(null);

  // 1. Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, view]);

  // 2. Fetch Inbox (All user conversations)
  const fetchInbox = async () => {
    if (!currentUserId) return;
    const { data: convData } = await supabase
      .from("conversations")
      .select(`
        id, status, created_at,
        initiator:profiles!initiator_id(id, nickname, company_name, avatar_url),
        recipient:profiles!recipient_id(id, nickname, company_name, avatar_url)
      `)
      .or(`initiator_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
      .order('created_at', { ascending: false });

    if (convData) setConversations(convData);
  };

  useEffect(() => {
    if (isOpen && view === 'inbox') fetchInbox();
  }, [isOpen, view]);

  const openConversationWithRecipient = async (targetRecipientId: string) => {
    if (!currentUserId || !targetRecipientId) return;

    let { data: convData } = await supabase
      .from("conversations")
      .select(`
        id, status, created_at,
        initiator:profiles!initiator_id(id, nickname, company_name, avatar_url),
        recipient:profiles!recipient_id(id, nickname, company_name, avatar_url)
      `)
      .or(`and(initiator_id.eq.${currentUserId},recipient_id.eq.${targetRecipientId}),and(initiator_id.eq.${targetRecipientId},recipient_id.eq.${currentUserId})`)
      .maybeSingle();

    if (!convData) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert([{ initiator_id: currentUserId, recipient_id: targetRecipientId, status: "approved" }])
        .select(`
          id, status, created_at,
          initiator:profiles!initiator_id(id, nickname, company_name, avatar_url),
          recipient:profiles!recipient_id(id, nickname, company_name, avatar_url)
        `).single();
      convData = newConv;
    }

    if (convData) openChat(convData);
  };

  useEffect(() => {
    if (recipientId) {
      setIsOpen(true);
      openConversationWithRecipient(recipientId);
    }
  }, [recipientId]);

  // 3. Open Specific Chat & Mark as Read
  const openChat = async (conv: any) => {
    setActiveConv(conv);
    activeConvIdRef.current = conv.id;
    setView('chat');

    const otherUserId = conv.initiator?.id === currentUserId
      ? (conv.recipient?.id || recipientId)
      : (conv.initiator?.id || recipientId);

    const { data: msgData } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });

    if (msgData) {
      setMessages(msgData);

      const unreadIds = msgData.filter(m => m.sender_id !== currentUserId && !m.read_at).map(m => m.id);
      if (unreadIds.length > 0) {
        const now = new Date().toISOString();
        await supabase.from("messages").update({ read_at: now }).in('id', unreadIds);
        setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, read_at: now } : m));
      }
    }

    if (otherUserId) {
      const { data: connData } = await supabase
        .from("connections")
        .select("status")
        .or(`and(requester_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .maybeSingle();
      setConnectionStatus(connData?.status || 'none');
    }
  };

  // 4. Realtime Listener
  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel(`chat-hub-${currentUserId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          if (activeConvIdRef.current && payload.new?.conversation_id === activeConvIdRef.current) {
            setMessages(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
          }
        } else if (payload.eventType === 'UPDATE') {
          if (activeConvIdRef.current && payload.new?.conversation_id === activeConvIdRef.current) {
            setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
          }
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id !== payload.old?.id));
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId]);

  // 5. Send Text Message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConv) return;

    if (editingMsgId) {
      const { data } = await supabase.from("messages")
        .update({ content: messageInput, is_edited: true })
        .eq("id", editingMsgId)
        .select().single();

      if (data) setMessages(prev => prev.map(m => m.id === editingMsgId ? data : m));
      setEditingMsgId(null);
    } else {
      const { data } = await supabase.from("messages").insert([{
        conversation_id: activeConv.id,
        sender_id: currentUserId,
        content: messageInput
      }]).select().single();

      if (data) {
        setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data]);
        const otherUserId = activeConv.initiator?.id === currentUserId ? activeConv.recipient?.id : activeConv.initiator?.id;
        if (otherUserId) {
          await supabase.from("notifications").insert({
            user_id: otherUserId, actor_id: currentUserId, type: "message",
            message: "sent you a message.", reference_id: activeConv.id
          });
        }
      }
    }
    setMessageInput("");
  };

  // 6. Handle File / Image Upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('chat_media').upload(fileName, file);

    if (uploadError) {
      console.error("Upload failed:", uploadError);
      alert("Failed to upload file. Check storage policies.");
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('chat_media').getPublicUrl(fileName);

    const { data } = await supabase.from("messages").insert([{
      conversation_id: activeConv.id,
      sender_id: currentUserId,
      content: "Shared an attachment",
      attachment_url: publicUrl
    }]).select().single();

    if (data) {
      setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data]);
    }
    setIsUploading(false);
  };

  const handleDelete = async (msgId: string) => {
    await supabase.from("messages").delete().eq("id", msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  const startEdit = (msg: any) => {
    setEditingMsgId(msg.id);
    setMessageInput(msg.content);
  };

  const canModify = (msg: any) => {
    if (msg.sender_id !== currentUserId) return false;
    return (Date.now() - new Date(msg.created_at).getTime()) < 10 * 60 * 1000;
  };

  // 7. Nudge Feature (Now creates an in-chat message)
  const handleNudge = async () => {
    if (!activeConv) return;

    // Hardware Vibration
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && 'vibrate' in navigator) {
      try { navigator.vibrate([200, 100, 200]); } catch (e) { }
    }

    // Sound playback
    try {
      const audio = new Audio('/nudge.mp3');
      audio.play().catch(() => { });
    } catch (e) { }

    // CREATE IN-CHAT NUDGE MESSAGE
    const { data: nudgeMsg } = await supabase.from("messages").insert([{
      conversation_id: activeConv.id,
      sender_id: currentUserId,
      content: "👉 Nudged!"
    }]).select().single();

    if (nudgeMsg) {
      setMessages(prev => prev.some(m => m.id === nudgeMsg.id) ? prev : [...prev, nudgeMsg]);
    }

    // Top Bar Notification
    const otherUserId = activeConv.initiator?.id === currentUserId ? activeConv.recipient?.id : activeConv.initiator?.id;
    if (otherUserId) {
      await supabase.from("notifications").insert({
        user_id: otherUserId, actor_id: currentUserId, type: "nudge",
        message: "nudged you in chat!", reference_id: activeConv.id
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const otherUser = activeConv
    ? (activeConv.initiator?.id === currentUserId ? activeConv.recipient : activeConv.initiator) || { id: recipientId, nickname: recipientName || "User" }
    : (recipientId ? { id: recipientId, nickname: recipientName || "User" } : null);

  const sentByMe = messages.filter(m => m.sender_id === currentUserId).length;
  const sentByThem = messages.filter(m => m.sender_id !== currentUserId).length;
  const isInputLocked = connectionStatus !== 'accepted' && sentByThem === 0 && sentByMe >= 3;

  return (
    <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-[100] flex flex-col items-end pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full h-[100dvh] md:w-[400px] md:h-[650px] md:rounded-3xl neu-flat-base border-none overflow-hidden flex flex-col relative"
          >
            {/* INBOX VIEW */}
            {view === 'inbox' && (
              <>
                <div className="px-6 py-5 flex items-center justify-between border-b border-[var(--secondary)]/10 z-10 bg-[var(--primary)]">
                  <h3 className="font-black text-[var(--secondary)] text-lg tracking-wide">Arena Messages</h3>
                  <button onClick={handleClose} className="text-[var(--secondary)]/50 hover:text-[var(--accent)] transition">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-[var(--primary)]">
                  {conversations.length === 0 ? (
                    <div className="text-center py-12 px-4 text-[var(--secondary)]/50 text-xs font-bold">
                      No conversations yet. Messages will appear here.
                    </div>
                  ) : (
                    conversations.map(conv => {
                      const partner = (conv.initiator?.id === currentUserId ? conv.recipient : conv.initiator) || {};
                      return (
                        <div key={conv.id} onClick={() => openChat(conv)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--secondary)]/5 transition cursor-pointer border border-transparent hover:border-[var(--secondary)]/10">
                          <div className="h-12 w-12 rounded-full neu-pressed-base flex items-center justify-center shrink-0 overflow-hidden border border-[var(--secondary)]/5">
                            {partner.avatar_url ? <img src={partner.avatar_url} alt="avatar" className="object-cover w-full h-full" /> : <User size={20} className="text-[var(--secondary)]/50" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-[var(--secondary)] truncate">{partner.nickname || partner.company_name || "User"}</h4>
                            <p className="text-xs text-[var(--secondary)]/50 truncate mt-0.5 font-medium">Click to view conversation...</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {/* ACTIVE CHAT VIEW */}
            {view === 'chat' && (activeConv || otherUser) && (
              <>
                <div className="px-4 py-4 flex items-center justify-between border-b border-[var(--secondary)]/10 z-10 bg-[var(--primary)]">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setView('inbox')} className="text-[var(--secondary)]/50 hover:text-[var(--accent)] transition">
                      <ChevronLeft size={24} />
                    </button>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--secondary)] leading-tight">{otherUser?.nickname || otherUser?.company_name || recipientName || "User"}</h4>
                      <span className="text-[10px] text-[var(--accent)] font-bold flex items-center gap-1 mt-0.5">
                        Secure Channel {connectionStatus !== 'accepted' && '(Unconnected)'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleNudge} title="Send Nudge" className="text-[var(--accent)] bg-[var(--accent)]/10 p-2 rounded-full hover:bg-[var(--accent)]/20 transition">
                      <BellRing size={16} />
                    </button>
                    <button onClick={handleClose} title="Close Chat" className="text-[var(--secondary)]/50 hover:text-[var(--secondary)] transition p-1">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-[var(--primary)]">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 px-4 text-[var(--secondary)]/50 font-bold text-xs italic">
                      Connection secured. Start the conversation.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === currentUserId;
                      const isModifiable = canModify(msg);
                      const isNudge = msg.content === "👉 Nudged!";

                      return (
                        <div key={msg.id} className={`flex flex-col group ${isMe ? "items-end" : "items-start"}`}>

                          {/* DYNAMIC MESSAGE BUBBLE RENDERING */}
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm relative ${isNudge
                              ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 font-black italic shadow-inner"
                              : isMe
                                ? "bg-[var(--secondary)] text-[var(--primary)] rounded-br-none"
                                : "neu-flat-base border border-[var(--secondary)]/5 shadow-none text-[var(--secondary)] rounded-bl-none"
                            }`}>

                            {/* Media Attachment Renderer */}
                            {msg.attachment_url && (
                              <div className="mb-2 mt-1 rounded-lg overflow-hidden border border-[var(--primary)]/20 bg-black/20">
                                {msg.attachment_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                                  <img src={msg.attachment_url} alt="Attachment" className="max-w-full h-auto max-h-48 object-cover" loading="lazy" />
                                ) : (
                                  <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 text-xs font-bold hover:bg-black/30 transition">
                                    <Paperclip size={14} /> View File
                                  </a>
                                )}
                              </div>
                            )}

                            <span className={isNudge ? "" : "font-medium"}>{msg.content}</span>

                            {/* Floating Edit/Delete */}
                            {isMe && isModifiable && !isNudge && (
                              <div className="absolute -left-16 top-0 flex items-center gap-1 bg-[var(--primary)] border border-[var(--secondary)]/10 shadow-sm rounded-lg p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(msg)} className="p-1.5 text-[var(--secondary)]/50 hover:text-[var(--accent)] transition"><Edit2 size={12} /></button>
                                <button onClick={() => handleDelete(msg.id)} className="p-1.5 text-[var(--secondary)]/50 hover:text-rose-500 transition"><Trash2 size={12} /></button>
                              </div>
                            )}
                          </div>

                          {/* TIMESTAMP & EXPLICIT READ RECEIPTS */}
                          <div className={`text-[9px] mt-1.5 px-1 flex items-center gap-1 font-bold ${isMe ? 'text-[var(--secondary)]/50' : 'text-[var(--secondary)]/50'}`}>
                            {msg.is_edited && <span className="italic mr-1">(edited)</span>}
                            {msg.created_at && new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

                            {isMe && (
                              <span className={`ml-1 flex items-center gap-0.5 transition-colors ${msg.read_at ? "text-[var(--accent)]" : "text-[var(--secondary)]/40"}`}>
                                {msg.read_at ? (
                                  <>
                                    <CheckCheck size={14} />
                                    <span className="text-[8px] font-black uppercase tracking-wider ml-0.5">Seen</span>
                                  </>
                                ) : (
                                  <Check size={14} />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-[var(--secondary)]/10 bg-[var(--primary)] p-4">
                  {isInputLocked ? (
                    <div className="text-center p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex flex-col items-center gap-1">
                      <X size={16} /> Connection limit reached. Waiting for their reply.
                    </div>
                  ) : (
                    <form onSubmit={handleSend} className="flex items-end gap-2">
                      <div className="flex-1 neu-pressed-base border border-[var(--secondary)]/5 p-1 flex items-center focus-within:ring-1 focus-within:ring-[var(--accent)] transition-all">

                        {/* File Upload Trigger */}
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf,.doc" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-2.5 text-[var(--secondary)]/50 hover:text-[var(--accent)] transition disabled:opacity-50">
                          {isUploading ? <Loader2 size={18} className="animate-spin text-[var(--accent)]" /> : <Paperclip size={18} />}
                        </button>

                        <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder={editingMsgId ? "Edit your message..." : "Message..."} className="flex-1 bg-transparent px-2 py-2 text-sm text-[var(--secondary)] placeholder-[var(--secondary)]/50 focus:outline-none font-medium" />

                        <button type="button" className="p-2.5 text-[var(--secondary)]/50 hover:text-[var(--accent)] transition"><Smile size={18} /></button>
                      </div>

                      <button type="submit" disabled={!messageInput.trim() && !isUploading} className={`p-3.5 rounded-xl flex items-center justify-center transition-all ${messageInput.trim() ? 'bg-[var(--secondary)] text-[var(--primary)] shadow-lg hover:scale-105' : 'bg-[var(--secondary)]/10 text-[var(--secondary)]/30 shadow-none'}`}>
                        {editingMsgId ? <Check size={18} /> : <Send size={18} className="translate-x-0.5" />}
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 flex items-center justify-center h-14 w-14 rounded-full neu-flat-base text-[var(--accent)] shadow-2xl transition-all hover:scale-105 z-[100] border border-[var(--secondary)]/10">
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
}