import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const IA_API_URL = (import.meta.env.VITE_IA_URL || 'http://localhost:8002').replace(/\/$/, '');

export type MessageType = 'welcome' | 'text' | 'processing' | 'rich-recipe' | 'out-of-stock';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  type: MessageType;
  content?: string;
  step?: number;
  query?: string;
};

export function useChatbot() {
  const { isGuest, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', type: 'welcome' }
  ]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (isGuest) {
      setShowAuthModal(true);
      return;
    }
    
    if (!text.trim() || isProcessing) return;

    const newMsg: Message = { id: Date.now().toString(), role: 'user', type: 'text', content: text };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsProcessing(true);

    const processingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: processingId, role: 'assistant', type: 'processing', step: 1 }]);

    try {
      setMessages(prev => prev.map(m => m.id === processingId ? { ...m, step: 2 } : m));

      const response = await fetch(`${IA_API_URL}/chat/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: text })
      });

      setMessages(prev => prev.map(m => m.id === processingId ? { ...m, step: 3 } : m));

      const data = await response.json();
      setMessages(prev => prev.filter(m => m.id !== processingId));

      if (data.error) {
        console.error("Error devuelto por la IA:", data.error);
        setMessages(prev => [...prev, { id: (Date.now() + 2).toString(), role: 'assistant', type: 'text', content: 'Lo siento, en este momento no puedo procesar tu solicitud. Por favor intenta más tarde.' }]);
      } else {
        setMessages(prev => [...prev, { id: (Date.now() + 2).toString(), role: 'assistant', type: 'text', content: data.explicacion || 'Procesado.' }]);
      }
    } catch (error) {
      console.error("Excepción al contactar la API:", error);
      setMessages(prev => prev.filter(m => m.id !== processingId));
      setMessages(prev => [...prev, { id: (Date.now() + 2).toString(), role: 'assistant', type: 'text', content: 'Lo siento, hay problemas de conexión con mis servicios en este momento.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setMessages([{ id: Date.now().toString(), role: 'assistant', type: 'welcome' }]);
  };

  return {
    user,
    messages,
    inputValue,
    setInputValue,
    isProcessing,
    showAuthModal,
    setShowAuthModal,
    scrollRef,
    handleSend,
    handleClear
  };
}
