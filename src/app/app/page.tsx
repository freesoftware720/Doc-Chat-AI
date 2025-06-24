"use client";

import { useState, useEffect } from "react";
import { createClient } from '@/lib/supabase/client';
import PdfUploader from "@/components/pdf-uploader";
import ChatInterface from "@/components/chat-interface";
import type { Message } from "@/components/chat-interface";
import { analyzePdf } from "@/ai/flows/pdf-analyzer";
import { processDocument, getDocuments, deleteDocument } from '@/app/actions/documents';
import { useToast } from "@/hooks/use-toast";
import { DashboardStats } from "@/components/dashboard-stats";
import { PdfList } from "@/components/pdf-list";
import { AnimatePresence, motion } from "framer-motion";
import { FileText } from "lucide-react";

// Simplified type for the document, matching the database schema
export type Document = {
  id: string;
  user_id: string;
  name: string;
  storage_path: string;
  content: string | null;
  created_at: string;
};

export default function AppPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const fetchDocuments = async () => {
      const docs = await getDocuments();
      setDocuments(docs);
    };
    fetchDocuments();
  }, []);

  const resetChatState = () => {
    setMessages([]);
  }

  const selectDocument = (doc: Document) => {
    if (selectedDocument?.id === doc.id) return;

    setSelectedDocument(doc);
    resetChatState();
    if (doc.content) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `I've finished analyzing "${doc.name}". What would you like to ask?`,
        },
      ]);
    } else {
       setMessages([
        {
          id: "1",
          role: "assistant",
          content: `There was an issue reading "${doc.name}". Please try uploading it again.`,
        },
      ]);
    }
  }

  const handlePdfUpload = async (file: File) => {
    if (documents.some(d => d.name === file.name)) {
      toast({ variant: "destructive", title: "Duplicate File", description: "A document with this name already exists." });
      return;
    }
    
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

      const newDocument = await processDocument(file.name, filePath);
      
      setDocuments(prev => [newDocument, ...prev]);
      selectDocument(newDocument);

    } catch (error: any) {
      console.error("Upload failed:", error);
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      setDocuments(prev => prev.filter(d => d.id !== documentId));
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
        resetChatState();
      }
      toast({ title: "Success", description: "Document deleted." });
    } catch (error: any) {
      console.error("Failed to delete document:", error);
      toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedDocument?.content) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await analyzePdf({ documentContent: selectedDocument.content, query: content });
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error analyzing PDF:", error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "An error occurred while analyzing the document. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeselect = () => {
    setSelectedDocument(null);
    resetChatState();
  };

  // Dummy error state for the uploader
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="p-4 md:p-6 space-y-6 h-full flex flex-col">
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          <PdfUploader onPdfUpload={handlePdfUpload} isUploading={isUploading} error={error} />
          <div className="flex-1 min-h-0">
             <PdfList
                files={documents}
                selectedFile={selectedDocument}
                onSelectFile={selectDocument}
                onDeleteFile={handleDeleteDocument}
              />
          </div>
        </div>
        <div className="lg:col-span-2 h-full min-h-0">
          <AnimatePresence mode="wait">
            {selectedDocument ? (
              <motion.div
                key={selectedDocument.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  documentName={selectedDocument.name}
                  onReset={handleDeselect}
                />
              </motion.div>
            ) : (
               <motion.div
                key="no-pdf-selected"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col items-center justify-center bg-card/60 backdrop-blur-md border-white/10 shadow-lg rounded-2xl p-8 text-center"
              >
                <FileText size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Document Selected</h3>
                <p className="text-muted-foreground">Upload or select a document to begin chatting.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
