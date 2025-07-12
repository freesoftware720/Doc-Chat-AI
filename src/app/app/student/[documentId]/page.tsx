
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { StudentHubClient } from "./student-hub-client";

export default async function StudentHubPage({ params }: { params: { documentId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user.id)
        .single();
    
    // Redirect if user is not on the Student plan
    if (profile?.subscription_plan !== 'Student') {
        redirect('/app/billing');
    }

    const { data: document, error: docError } = await supabase
        .from('documents')
        .select('id, name, content')
        .eq('id', params.documentId)
        .eq('user_id', user.id)
        .single();
    
    if (docError || !document) {
        console.error("Document not found or access denied:", docError);
        return (
            <div className="flex h-full items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-lg">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Error Loading Document</AlertTitle>
                    <AlertDescription>
                       The document could not be found or you do not have permission to access it.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    if (!document.content) {
         return (
            <div className="flex h-full items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-lg">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Document is Empty</AlertTitle>
                    <AlertDescription>
                       This document has no text content to process. Please try another document.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <StudentHubClient document={document} />
    );
}
