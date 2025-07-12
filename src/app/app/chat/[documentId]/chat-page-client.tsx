
"use client";

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/chat-interface';
import type { Message } from '@/components/chat-interface';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatPageClientProps {
    documentId: string;
    documentName: string;
    documentContent: string;
    initialMessages: Message[];
}

export function ChatPageClient({ documentId, documentName, documentContent, initialMessages }: ChatPageClientProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const [isLimitReached, setIsLimitReached] = useState(false);
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
        if (isLimitReached) return;

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

            if (response.status === 429) {
                const errorText = await response.text();
                setIsLimitReached(true);
                setMessages(prev => [
                    ...prev.slice(0, -2), // remove optimistic user message and placeholder
                    { id: 'limit-reached-msg', role: 'assistant', content: errorText || "You've reached your daily message limit." }
                ]);
                return;
            }

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full p-4">
            <Card className="h-full hidden lg:flex flex-col bg-card/60 backdrop-blur-md border-white/10 shadow-lg overflow-hidden rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {documentName}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans p-2">
                           {documentContent}
                        </pre>
                    </ScrollArea>
                </CardContent>
            </Card>
            <div className="h-full lg:col-span-1">
                 <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    documentName={documentName}
                    onReset={() => router.push('/app')}
                    isLimitReached={isLimitReached}
                />
            </div>
        </div>
    );
}
