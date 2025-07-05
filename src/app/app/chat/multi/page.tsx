
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MultiChatPageClient } from "./multi-chat-page-client";
import { getAppSettings } from "@/app/actions/settings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MultiChatPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const settingsPromise = getAppSettings();
    const profilePromise = supabase.from('profiles').select('subscription_plan, pro_credits').eq('id', user.id).single();
    
    const [settings, { data: profile }] = await Promise.all([settingsPromise, profilePromise]);

    const isPro = (profile?.subscription_plan === 'Pro' || (profile?.pro_credits ?? 0) > 0);
    const multiDocEnabled = settings.feature_multi_pdf_enabled;

    if (!isPro || !multiDocEnabled) {
        // We can show an error page or redirect. Redirecting is cleaner.
        redirect('/app/billing');
    }

    const docIdsParam = searchParams?.ids;
    if (!docIdsParam || typeof docIdsParam !== 'string') {
        return (
            <div className="flex h-full items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-lg">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Missing Documents</AlertTitle>
                    <AlertDescription>
                        No document IDs were provided in the URL. Please select documents from the uploads page to start a chat.
                        <Button asChild variant="outline" className="mt-4 w-full"><Link href="/app/uploads">Go to Uploads</Link></Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const documentIds = docIdsParam.split(',').filter(id => id); // Filter out empty strings

    if (documentIds.length < 2) {
        if (documentIds.length === 1) redirect(`/app/chat/${documentIds[0]}`);
         return (
            <div className="flex h-full items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-lg">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Not Enough Documents</AlertTitle>
                    <AlertDescription>
                        Please select at least two documents to start a multi-document chat.
                        <Button asChild variant="outline" className="mt-4 w-full"><Link href="/app/uploads">Go to Uploads</Link></Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const { data: documents, error } = await supabase
        .from('documents')
        .select('id, name')
        .in('id', documentIds)
        .eq('user_id', user.id);

    if (error || !documents || documents.length !== documentIds.length) {
         return (
            <div className="flex h-full items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-lg">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Error Loading Documents</AlertTitle>
                    <AlertDescription>
                       Could not load one or more of the selected documents. They may have been deleted or you may not have permission to access them.
                       <Button asChild variant="outline" className="mt-4 w-full"><Link href="/app/uploads">Go to Uploads</Link></Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    const documentName = `${documents.length} documents`;

    return (
        <MultiChatPageClient
            documentIds={documentIds}
            documentName={documentName}
        />
    );
}
