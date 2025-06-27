
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import {
  personaSystemPrompts,
  relevanceCheckPrompt,
} from '@/ai/flows/pdf-analyzer-config';
import type { Persona } from '@/ai/flows/pdf-analyzer';
import { getAppSettings } from '@/app/actions/settings';
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic'; // Prevent caching

// Helper to save messages
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
        // Don't throw, just log, as the chat should continue
    }
}

export async function POST(req: Request) {
    try {
        const { documentId, query, persona } = await req.json();

        if (!documentId || !query) {
            return new NextResponse('Missing documentId or query', { status: 400 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('User not authenticated', { status: 401 });
        }

        // Check chat credit limit
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_plan, chat_credits_used, chat_credits_last_reset')
            .eq('id', user.id)
            .single();

        const isFreePlan = !profile?.subscription_plan || profile.subscription_plan === 'Free';
        if (isFreePlan) {
            const appSettings = await getAppSettings();
            const limit = appSettings.chat_limit_free_user;
            let used = profile?.chat_credits_used || 0;
            
            const lastReset = profile?.chat_credits_last_reset ? new Date(profile.chat_credits_last_reset) : new Date(0);
            const now = new Date();
            const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

            if (hoursSinceReset >= 24) {
                used = 0; // It's been a day, we can treat their usage as 0 for this check
            }

            if (used >= limit) {
                 return new NextResponse(`You have reached your daily message limit of ${limit}. Please upgrade or try again tomorrow.`, { status: 429 });
            }
        }
        
        // Save user message to DB
        await addMessage(documentId, user.id, 'user', query);

        const { data: document } = await supabase
            .from('documents')
            .select('content')
            .eq('id', documentId)
            .single();

        if (!document || !document.content) {
            return new NextResponse('Document content not found.', { status: 404 });
        }
        
        // Chunking and relevance check logic (from pdf-analyzer.ts)
        const CHUNK_SIZE = 2000;
        const CHUNK_OVERLAP = 200;
        const chunks: string[] = [];
        for (let i = 0; i < document.content.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
            chunks.push(document.content.substring(i, i + CHUNK_SIZE));
        }

        const relevanceChecks = await Promise.all(
            chunks.map(async chunk => {
                const { output } = await relevanceCheckPrompt({ chunk, query });
                return { chunk, isRelevant: output?.isRelevant ?? false };
            })
        );
        const relevantChunks = relevanceChecks.filter(check => check.isRelevant).map(check => check.chunk);
        
        if (relevantChunks.length === 0) {
            const noInfoMessage = 'I could not find any relevant information in the document to answer your question.';
            await addMessage(documentId, user.id, 'assistant', noInfoMessage);
            return new NextResponse(noInfoMessage, { status: 200 });
        }

        const context = relevantChunks.join('\n---\n');
        const systemPrompt = personaSystemPrompts[persona as Persona ?? 'general'];
        const finalPrompt = `Context:\n---\n${context}\n---\n\nUser Question: ${query}\n\nAnswer:`;

        const { stream, response } = ai.generateStream({
            model: ai.model,
            system: systemPrompt,
            prompt: finalPrompt,
            config: { temperature: 0.2 },
        });

        // In the background (don't await), save full response and update credits
        response.then(async (fullResponse) => {
            const fullText = fullResponse.text;
            if (fullText) {
                await addMessage(documentId, user.id, 'assistant', fullText);
                
                if (isFreePlan) {
                    const lastReset = profile?.chat_credits_last_reset ? new Date(profile.chat_credits_last_reset) : new Date(0);
                    const now = new Date();
                    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
                    
                    let dataToUpdate: TablesUpdate<'profiles'>;
                    if (hoursSinceReset >= 24) {
                        dataToUpdate = { chat_credits_used: 1, chat_credits_last_reset: now.toISOString() };
                    } else {
                        dataToUpdate = { chat_credits_used: (profile?.chat_credits_used || 0) + 1 };
                    }

                    await supabase.from('profiles').update(dataToUpdate).eq('id', user.id);
                }
            }
        });

        // Return the stream to the client
        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    if (chunk.text) {
                        controller.enqueue(new TextEncoder().encode(chunk.text));
                    }
                }
                controller.close();
            }
        });

        return new Response(readableStream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error: any) {
        console.error("Error in chat stream:", error);
        const errorMessage = error.message || "An internal server error occurred.";
        return new NextResponse(errorMessage, { status: 500 });
    }
}
