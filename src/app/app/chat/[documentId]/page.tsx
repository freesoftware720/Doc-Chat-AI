
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getChatSession, getMessages, sendMessage } from "@/app/actions/chat";
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
        .select('id, name, content, storage_path')
        .eq('id', params.documentId)
        .eq('user_id', user.id)
        .single();
    
    if (docError || !document) {
        console.error("Document not found or access denied:", docError);
        redirect('/app');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(document.storage_path);
    
    if (!publicUrl) {
      console.error("Could not get public URL for document:", document.storage_path);
      return (
        <div className="flex h-full items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-lg">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Error Loading Document</AlertTitle>
                <AlertDescription>
                    Could not generate a public URL for the PDF. Please ensure you have a public Supabase Storage bucket named "documents" and that the file exists.
                </AlertDescription>
            </Alert>
        </div>
      )
    }

    const session = await getChatSession(document.id);
    const initialMessages = await getMessages(session.id);
    
    const formattedMessages: Message[] = initialMessages.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content
    }));

    return (
        <ChatPageClient
            documentId={document.id}
            documentName={document.name}
            initialMessages={formattedMessages}
            sendMessageAction={sendMessage}
            pdfUrl={publicUrl}
        />
    );
}
