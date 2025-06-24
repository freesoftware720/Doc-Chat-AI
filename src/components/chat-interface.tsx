"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Loader, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Toaster } from "./ui/toaster";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  pdfName: string;
  onReset: () => void;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  pdfName,
  onReset,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] bg-background">
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="font-semibold text-lg font-headline truncate" title={pdfName}>{pdfName}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onReset} aria-label="Close chat">
          <XCircle className="h-6 w-6 text-muted-foreground hover:text-foreground" />
        </Button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={cn("flex items-start gap-4", {
                  "justify-end": message.role === "user",
                })}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback>
                        <Bot className="h-5 w-5"/>
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-xl rounded-lg px-4 py-3 shadow-md",
                    {
                      "bg-primary text-primary-foreground": message.role === "user",
                      "bg-card border": message.role === "assistant",
                    },
                    "prose dark:prose-invert prose-p:my-2 prose-headings:my-3"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                     <AvatarFallback>
                        <User className="h-5 w-5"/>
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4"
            >
              <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
              </Avatar>
              <div className="bg-card border rounded-lg px-4 py-3 shadow-md flex items-center">
                <Loader className="h-5 w-5 animate-spin mr-2 text-primary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t p-4 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your document..."
            className="flex-1 bg-card/50"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
      <Toaster />
    </div>
  );
}
