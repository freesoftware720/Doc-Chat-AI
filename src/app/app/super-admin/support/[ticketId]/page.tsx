
import { notFound, redirect } from 'next/navigation';
import { getAdminTicketById } from '@/app/actions/support';
import type { Tables } from '@/lib/supabase/database.types';
import { createClient } from '@/lib/supabase/server';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';
import { AdminTicketChatClient } from './admin-ticket-chat-client';
import { isSuperAdmin } from '@/app/actions/super-admin';

export default async function AdminTicketPage({ params }: { params: { ticketId: string } }) {
    if (!(await isSuperAdmin())) {
        redirect('/app');
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const ticket = await getAdminTicketById(params.ticketId);

    if (!ticket) {
        return (
             <div className="flex h-full items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-lg">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Ticket Not Found</AlertTitle>
                    <AlertDescription>
                        The requested support ticket could not be found.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }
    
    return (
        <AdminTicketChatClient ticket={ticket} adminUser={user!} />
    )
}
