
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PdfUploader from '@/components/pdf-uploader';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { processDocument } from '@/app/actions/documents';

export function UploadHandler({ uploadLimitMb }: { uploadLimitMb: number }) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const supabase = createClient();
    const router = useRouter();

    const handlePdfUpload = async (file: File) => {
        setIsUploading(true);
        setError(null);
        
        const fileSizeMb = file.size / (1024 * 1024);
        if (fileSizeMb > uploadLimitMb) {
            const errMessage = `File size of ${fileSizeMb.toFixed(2)}MB exceeds your ${uploadLimitMb}MB limit.`;
            setError(errMessage);
            toast({ variant: "destructive", title: "Upload Failed", description: errMessage });
            setIsUploading(false);
            return;
        }

        // Client-side validation for file type
        if (file.type !== 'application/pdf') {
            const errMessage = 'File type not allowed. Please upload a PDF.';
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
                .upload(filePath, file, {
                    duplex: 'half'
                });

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
            uploadLimitMb={uploadLimitMb}
        />
    );
}
