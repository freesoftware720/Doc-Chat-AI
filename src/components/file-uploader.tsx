
"use client";

import { useState, useRef, type DragEvent } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Loader } from "lucide-react";

interface UploaderProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  error: string | null;
  uploadLimitMb: number;
}

export default function Uploader({ onFileUpload, isUploading, error, uploadLimitMb }: UploaderProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null | undefined) => {
    if (file) {
      setInternalError(null);
      onFileUpload(file);
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
      onClick={() => !isUploading && inputRef.current?.click()}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-2xl transition-colors duration-300
        bg-card/60 backdrop-blur-md border-white/10 shadow-lg
        ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer'}
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
        onChange={handleChange}
        disabled={isUploading}
      />

      {isUploading ? (
        <div className="text-center">
            <Loader className="h-10 w-10 mx-auto mb-3 animate-spin text-primary" />
            <p className="font-semibold text-foreground">Processing Document</p>
            <p className="text-xs text-muted-foreground mt-1">This may take a moment...</p>
        </div>
      ) : (
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
                Any file type (up to {uploadLimitMb}MB)
                </p>
            </>
            )}
        </motion.div>
      )}

      {(error || internalError) && !isUploading && (
        <p className="mt-2 text-sm text-center text-destructive">{error || internalError}</p>
      )}
    </div>
  );
}
