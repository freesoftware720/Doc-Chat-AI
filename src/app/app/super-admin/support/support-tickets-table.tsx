
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { SupportTicketWithMessageCount } from "@/app/actions/support";
import { ArrowRight } from "lucide-react";

type Ticket = SupportTicketWithMessageCount;

const statusConfig = {
    open: { label: "Open", variant: "default" as const },
    in_progress: { label: "In Progress", variant: "secondary" as const },
    closed: { label: "Closed", variant: "destructive" as const },
};


export function SupportTicketsTable({ tickets }: { tickets: Ticket[] }) {
    const [filter, setFilter] = useState("open");

    const filteredTickets = tickets.filter(req => filter === 'all' || req.status === filter);

    return (
        <div>
            <div className="flex items-center py-4 gap-2">
                <Button variant={filter === 'open' ? 'default' : 'outline'} onClick={() => setFilter('open')}>Open</Button>
                <Button variant={filter === 'in_progress' ? 'default' : 'outline'} onClick={() => setFilter('in_progress')}>In Progress</Button>
                <Button variant={filter === 'closed' ? 'default' : 'outline'} onClick={() => setFilter('closed')}>Closed</Button>
                <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTickets.map(ticket => {
                            const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || { label: "Unknown", variant: "secondary" as const };
                            return (
                                <TableRow key={ticket.id}>
                                    <TableCell>
                                        <div className="font-medium">{ticket.user_name}</div>
                                        <div className="text-xs text-muted-foreground">{ticket.user_email}</div>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate">{ticket.subject}</TableCell>
                                    <TableCell><Badge variant={statusInfo.variant} className="capitalize">{statusInfo.label}</Badge></TableCell>
                                    <TableCell className="text-muted-foreground">{formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/app/super-admin/support/${ticket.id}`}>
                                                View <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {filteredTickets.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No {filter === 'all' ? '' : filter} tickets found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

