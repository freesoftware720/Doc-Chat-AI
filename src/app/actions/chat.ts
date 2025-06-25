
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getMessages(documentId: string) {
    const supabase = createClient();
     const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error.message);
        throw new Error(error.message);
    }
    return data;
}

export async function getChatHistory() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // This query is more complex now. It finds the most recent message for each document
    // to represent a "chat session".
    const { data, error } = await supabase.rpc('get_user_chat_history');

    if (error) {
        console.error('Error fetching chat history:', error.message);
        return [];
    }

    return data.map((item: any) => ({
        document_id: item.document_id,
        document_name: item.document_name,
        last_message_at: item.last_message_at,
    }));
}
