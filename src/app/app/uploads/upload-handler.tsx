
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PdfUploader from '@/components/pdf-uploader';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { processDocument } from '@/app/actions/documents';
import { getActiveWorkspace } from '@/app/actions/workspace';
import type { Tables } from '@/lib/supabase/database.types';

export function UploadHandler() {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [workspace, setWorkspace] = useState<Tables<'workspaces'> | null>(null);
    const { toast } = useToast();
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchWorkspace = async () => {
            try {
                const ws = await getActiveWorkspace();
                setWorkspace(ws);
            } catch (e) {
                console.error("Failed to fetch workspace settings for uploader.");
            }
        };
        fetchWorkspace();
    }, []);

    const handlePdfUpload = async (file: File) => {
        setIsUploading(true);
        setError(null);
        
        // Client-side validation for file type
        if (workspace?.allowed_file_types && !workspace.allowed_file_types.includes(file.type)) {
            const errMessage = `File type not allowed. Please upload one of: ${workspace.allowed_file_types.join(', ')}`;
            setError(errMessage);
            toast({ variant: "destructive", title: "Upload Failed", description: errMessage });
            setIsUploading(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const filePath = `${user.id}/${Date.now()}-${file.name}`;
            
            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) throw new Error(`Storage error: ${uploadError.message}`);

            await processDocument(file.name, filePath);
            
            toast({ title: "Success", description: "Document uploaded and processed." });
            router.refresh(); // Re-fetch server data
        } catch (err: any) {
            console.error("Upload failed:", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            toast({ variant: "destructive", title: "Upload Failed", description: errorMessage });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <PdfUploader 
            onPdfUpload={handlePdfUpload}
            isUploading={isUploading}
            error={error}
            workspace={workspace}
        />
    );
}
