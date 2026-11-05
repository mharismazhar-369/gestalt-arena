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

  // Sync and open conversation if recipientId is provided or changes
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

  // 3. Open Specific Chat & Enforce Limits
  const openChat = async (conv: any) => {
    setActiveConv(conv);
    activeConvIdRef.current = conv.id;
    setView('chat');

    const otherUserId = conv.initiator?.id === currentUserId
      ? (conv.recipient?.id || recipientId)
      : (conv.initiator?.id || recipientId);

    // Fetch Messages
    const { data: msgData } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });

    if (msgData) {
      setMessages(msgData);

      // Instantly mark unread messages as read and update DB
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

  // 4. Realtime Listener (Fixed DELETE payload bug)
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
          // DELETE events only have payload.old, payload.new is null.
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
      alert("Failed to upload file.");
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

  // 7. Message Actions
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

  // 8. Nudge Feature
  const handleNudge = async () => {
    if (!activeConv) return;
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && 'vibrate' in navigator) {
      try { navigator.vibrate([200, 100, 200]); } catch (e) { }
    }
    try {
      const audio = new Audio('/nudge.mp3');
      audio.play().catch(() => { });
    } catch (e) { }

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
            className="w-full h-[100dvh] md:w-[400px] md:h-[650px] md:rounded-3xl border-0 md:border md:border-slate-200/50 bg-white/95 shadow-2xl backdrop-blur-3xl overflow-hidden flex flex-col relative"
          >
            {/* INBOX VIEW */}
            {view === 'inbox' && (
              <>
                <div className="bg-slate-900 px-6 py-5 flex items-center justify-between shadow-md z-10">
                  <h3 className="font-black text-white text-lg tracking-wide">Arena Messages</h3>
                  <button onClick={handleClose} className="text-slate-400 hover:text-white transition">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar p-2 space-y-2">
                  {conversations.length === 0 ? (
                    <div className="text-center py-12 px-4 text-slate-400 text-xs">No conversations yet. Messages will appear here.</div>
                  ) : (
                    conversations.map(conv => {
                      const partner = (conv.initiator?.id === currentUserId ? conv.recipient : conv.initiator) || {};
                      return (
                        <div key={conv.id} onClick={() => openChat(conv)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white transition cursor-pointer border border-transparent hover:border-slate-200 shadow-sm">
                          <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center shrink-0 border-2 border-white shadow-sm overflow-hidden">
                            {partner.avatar_url ? <img src={partner.avatar_url} alt="avatar" className="object-cover w-full h-full" /> : <User size={20} className="text-slate-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{partner.nickname || partner.company_name || "User"}</h4>
                            <p className="text-xs text-slate-500 truncate mt-0.5">Click to view conversation...</p>
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
                <div className="bg-slate-900 px-4 py-4 flex items-center justify-between shadow-md z-10">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setView('inbox')} className="text-slate-400 hover:text-white transition">
                      <ChevronLeft size={24} />
                    </button>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{otherUser?.nickname || otherUser?.company_name || recipientName || "User"}</h4>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                        Secure Channel {connectionStatus !== 'accepted' && '(Unconnected)'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleNudge} title="Send Nudge" className="text-amber-400 bg-amber-400/10 p-2 rounded-full hover:bg-amber-400/20 transition">
                      <BellRing size={16} />
                    </button>
                    <button onClick={handleClose} title="Close Chat" className="text-slate-400 hover:text-white transition p-1">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/80 custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 px-4 text-slate-400 text-xs italic">Connection secured. Start the conversation.</div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === currentUserId;
                      const isModifiable = canModify(msg);
                      return (
                        <div key={msg.id} className={`flex flex-col group ${isMe ? "items-end" : "items-start"}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm relative ${isMe ? "bg-slate-900 text-white rounded-br-none" : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"}`}>

                            {/* FIXED: Media Attachment Renderer */}
                            {msg.attachment_url && (
                              <div className="mb-2 mt-1 rounded-lg overflow-hidden border border-white/10 bg-black/10">
                                {msg.attachment_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                                  <img src={msg.attachment_url} alt="Attachment" className="max-w-full h-auto max-h-48 object-cover" loading="lazy" />
                                ) : (
                                  <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 text-xs font-bold hover:bg-black/20 transition">
                                    <Paperclip size={14} /> View File
                                  </a>
                                )}
                              </div>
                            )}

                            {msg.content}

                            {/* FIXED: Edit/Delete now visible on mobile via opacity toggles rather than hidden */}
                            {isMe && isModifiable && (
                              <div className="absolute -left-16 top-0 flex items-center gap-1 bg-white border border-slate-200 shadow-sm rounded-lg p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(msg)} className="p-1.5 text-slate-400 hover:text-blue-500 transition"><Edit2 size={12} /></button>
                                <button onClick={() => handleDelete(msg.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition"><Trash2 size={12} /></button>
                              </div>
                            )}
                          </div>

                          <div className="text-[9px] text-slate-400 mt-1.5 px-1 flex items-center gap-1 font-semibold">
                            {msg.is_edited && <span className="italic mr-1">(edited)</span>}
                            {msg.created_at && new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && (
                              <span className={`ml-1 transition-colors ${msg.read_at ? "text-emerald-500" : "text-slate-400"}`}>
                                {msg.read_at ? <CheckCheck size={12} /> : <Check size={12} />}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-slate-200 bg-white p-4">
                  {isInputLocked ? (
                    <div className="text-center p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex flex-col items-center gap-1">
                      <X size={16} /> Connection limit reached. Waiting for their reply.
                    </div>
                  ) : (
                    <form onSubmit={handleSend} className="flex items-end gap-2">
                      <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 p-1 flex items-center focus-within:border-slate-900 transition-all">

                        {/* File Upload Trigger */}
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf,.doc" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-2.5 text-slate-400 hover:text-slate-900 transition disabled:opacity-50">
                          {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
                        </button>

                        <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder={editingMsgId ? "Edit your message..." : "Message..."} className="flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none" />

                        <button type="button" className="p-2.5 text-slate-400 hover:text-amber-500 transition"><Smile size={18} /></button>
                      </div>

                      <button type="submit" disabled={!messageInput.trim() && !isUploading} className={`p-3.5 rounded-2xl flex items-center justify-center transition-all shadow-md ${messageInput.trim() ? 'bg-slate-900 text-white hover:scale-105' : 'bg-slate-200 text-slate-400'}`}>
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
        <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 flex items-center justify-center h-14 w-14 rounded-full bg-slate-900 text-white shadow-2xl transition-all hover:scale-105 hover:bg-slate-800">
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
}