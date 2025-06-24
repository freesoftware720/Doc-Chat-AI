"use client";

import { useState } from "react";
import PdfUploader from "@/components/pdf-uploader";
import ChatInterface from "@/components/chat-interface";
import type { Message } from "@/components/chat-interface";
import { analyzePdf } from "@/ai/flows/pdf-analyzer";
import { useToast } from "@/hooks/use-toast";
import { DashboardStats } from "@/components/dashboard-stats";
import { PdfList } from "@/components/pdf-list";
import { AnimatePresence, motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function AppPage() {
  const [uploadedPdfs, setUploadedPdfs] = useState<File[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const resetChatState = () => {
    setMessages([]);
    setPdfDataUri(null);
  }

  const selectPdf = (file: File) => {
    if (selectedPdf?.name === file.name) return;

    setSelectedPdf(file);
    resetChatState();
    const reader = new FileReader();
    reader.onload = (e) => {
      setPdfDataUri(e.target?.result as string);
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `I've finished analyzing "${file.name}". What would you like to ask?`,
        },
      ]);
    };
    reader.readAsDataURL(file);
  }

  const handlePdfUpload = (file: File) => {
    // Prevent duplicates
    if (!uploadedPdfs.some(f => f.name === file.name)) {
      setUploadedPdfs(prev => [...prev, file]);
    }
    selectPdf(file);
  };

  const handleDeletePdf = (fileName: string) => {
    setUploadedPdfs(prev => prev.filter(f => f.name !== fileName));
    if (selectedPdf?.name === fileName) {
      setSelectedPdf(null);
      resetChatState();
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!pdfDataUri) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await analyzePdf({ pdfDataUri, query: content });
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
        description: "An error occurred while analyzing the PDF. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeselect = () => {
    setSelectedPdf(null);
    resetChatState();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 h-full flex flex-col">
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          <PdfUploader onPdfUpload={handlePdfUpload} />
          <div className="flex-1 min-h-0">
             <PdfList
                files={uploadedPdfs}
                selectedFile={selectedPdf}
                onSelectFile={selectPdf}
                onDeleteFile={handleDeletePdf}
              />
          </div>
        </div>
        <div className="lg:col-span-2 h-full min-h-0">
          <AnimatePresence mode="wait">
            {selectedPdf ? (
              <motion.div
                key={selectedPdf.name}
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
                  pdfName={selectedPdf.name}
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
