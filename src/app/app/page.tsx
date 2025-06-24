"use client";

import { useState } from "react";
import PdfUploader from "@/components/pdf-uploader";
import ChatInterface from "@/components/chat-interface";
import type { Message } from "@/components/chat-interface";
import { analyzePdf } from "@/ai/flows/pdf-analyzer";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";


export default function AppPage() {
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
          content: `I've finished analyzing "${file.name}". What would you like to ask?`,
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
        title: "Analysis Error",
        description: "An error occurred while analyzing the PDF. Please try again.",
      });
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
      <main className="flex-1 relative">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:opacity-20"></div>
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_50%,hsl(var(--primary)/0.1),transparent_30%),radial-gradient(circle_at_85%_30%,hsl(var(--accent)/0.1),transparent_30%)]"></div>
        </div>

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
