
"use client";

import { useActionState, useEffect, useRef } from "react";
import { adminReplyToTicket, updateTicketStatus, type SupportTicketWithMessages } from "@/app/actions/support";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFormStatus } from "react-dom";
import { Loader2, Send, User, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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

function StatusUpdateButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Status'}
        </Button>
    )
}

export function AdminTicketChatClient({ ticket, adminUser }: { ticket: SupportTicketWithMessages, adminUser: SupabaseUser }) {
    const [replyState, replyAction] = useActionState(adminReplyToTicket, null);
    const [statusState, statusAction] = useActionState(updateTicketStatus, null);
    const formRef = useRef<HTMLFormElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (replyState?.success) {
            formRef.current?.reset();
        } else if (replyState?.error) {
            toast({ variant: 'destructive', title: 'Reply Error', description: replyState.error });
        }
    }, [replyState, toast]);

    useEffect(() => {
        if (statusState?.success) {
            toast({ title: 'Success', description: statusState.success });
        } else if (statusState?.error) {
            toast({ variant: 'destructive', title: 'Status Error', description: statusState.error });
        }
    }, [statusState, toast]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [ticket.support_messages]);
    
    const isTicketClosed = ticket.status === 'closed';
    const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || { label: "Unknown", variant: "secondary" as const };

    return (
        <div className="flex flex-col h-[calc(100vh-18rem)] bg-card/60 backdrop-blur-md border-white/10 shadow-lg rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-lg gap-4">
                <div className="flex-1 overflow-hidden">
                    <h2 className="font-semibold text-lg font-headline truncate" title={ticket.subject}>
                        {ticket.subject}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Ticket #{ticket.id.substring(0, 8)}</span>
                    </div>
                </div>
                <form action={statusAction} className="flex items-center gap-2">
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    <Select name="status" defaultValue={ticket.status}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                    <StatusUpdateButton />
                </form>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                    {ticket.support_messages.map(message => {
                        const isAdmin = message.sender_role === 'admin';
                        return (
                            <div key={message.id} className={cn("flex items-start gap-4", isAdmin && "justify-end")}>
                                {!isAdmin && (
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>
                                            <User className="h-5 w-5"/>
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                                 <div className="max-w-2xl">
                                    <div
                                        className={cn(
                                            "rounded-2xl px-5 py-3 shadow-lg",
                                            isAdmin ? "bg-primary text-primary-foreground rounded-br-lg" : "bg-card/60 backdrop-blur-md border border-white/10 rounded-bl-lg"
                                        )}
                                    >
                                        <p className="text-base whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                     <p className={cn("text-xs text-muted-foreground mt-1 px-2", isAdmin ? "text-right" : "text-left")}>
                                        {format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
                                    </p>
                                </div>

                                {isAdmin && (
                                     <Avatar className="h-9 w-9 bg-primary/10 border border-primary/20 text-primary">
                                        <AvatarFallback className="bg-transparent">
                                            <Shield className="h-5 w-5"/>
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
                    <p className="text-center text-sm text-muted-foreground">This ticket is closed. Re-open it to send a reply.</p>
                ) : (
                    <form ref={formRef} action={replyAction} className="flex items-start gap-4 max-w-4xl mx-auto">
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
    );
}
