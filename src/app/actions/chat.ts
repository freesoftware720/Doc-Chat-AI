
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { analyzePdf, AnalyzePdfInput } from '@/ai/flows/pdf-analyzer';
import type { TablesInsert } from '@/lib/supabase/database.types';

export async function getChatSession(documentId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Upsert ensures a session exists, and returns it.
    const { data: session, error } = await supabase
        .from('chat_sessions')
        .upsert(
            { document_id: documentId, user_id: user.id } as TablesInsert<'chat_sessions'>,
            { onConflict: 'user_id,document_id', ignoreDuplicates: false }
        )
        .select()
        .single();

    if (error || !session) {
        console.error('Error getting or creating chat session:', error);
        throw new Error(`Could not get or create a chat session. DB Error: ${error?.message}`);
    }

    return session;
}

export async function getMessages(sessionId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
    return data;
}

async function addMessage(sessionId: string, userId: string, role: 'user' | 'assistant', content: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('messages')
        .insert({ session_id: sessionId, user_id: userId, role, content });

    if (error) {
        console.error(`Error saving ${role} message:`, error);
        // Propagate the actual database error message for better debugging
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
        const session = await getChatSession(documentId);

        // 1. Save user's message
        await addMessage(session.id, user.id, 'user', content);

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
        await addMessage(session.id, user.id, 'assistant', result.answer);

        revalidatePath(`/app/chat/${documentId}`);
        
        return result;

    } catch (error: any) {
        console.error("Error in sendMessage flow:", error);
        // Re-throw with a more specific message for the client
        throw new Error(error.message);
    }
}

export async function getChatHistory() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
            id,
            created_at,
            document:documents(id, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching chat history:', error);
        return [];
    }
    
    // The type from Supabase is a bit complex, let's simplify it
    return data.map(item => ({
        id: item.id,
        created_at: item.created_at,
        document_id: item.document?.id,
        document_name: item.document?.name,
    })).filter(item => item.document_id); // Filter out sessions with no document
}
