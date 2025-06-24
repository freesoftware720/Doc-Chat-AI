
"use client";

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/chat-interface';
import type { Message } from '@/components/chat-interface';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ChatPageClientProps {
    documentId: string;
    documentName: string;
    initialMessages: Message[];
    sendMessageAction: (documentId: string, content: string) => Promise<any>;
}

export function ChatPageClient({ documentId, documentName, initialMessages, sendMessageAction }: ChatPageClientProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
      if (messages.length === 0) {
        setMessages([
          {
            id: 'initial-assistant-message',
            role: 'assistant',
            content: `I'm ready to answer questions about "${documentName}". What would you like to know?`,
          }
        ]);
      }
    }, [messages.length, documentName]);

    const handleSendMessage = async (content: string) => {
        const userMessage: Message = { id: Date.now().toString(), role: "user", content };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const result = await sendMessageAction(documentId, content);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: result.answer,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            toast({
                variant: "destructive",
                title: "Analysis Error",
                description: "An error occurred while sending your message. Please try again.",
            });
            // remove the user message if the call failed
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            documentName={documentName}
            onReset={() => router.push('/app')}
        />
    );
}
