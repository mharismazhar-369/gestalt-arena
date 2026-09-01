"use client";

import { createContext, useContext, useState } from "react";
import EncryptedChatPopup from "@/components/chat/EncryptedChatPopup";
import { useAuth } from "@/components/auth/AuthProvider";

interface ChatContextType {
    openChat: (recipientId: string, recipientName?: string, recipientInitials?: string) => void;
    closeChat: () => void;
}

const ChatContext = createContext<ChatContextType>({
    openChat: () => { },
    closeChat: () => { },
});

export const useChat = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { session } = useAuth();
    const [activeChat, setActiveChat] = useState<{ id: string; name?: string; initials?: string } | null>(null);

    return (
        <ChatContext.Provider value={{
            openChat: (id, name, initials) => setActiveChat({ id, name, initials }),
            closeChat: () => setActiveChat(null)
        }}>
            {children}

            {session?.user && activeChat && (
                <EncryptedChatPopup
                    currentUserId={session.user.id}
                    recipientId={activeChat.id}
                    recipientName={activeChat.name}
                    recipientInitials={activeChat.initials}
                />
            )}
        </ChatContext.Provider>
    );
}