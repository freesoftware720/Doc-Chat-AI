"use client";

import { useState, useRef, type DragEvent } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PdfUploaderProps {
  onPdfUpload: (file: File) => void;
}

export default function PdfUploader({ onPdfUpload }: PdfUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null | undefined) => {
    if (file) {
      if (file.type === "application/pdf") {
        setError(null);
        onPdfUpload(file);
      } else {
        setError("Please upload a PDF file.");
      }
    }
  };
  
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="container mx-auto py-12 md:py-24 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl"
      >
        <Card className="rounded-2xl shadow-2xl shadow-primary/10 bg-gradient-to-br from-card/60 to-card/20 border-white/20 transition-all duration-300 hover:shadow-primary/20 hover:scale-[1.02]">
          <CardHeader className="text-center p-8">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline tracking-tight">Chat with any Document</CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">Upload a PDF to start a conversation with our intelligent AI assistant.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300
                ${isDragActive ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/50 hover:bg-muted/50"}`}
            >
              <input ref={inputRef} type="file" className="hidden" accept="application/pdf" onChange={handleChange} />
              <motion.div 
                className="text-center"
                animate={{ scale: isDragActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20}}
              >
                <UploadCloud className={`h-12 w-12 mx-auto mb-4 transition-colors ${isDragActive ? "text-primary": "text-muted-foreground"}`} />
                {isDragActive ? (
                  <p className="font-semibold text-lg text-primary">Drop it like it's hot!</p>
                ) : (
                  <>
                    <p className="font-semibold text-foreground">Drag & drop or <span className="text-primary font-bold">browse files</span></p>
                    <p className="text-sm text-muted-foreground mt-1">Supports: PDF only</p>
                  </>
                )}
              </motion.div>
            </div>
            {error && <p className="mt-4 text-sm text-center text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
