"use client";

import { useState, useRef, type DragEvent } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";

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
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-300
        bg-card/60 backdrop-blur-md border-white/10 shadow-lg
        ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-border/50 hover:border-primary/50 hover:bg-muted/50"
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="application/pdf"
        onChange={handleChange}
      />
      <motion.div
        className="text-center"
        animate={{ scale: isDragActive ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <UploadCloud
          className={`h-10 w-10 mx-auto mb-3 transition-colors ${
            isDragActive ? "text-primary" : "text-muted-foreground"
          }`}
        />
        {isDragActive ? (
          <p className="font-semibold text-primary">Drop to upload!</p>
        ) : (
          <>
            <p className="font-semibold text-foreground">
              Drag & drop or <span className="text-primary font-bold">browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF documents up to 32MB
            </p>
          </>
        )}
      </motion.div>
      {error && (
        <p className="mt-2 text-sm text-center text-destructive">{error}</p>
      )}
    </div>
  );
}
