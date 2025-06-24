"use client";

import { useState } from "react";
import PdfUploader from "@/components/pdf-uploader";
import ChatInterface from "@/components/chat-interface";
import type { Message } from "@/components/chat-interface";
import { analyzePdf } from "@/ai/flows/pdf-analyzer";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";


export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePdfUpload = (file: File) => {
    setPdfFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPdfDataUri(e.target?.result as string);
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `I've analyzed the document "${file.name}". What would you like to know?`,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

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
        title: "Error",
        description: "Sorry, I encountered an error while analyzing the PDF. Please try again.",
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please refresh and try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPdfFile(null);
    setPdfDataUri(null);
    setMessages([]);
  };

  return (
    <>
      <main className="flex-1">
        {pdfFile ? (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            pdfName={pdfFile.name}
            onReset={handleReset}
          />
        ) : (
          <PdfUploader onPdfUpload={handlePdfUpload} />
        )}
      </main>
      <Toaster />
    </>
  );
}
