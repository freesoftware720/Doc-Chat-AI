
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { replyToTicket, type SupportTicketWithMessages, type TicketMessage } from "@/app/actions/support";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFormStatus } from "react-dom";
import { Loader2, Send, ArrowLeft, User, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from '@supabase/supabase-js';

const statusConfig = {
    open: { label: "Open", variant: "default" as const },
    in_progress: { label: "In Progress", variant: "secondary" as const },
    closed: { label: "Closed", variant: "destructive" as const },
};

function ReplyButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="icon" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
    )
}

export function TicketChatClient({ ticket, currentUser }: { ticket: SupportTicketWithMessages, currentUser: SupabaseUser }) {
    const router = useRouter();
    const [state, formAction] = useActionState(replyToTicket, null);
    const formRef = useRef<HTMLFormElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
        }
    }, [state]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [ticket.support_messages]);
    
    const isTicketClosed = ticket.status === 'closed';
    const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || { label: "Unknown", variant: "secondary" as const };

    return (
        <div className="flex flex-col h-full p-4">
            <div className="flex flex-col h-full bg-card/60 backdrop-blur-md border-white/10 shadow-lg rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-lg gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/app/support')} aria-label="Back to support" className="mr-2 shrink-0">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="flex-1 overflow-hidden">
                        <h2 className="font-semibold text-lg font-headline truncate" title={ticket.subject}>
                            {ticket.subject}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Ticket #{ticket.id.substring(0, 8)}</span>
                             <Badge variant={statusInfo.variant} className="capitalize">{statusInfo.label}</Badge>
                        </div>
                    </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {ticket.support_messages.map(message => {
                            const isCurrentUser = message.sender_id === currentUser.id;
                            const isAdmin = message.sender_role === 'admin';
                            return (
                                <div key={message.id} className={cn("flex items-start gap-4", isCurrentUser && "justify-end")}>
                                    {!isCurrentUser && (
                                        <Avatar className="h-9 w-9 bg-primary/10 border border-primary/20 text-primary">
                                            <AvatarFallback className="bg-transparent">
                                                {isAdmin ? <Shield className="h-5 w-5"/> : <User className="h-5 w-5"/>}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                     <div className="max-w-2xl">
                                        <div
                                            className={cn(
                                                "rounded-2xl px-5 py-3 shadow-lg",
                                                isCurrentUser ? "bg-primary text-primary-foreground rounded-br-lg" : "bg-card/60 backdrop-blur-md border border-white/10 rounded-bl-lg"
                                            )}
                                        >
                                            <p className="text-base whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                         <p className={cn("text-xs text-muted-foreground mt-1 px-2", isCurrentUser ? "text-right" : "text-left")}>
                                            {format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
                                        </p>
                                    </div>

                                    {isCurrentUser && (
                                         <Avatar className="h-9 w-9">
                                            <AvatarFallback>
                                                <User className="h-5 w-5"/>
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Reply Form */}
                <div className="border-t p-4 bg-background/80 backdrop-blur-lg">
                    {isTicketClosed ? (
                        <p className="text-center text-sm text-muted-foreground">This ticket is closed. Create a new ticket for further assistance.</p>
                    ) : (
                        <form ref={formRef} action={formAction} className="flex items-start gap-4 max-w-4xl mx-auto">
                            <input type="hidden" name="ticketId" value={ticket.id} />
                            <Textarea 
                                name="content"
                                placeholder="Type your reply..."
                                className="flex-1 bg-card/80 rounded-xl px-4 h-12 text-base border-border/50 focus:border-primary focus:ring-primary/50"
                                required
                                minLength={10}
                                rows={1}
                            />
                            <ReplyButton />
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

