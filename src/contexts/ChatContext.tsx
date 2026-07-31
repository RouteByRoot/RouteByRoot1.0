import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  conversation_id: string; // Typically `travelerId-guideId`
  sender_id: string;
  sender_role: 'traveler' | 'guide';
  content: string;
  created_at: string;
  read: boolean;
}

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (msg: Omit<ChatMessage, 'id' | 'created_at' | 'read'>) => void;
  markAsRead: (conversationId: string, userId: string) => void;
  getMessagesForConversation: (conversationId: string) => ChatMessage[];
  getUserConversations: (userId: string) => ChatMessage[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('routebyroot_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse chat messages:', e);
      }
    }
    return [
      {
        id: 'msg-1',
        conversation_id: 'mock-traveler-1_L-default-1',
        sender_id: 'L-default-1',
        sender_role: 'guide',
        content: 'Hi! I am looking forward to our Tokyo Night Exploration tour. Do you have any dietary restrictions for our food stops?',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        read: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('routebyroot_chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Support for listening to local storage changes across different tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'routebyroot_chat_messages' && e.newValue) {
        setMessages(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const sendMessage = (msgData: Omit<ChatMessage, 'id' | 'created_at' | 'read'>) => {
    const newMsg: ChatMessage = {
      ...msgData,
      id: `msg-${Date.now()}`,
      read: false,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const markAsRead = (conversationId: string, userId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.conversation_id === conversationId && m.sender_id !== userId && !m.read) {
        return { ...m, read: true };
      }
      return m;
    }));
  };

  const getMessagesForConversation = (conversationId: string) => {
    return messages.filter(m => m.conversation_id === conversationId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const getUserConversations = (userId: string) => {
    // Return all messages where the user is either the traveler or the guide (based on conversation_id format `travelerId_guideId`)
    return messages.filter(m => m.conversation_id.includes(userId));
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, markAsRead, getMessagesForConversation, getUserConversations }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
