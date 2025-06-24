
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PdfUploader from '@/components/pdf-uploader';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { processDocument } from '@/app/actions/documents';

export function UploadHandler() {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const supabase = createClient();
    const router = useRouter();

    const handlePdfUpload = async (file: File) => {
        setIsUploading(true);
        setError(null);

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
        />
    );
}
