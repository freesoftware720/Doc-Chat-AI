
"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';
import type { Tables } from '@/lib/supabase/database.types';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import FileUploader from './file-uploader';
import { createClient } from '@/lib/supabase/client';
import { processDocument } from '@/app/actions/documents';
import { useToast } from '@/hooks/use-toast';
import { useAdModal } from '@/hooks/use-ad-modal';

type Document = Tables<'documents'>;

interface RecentUploadsProps {
  documents: Document[];
  getStartedAction: () => Promise<void>;
  uploadLimitMb: number;
}

export function RecentUploads({ documents, getStartedAction, uploadLimitMb }: RecentUploadsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAd } = useAdModal();

  const handleChatClick = (docId: string) => {
    showAd(() => {
        router.push(`/app/chat/${docId}`);
    });
  };

  const handleFileUpload = async (file: File) => {
    if (documents.some(d => d.name === file.name)) {
      toast({ variant: "destructive", title: "Duplicate File", description: "A document with this name already exists." });
      return;
    }
    
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

      const newDocument = await processDocument(file.name, filePath);
      
      toast({ title: "Upload Successful", description: `"${file.name}" has been processed.` });
      
      showAd(() => {
        router.push(`/app/chat/${newDocument.id}`);
      });

    } catch (error: any) {
      console.error("Upload failed:", error);
      const errorMessage = error.message || "Upload failed. Please try again.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Upload Failed", description: errorMessage });
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
      <div className="lg:col-span-1 space-y-6 flex flex-col">
        <FileUploader onFileUpload={handleFileUpload} isUploading={isUploading} error={error} uploadLimitMb={uploadLimitMb} />
      </div>
      <div className="lg:col-span-2 h-full min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key="recent-uploads"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Card className="h-full bg-card/60 backdrop-blur-md border-white/10 shadow-lg flex flex-col">
              <CardHeader>
                <CardTitle>Welcome to Doc-Chat AI</CardTitle>
                <CardDescription>Upload a document or start a conversation with an existing one.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden flex flex-col justify-center">
                {documents.length > 0 ? (
                  <div className="space-y-4">
                     <p className="text-sm font-medium text-muted-foreground mb-2">Or jump back into a recent document:</p>
                    <ul className="space-y-2">
                      {documents.slice(0, 3).map(doc => (
                        <li key={doc.id}>
                          <button onClick={() => handleChatClick(doc.id)} className="w-full">
                            <div className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/50">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                                    <span className="truncate font-medium">{doc.name}</span>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="text-center pt-4">
                        <form action={getStartedAction}>
                            <Button variant="outline">
                                Go to Last Chat <ArrowRight className="ml-2 h-4 w-4"/>
                            </Button>
                        </form>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <FileText size={48} className="text-muted-foreground mb-4 mx-auto" />
                    <h3 className="text-xl font-semibold mb-2">Get Started</h3>
                    <p className="text-muted-foreground">Upload your first document to begin chatting.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
