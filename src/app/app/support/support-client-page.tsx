
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createSupportTicket } from '@/app/actions/support';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LifeBuoy, Ticket, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

type Ticket = {
    id: string;
    subject: string;
    status: string;
    updated_at: string;
    message_count: number;
}

const statusConfig = {
    open: { label: "Open", variant: "default" as const },
    in_progress: { label: "In Progress", variant: "secondary" as const },
    closed: { label: "Closed", variant: "destructive" as const },
};


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} size="lg">
            {pending ? <Loader2 className="animate-spin" /> : 'Create Ticket'}
        </Button>
    )
}

export function SupportClientPage({ tickets }: { tickets: Ticket[] }) {
    const [state, formAction] = useActionState(createSupportTicket, null);
    const { toast } = useToast();
    
    useEffect(() => {
        if (state?.error) {
            toast({ variant: 'destructive', title: 'Error', description: state.error });
        }
    }, [state, toast]);
    
    const closedTickets = tickets.filter(t => t.status === 'closed');
    
    return (
        <div className="p-4 md:p-6 space-y-6">
            <header>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">Support Center</h1>
                <p className="text-muted-foreground mt-1">Get help or create a new support ticket.</p>
            </header>
            
            <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LifeBuoy /> Create a New Support Ticket</CardTitle>
                    <CardDescription>Our team will get back to you as soon as possible. You can only have one open ticket at a time.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4 max-w-2xl">
                        <div>
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" name="subject" placeholder="e.g., Issue with document upload" required />
                        </div>
                        <div>
                            <Label htmlFor="message">How can we help?</Label>
                            <Textarea id="message" name="message" placeholder="Describe your issue in detail..." required rows={6}/>
                        </div>
                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
            
            {closedTickets.length > 0 && (
                <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                    <CardHeader>
                        <CardTitle>Closed Tickets</CardTitle>
                        <CardDescription>Review your past support conversations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {closedTickets.map(ticket => {
                                const status = statusConfig[ticket.status as keyof typeof statusConfig] || { label: "Unknown", variant: "secondary" as const };
                                return (
                                <li key={ticket.id}>
                                    <Link href={`/app/support/${ticket.id}`}>
                                        <div className="flex items-center justify-between p-4 rounded-lg transition-colors hover:bg-muted/50 border">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <Ticket className="h-6 w-6 text-primary flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold truncate">{ticket.subject}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Last updated {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
                                                        <span className="mx-2">&bull;</span>
                                                        {ticket.message_count} messages
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={status.variant}>{status.label}</Badge>
                                        </div>
                                    </Link>
                                </li>
                            )})}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

