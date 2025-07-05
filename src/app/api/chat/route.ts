
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import {
  defaultSystemPrompt,
  relevanceCheckPrompt,
} from '@/ai/flows/file-analyzer-config';
import { getAppSettings } from '@/app/actions/settings';
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic'; // Prevent caching

// Helper to save messages for single-document chats
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
        const { documentId, documentIds, query } = await req.json();

        if ((!documentId && !documentIds) || !query) {
            return new NextResponse('Missing documentId(s) or query', { status: 400 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('User not authenticated', { status: 401 });
        }
        
        const isMultiDoc = Array.isArray(documentIds) && documentIds.length > 0;

        // --- Profile & Permissions Check ---
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_plan, chat_credits_used, chat_credits_last_reset, pro_credits')
            .eq('id', user.id)
            .single();

        const appSettings = await getAppSettings();
        const isPro = (profile?.subscription_plan === 'Pro' || (profile?.pro_credits ?? 0) > 0);
        
        if (isMultiDoc && (!isPro || !appSettings.feature_multi_pdf_enabled)) {
            return new NextResponse('Multi-document chat is a Pro feature and is not enabled.', { status: 403 });
        }
        
        const isFreePlan = !isPro;
        if (isFreePlan) {
            const limit = appSettings.chat_limit_free_user;
            let used = profile?.chat_credits_used || 0;
            
            const lastReset = profile?.chat_credits_last_reset ? new Date(profile.chat_credits_last_reset) : new Date(0);
            const now = new Date();
            const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

            if (hoursSinceReset >= 24) {
                used = 0;
            }

            if (used >= limit) {
                 return new NextResponse(`You have reached your daily message limit of ${limit}. Please upgrade or try again tomorrow.`, { status: 429 });
            }
        }
        
        // --- Document Content Retrieval ---
        let documentContent: string | null = null;
        if (isMultiDoc) {
             const { data: documents, error } = await supabase
                .from('documents')
                .select('content, name')
                .in('id', documentIds)
                .eq('user_id', user.id);

            if (error || !documents || documents.length !== documentIds.length) {
                return new NextResponse('One or more documents not found or access denied.', { status: 404 });
            }
            // Combine content with clear separators for the AI
            documentContent = documents
                .map(d => `--- Document: ${d.name} ---\n${d.content}`)
                .join('\n\n');
        } else {
             await addMessage(documentId, user.id, 'user', query);
             const { data: document } = await supabase
                .from('documents')
                .select('content')
                .eq('id', documentId)
                .eq('user_id', user.id)
                .single();

            if (!document || !document.content) {
                return new NextResponse('Document content not found.', { status: 404 });
            }
            documentContent = document.content;
        }

        // --- AI Processing ---
        const CHUNK_SIZE = 2000;
        const CHUNK_OVERLAP = 200;
        const chunks: string[] = [];
        for (let i = 0; i < documentContent.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
            chunks.push(documentContent.substring(i, i + CHUNK_SIZE));
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
             if (!isMultiDoc) {
                await addMessage(documentId, user.id, 'assistant', noInfoMessage);
            }
            return new NextResponse(noInfoMessage, { status: 200 });
        }

        const context = relevantChunks.join('\n---\n');
        const systemPrompt = defaultSystemPrompt;
        const finalPrompt = `Context:\n---\n${context}\n---\n\nUser Question: ${query}\n\nAnswer:`;

        const { stream, response } = ai.generateStream({
            model: ai.model,
            system: systemPrompt,
            prompt: finalPrompt,
            config: { temperature: 0.2 },
        });

        // In the background, save full response and update credits (for single-doc chats)
        response.then(async (fullResponse) => {
            const fullText = fullResponse.text;
            if (fullText && !isMultiDoc) {
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
