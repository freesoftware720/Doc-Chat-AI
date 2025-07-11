
import { notFound, redirect } from 'next/navigation';
import { getTicketById } from '@/app/actions/support';
import { TicketChatClient } from './ticket-chat-client';
import type { Tables } from '@/lib/supabase/database.types';
import { createClient } from '@/lib/supabase/server';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

export type TicketMessage = Tables<'support_messages'>;

export default async function TicketPage({ params }: { params: { ticketId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const ticket = await getTicketById(params.ticketId);

    if (!ticket) {
        return (
             <div className="flex h-full items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-lg">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Ticket Not Found</AlertTitle>
                    <AlertDescription>
                        The requested support ticket could not be found, or you do not have permission to view it.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }
    
    return (
        <TicketChatClient ticket={ticket} currentUser={user} />
    )
}
