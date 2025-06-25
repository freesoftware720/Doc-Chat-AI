
"use client";

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/chat-interface';
import type { Message } from '@/components/chat-interface';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Persona } from '@/ai/flows/pdf-analyzer';

interface ChatPageClientProps {
    documentId: string;
    documentName: string;
    initialMessages: Message[];
    pdfUrl: string;
}

const personaOptions: { value: Persona, label: string }[] = [
    { value: 'general', label: 'General Assistant' },
    { value: 'legal', label: 'Legal Expert' },
    { value: 'academic', label: 'Academic Researcher' },
    { value: 'business', label: 'Business Analyst' },
    { value: 'summarizer', label: 'Summarizer' },
];

export function ChatPageClient({ documentId, documentName, initialMessages, pdfUrl }: ChatPageClientProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const [persona, setPersona] = useState<Persona>('general');

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
        const assistantPlaceholder: Message = { id: 'assistant-streaming', role: "assistant", content: "" };
        
        setMessages(prev => [...prev, userMessage, assistantPlaceholder]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId, query: content, persona }),
            });

            if (!response.ok || !response.body) {
                const errorData = await response.json().catch(() => ({ error: "An unknown error occurred." }));
                throw new Error(errorData.error || `Request failed with status ${response.status}`);
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
    
    const personaSelector = (
        <Select value={persona} onValueChange={(value) => setPersona(value as Persona)}>
            <SelectTrigger className="w-full md:w-[200px] bg-card/80">
                <SelectValue placeholder="Select a persona" />
            </SelectTrigger>
            <SelectContent>
                {personaOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full p-4">
            <Card className="h-full hidden lg:flex flex-col bg-card/60 backdrop-blur-md border-white/10 shadow-lg overflow-hidden rounded-2xl">
                 <iframe 
                    src={pdfUrl} 
                    className="w-full h-full border-0" 
                    title={documentName}
                />
            </Card>
            <div className="h-full lg:col-span-1">
                 <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    documentName={documentName}
                    onReset={() => router.push('/app')}
                    headerControls={personaSelector}
                />
            </div>
        </div>
    );
}
