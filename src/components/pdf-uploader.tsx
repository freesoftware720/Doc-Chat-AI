"use client";

import { useState, useRef, type DragEvent } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText } from "lucide-react";
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
        setError("Only PDF files are accepted.");
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
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl bg-card/50 backdrop-blur-xl border-border/30">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline">Upload your PDF</CardTitle>
            <CardDescription>Drag and drop your document here to start chatting with it.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
                ${isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}
            >
              <input ref={inputRef} type="file" className="hidden" accept="application/pdf" onChange={handleChange} />
              <div className="text-center">
                <UploadCloud className={`h-12 w-12 mx-auto mb-4 transition-colors ${isDragActive ? "text-primary": "text-muted-foreground"}`} />
                {isDragActive ? (
                  <p className="font-semibold text-primary">Drop the file here...</p>
                ) : (
                  <>
                    <p className="font-semibold text-foreground">Drag & drop or <span className="text-primary font-bold">browse</span></p>
                    <p className="text-sm text-muted-foreground mt-1">Supports: PDF</p>
                  </>
                )}
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-center text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
