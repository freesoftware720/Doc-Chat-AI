
'use server';

import { createClient } from '@/lib/supabase/server';
import { serviceSupabase } from '@/lib/supabase/service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Tables, TablesInsert } from '@/lib/supabase/database.types';

export type SupportTicketWithMessages = Tables<'support_tickets'> & {
    support_messages: Tables<'support_messages'>[];
};

export type SupportTicketWithMessageCount = Tables<'support_tickets'> & {
    message_count: number;
    user_email: string;
    user_name: string | null;
};


// --- User Actions ---

export async function getUserTickets() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('support_tickets')
        .select(`
            *,
            support_messages ( id )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error("Error fetching user tickets:", error);
        throw new Error(error.message);
    }
    
    // Quick and dirty way to get message count without another query per ticket
    return data.map(t => ({...t, message_count: t.support_messages.length}));
}


export async function getTicketById(ticketId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
        .from('support_tickets')
        .select(`
            *,
            support_messages (*)
        `)
        .eq('id', ticketId)
        .eq('user_id', user.id)
        .order('created_at', { referencedTable: 'support_messages', ascending: true })
        .single();

    if (error) {
        console.error(`Error fetching ticket ${ticketId}:`, error);
        return null;
    }

    return data;
}

export async function createSupportTicket(prevState: any, formData: FormData) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: 'You must be logged in to create a ticket.' };
        }
        
        // Check if user already has an open ticket
        const { data: openTickets, error: openTicketError } = await supabase
            .from('support_tickets')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'open');

        if (openTicketError) {
             return { error: `Database error: ${openTicketError.message}` };
        }
        if (openTickets.length > 0) {
            return { error: 'You already have an open ticket. Please wait for a response.' };
        }

        const subject = formData.get('subject') as string;
        const message = formData.get('message') as string;

        if (!subject || !message) {
            return { error: 'Subject and message are required.' };
        }
        
        // Create the ticket first
        const newTicket: TablesInsert<'support_tickets'> = {
            user_id: user.id,
            subject: subject,
            status: 'open',
        };
        const { data: ticket, error: ticketError } = await supabase
            .from('support_tickets')
            .insert(newTicket)
            .select()
            .single();

        if (ticketError) {
            return { error: `Could not create ticket: ${ticketError.message}` };
        }

        // Then, add the initial message
        const newMessage: TablesInsert<'support_messages'> = {
            ticket_id: ticket.id,
            sender_id: user.id,
            content: message,
            sender_role: 'user',
        };
        const { error: messageError } = await supabase.from('support_messages').insert(newMessage);

        if (messageError) {
            // Attempt to roll back the ticket creation if message fails
            await supabase.from('support_tickets').delete().eq('id', ticket.id);
            return { error: `Could not send message: ${messageError.message}` };
        }
        
        revalidatePath('/app/support');
    } catch (e: any) {
        return { error: `An unexpected error occurred: ${e.message}` };
    }
    
    redirect('/app/support');
}


export async function replyToTicket(prevState: any, formData: FormData) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: 'You must be logged in to reply.' };
        }

        const ticketId = formData.get('ticketId') as string;
        const content = formData.get('content') as string;

        if (!ticketId || !content) {
            return { error: 'Missing ticket ID or message content.' };
        }
        
        // Verify user owns the ticket before replying
        const { data: ticket } = await supabase.from('support_tickets').select('id').eq('id', ticketId).eq('user_id', user.id).single();
        if (!ticket) {
            return { error: 'Ticket not found or you do not have permission to reply.' };
        }

        const newMessage: TablesInsert<'support_messages'> = {
            ticket_id: ticketId,
            sender_id: user.id,
            content: content,
            sender_role: 'user',
        };
        const { error } = await supabase.from('support_messages').insert(newMessage);

        if (error) {
            return { error: `Could not send reply: ${error.message}` };
        }

        revalidatePath(`/app/support/${ticketId}`);
        return { success: true };
    } catch(e: any) {
        return { error: `An unexpected error occurred: ${e.message}` };
    }
}


// --- Admin Actions ---
export async function getAllTicketsForAdmin(): Promise<SupportTicketWithMessageCount[]> {
    if (!serviceSupabase) throw new Error("Service client not initialized.");

    const { data: tickets, error } = await serviceSupabase
        .from('support_tickets')
        .select(`
            *,
            support_messages(id)
        `)
        .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);
    if (!tickets) return [];
    
    // Get user details
    const userIds = [...new Set(tickets.map(t => t.user_id))];
    const { data: { users }, error: usersError } = await serviceSupabase.auth.admin.listUsers();
    if (usersError) throw new Error(usersError.message);
    
    const userMap = new Map(users.map(u => [u.id, { email: u.email, name: u.user_metadata.full_name }]));

    return tickets.map(t => ({
        ...t,
        message_count: t.support_messages.length,
        user_email: userMap.get(t.user_id)?.email || 'Unknown',
        user_name: userMap.get(t.user_id)?.name || 'Unknown',
    }));
}

export async function getAdminTicketById(ticketId: string) {
    if (!serviceSupabase) throw new Error("Service client not initialized.");
    
    const { data, error } = await serviceSupabase
        .from('support_tickets')
        .select(`
            *,
            support_messages (*)
        `)
        .eq('id', ticketId)
        .order('created_at', { referencedTable: 'support_messages', ascending: true })
        .single();

    if (error) {
        console.error(`Admin: Error fetching ticket ${ticketId}:`, error);
        return null;
    }

    return data;
}

export async function adminReplyToTicket(prevState: any, formData: FormData) {
     try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: 'You must be logged in to reply.' };
        }

        const ticketId = formData.get('ticketId') as string;
        const content = formData.get('content') as string;

        if (!ticketId || !content) {
            return { error: 'Missing ticket ID or message content.' };
        }

        const newMessage: TablesInsert<'support_messages'> = {
            ticket_id: ticketId,
            sender_id: user.id,
            content: content,
            sender_role: 'admin',
        };
        
        // Use service client to bypass RLS for admin replies
        const { error } = await serviceSupabase!.from('support_messages').insert(newMessage);

        if (error) {
            return { error: `Could not send reply: ${error.message}` };
        }

        revalidatePath(`/app/super-admin/support/${ticketId}`);
        return { success: true };
    } catch(e: any) {
        return { error: `An unexpected error occurred: ${e.message}` };
    }
}

export async function updateTicketStatus(prevState: any, formData: FormData) {
     try {
        if (!serviceSupabase) throw new Error("Service client not initialized.");
        
        const ticketId = formData.get('ticketId') as string;
        const status = formData.get('status') as string;

        if (!ticketId || !status) {
             return { error: 'Missing required fields.' };
        }
        
        const { error } = await serviceSupabase
            .from('support_tickets')
            .update({ status: status })
            .eq('id', ticketId);

        if (error) {
            return { error: `Failed to update status: ${error.message}` };
        }

        revalidatePath(`/app/super-admin/support`);
        revalidatePath(`/app/super-admin/support/${ticketId}`);
        return { success: "Ticket status updated." };
    } catch(e: any) {
        return { error: `An unexpected error occurred: ${e.message}` };
    }
}
