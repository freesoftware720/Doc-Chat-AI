
"use client";

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/chat-interface';
import type { Message } from '@/components/chat-interface';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ChatTabProps {
    documentId: string;
    documentName: string;
}

export function ChatTab({ documentId, documentName }: ChatTabProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        setMessages([
          {
            id: 'initial-assistant-message',
            role: 'assistant',
            content: `I'm ready to answer questions about "${documentName}". What would you like to know?`,
          }
        ]);
    }, [documentName]);

    const handleSendMessage = async (content: string) => {
        const userMessage: Message = { id: Date.now().toString(), role: "user", content };
        const assistantPlaceholder: Message = { id: 'assistant-streaming', role: "assistant", content: "" };
        
        setMessages(prev => [...prev, userMessage, assistantPlaceholder]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId, query: content }),
            });

            if (!response.ok || !response.body) {
                const errorText = await response.text().catch(() => "An unknown error occurred.");
                throw new Error(errorText || `Request failed with status ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === 'assistant-streaming'
                            ? { ...msg, content: msg.content + chunk }
                            : msg
                    )
                );
            }

        } catch (error: any) {
            console.error("Error sending message:", error);
            toast({
                variant: "destructive",
                title: "Message Error",
                description: error.message || "An unknown error occurred. Please try again.",
            });
            // remove the user message and placeholder if the call failed
            setMessages(prev => prev.slice(0, -2));
        } finally {
            setIsLoading(false);
            setMessages((prev) => prev.map(m => m.id === 'assistant-streaming' ? { ...m, id: (Date.now() + 1).toString() } : m));
        }
    };
    
    return (
        <div className="h-full">
            <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                documentName={documentName}
                onReset={() => router.push('/app/uploads')}
                isLimitReached={false} // Student plan has no limit
            />
        </div>
    );
}
