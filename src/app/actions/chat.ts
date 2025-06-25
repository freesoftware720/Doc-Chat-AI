
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { analyzePdf, AnalyzePdfInput } from '@/ai/flows/pdf-analyzer';
import type { TablesInsert } from '@/lib/supabase/database.types';

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

async function addMessage(documentId: string, userId: string, role: 'user' | 'assistant', content: string) {
    const supabase = createClient();
    const message: TablesInsert<'messages'> = {
      document_id: documentId,
      user_id: userId,
      role,
      content,
    };
    const { error } = await supabase.from('messages').insert(message);

    if (error) {
        console.error(`Error saving ${role} message:`, error.message);
        throw new Error(`Failed to save ${role} message. DB error: ${error.message}`);
    }
}

export async function sendMessage(documentId: string, content: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data: document } = await supabase
        .from('documents')
        .select('content')
        .eq('id', documentId)
        .single();
    
    if (!document || !document.content) {
        throw new Error('Document content not found.');
    }

    try {
        // 1. Save user's message
        await addMessage(documentId, user.id, 'user', content);

        // 2. Call AI flow
        const aiInput: AnalyzePdfInput = {
            documentContent: document.content,
            query: content,
        };
        const result = await analyzePdf(aiInput);
        
        if (!result || !result.answer) {
             throw new Error('AI analysis failed to produce an answer.');
        }

        // 3. Save assistant's message
        await addMessage(documentId, user.id, 'assistant', result.answer);

        revalidatePath(`/app/chat/${documentId}`);
        
        return result;

    } catch (error: any) {
        console.error("Error in sendMessage flow:", error.message);
        throw new Error(error.message);
    }
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
