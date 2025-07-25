
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMessages } from "@/app/actions/chat";
import { ChatPageClient } from "./chat-page-client";
import type { Message } from "@/components/chat-interface";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

export default async function ChatWithDocumentPage({ params }: { params: { documentId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const { data: document, error: docError } = await supabase
        .from('documents')
        .select('id, name, content')
        .eq('id', params.documentId)
        .eq('user_id', user.id)
        .single();
    
    if (docError || !document) {
        console.error("Document not found or access denied:", docError);
        redirect('/app');
    }

    let initialMessages = [];
    let chatError: string | null = null;
    try {
        initialMessages = await getMessages(document.id);
    } catch (e: any) {
        console.error("Error loading chat history:", e.message);
        chatError = e.message;
    }
    
    if (chatError) {
        return (
            <div className="flex h-full items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-lg">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Error Loading Chat</AlertTitle>
                    <AlertDescription>
                        <p>Could not load the conversation history due to a database error:</p>
                        <pre className="mt-2 text-xs bg-muted p-2 rounded-md overflow-x-auto"><code>{chatError}</code></pre>
                        <p className="mt-2 text-sm">
                           This can happen after database changes. Please go to the <strong>API Docs</strong> section of your Supabase dashboard and click <strong>"Reload"</strong> to refresh the schema cache.
                        </p>
                         <p className="mt-2 text-sm">
                           If you don't see a "Reload" button, you can also <strong>pause and restart your project</strong> in Project Settings to force a refresh.
                        </p>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    const formattedMessages: Message[] = initialMessages.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content
    }));

    return (
        <ChatPageClient
            documentId={document.id}
            documentName={document.name}
            documentContent={document.content || 'No content available for this document.'}
            initialMessages={formattedMessages}
        />
    );
}
