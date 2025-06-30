
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Loader, ArrowLeft, FileText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  documentName: string;
  onReset: () => void;
  headerControls?: React.ReactNode;
  isLimitReached: boolean;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  documentName,
  onReset,
  headerControls,
  isLimitReached,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userHasScrolledUp = useRef(false);

  useEffect(() => {
    // This effect handles scrolling. It will only auto-scroll if the user
    // has not manually scrolled up. This prevents the view from jumping
    // down while the user is trying to read previous messages.
    if (!userHasScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const isAtBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 10;
      userHasScrolledUp.current = !isAtBottom;
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      // When user sends a message, we want to override any scroll lock
      // and ensure the new message is visible.
      userHasScrolledUp.current = false;
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/60 backdrop-blur-md border-white/10 shadow-lg rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-lg gap-2">
         <Button variant="ghost" size="icon" onClick={onReset} aria-label="Back to dashboard" className="mr-2 shrink-0">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-3 overflow-hidden">
          <FileText className="h-6 w-6 text-primary flex-shrink-0" />
          <h2 className="font-semibold text-lg font-headline truncate" title={documentName}>{documentName}</h2>
        </div>
        <div className="flex-grow"></div>
        <div className="hidden md:flex shrink-0">{headerControls}</div>
      </div>
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <AnimatePresence>
            {messages.map((message, index) => {
              const isStreaming = isLoading && message.role === 'assistant' && index === messages.length - 1;

              return (
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
                    <Avatar className="h-9 w-9 bg-primary/10 border border-primary/20 text-primary">
                      <AvatarFallback className="bg-transparent">
                          <Bot className="h-5 w-5"/>
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-2xl rounded-2xl px-5 py-3 shadow-lg",
                      {
                        "bg-primary text-primary-foreground rounded-br-lg": message.role === "user",
                        "bg-card/60 backdrop-blur-md border border-white/10 rounded-bl-lg": message.role === "assistant",
                      },
                      "prose dark:prose-invert prose-p:my-2 prose-headings:my-3 max-w-none"
                    )}
                  >
                    <p className="text-base whitespace-pre-wrap">
                      {message.content}
                      {isStreaming && <span className="typing-cursor" />}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-9 w-9">
                       <AvatarFallback>
                          <User className="h-5 w-5"/>
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t p-4 bg-background/80 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto">
            {isLimitReached ? (
                <div className="text-center p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <h4 className="font-bold text-amber-600 dark:text-amber-400">Daily Limit Reached</h4>
                    <p className="text-sm text-amber-700/80 dark:text-amber-500/80 mt-1">
                        You've used all your free messages for today. Upgrade to Pro for unlimited messages.
                    </p>
                    <Button asChild size="sm" className="mt-4">
                        <Link href="/app/settings">
                            <Star className="mr-2 h-4 w-4" />
                            Upgrade to Pro
                        </Link>
                    </Button>
                </div>
            ) : (
              <>
                <div className="flex md:hidden w-full mb-2">{headerControls}</div>
                <form onSubmit={handleSubmit} className="flex items-center gap-4">
                  <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask anything about your document..."
                      className="flex-1 bg-card/80 rounded-full px-5 h-12 text-base border-border/50 focus:border-primary focus:ring-primary/50"
                      disabled={isLoading}
                  />
                  <Button type="submit" className="rounded-full h-12 w-12" size="icon" disabled={isLoading || !input.trim()}>
                      {isLoading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      <span className="sr-only">Send</span>
                  </Button>
                </form>
              </>
            )}
        </div>
      </div>
    </div>
  );
}
