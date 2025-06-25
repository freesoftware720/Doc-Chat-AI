
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { File } from "lucide-react";

const defaultContent = {
  headline: "Chat with your\ndocuments\nusing AI",
  subheadline: "Upload a PDF and get instant answers to your questions with the power of AI.",
  cta_button: "Upload PDF",
  cta_secondary: "No credit card required",
};

const UiMockup = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 50 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
    className="relative"
  >
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10"></div>
    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl -z-10"></div>

    <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-primary/10 w-full max-w-md mx-auto">
      <div className="bg-background/80 rounded-lg px-3 py-1.5 text-sm shadow-sm flex items-center">
        <span>example.pdf</span>
      </div>
      
      <div className="border-dashed border-2 border-border/50 rounded-xl mt-3 p-6 flex flex-col items-center justify-center text-center">
        <File className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-2">Drop PDF here or click to upload</p>
      </div>

      <div className="mt-4 space-y-2 flex flex-col">
        <div className="bg-primary text-primary-foreground p-3 rounded-xl rounded-br-none max-w-[85%] self-end text-sm">
          <p>What are the main findings from the report?</p>
        </div>
        <div className="bg-background/80 p-3 rounded-xl rounded-bl-none max-w-[95%] self-start text-sm text-muted-foreground">
          <p>The main findings from the report are that the company achieved a 20% increase in revenue compared to the previous year, with significant growth in the European and Asian markets.</p>
        </div>
      </div>
    </div>
  </motion.div>
);

export function HeroSection({ content: rawContent }: { content?: any }) {
  const content = { ...defaultContent, ...rawContent };
  
  const heroContent = {
    ...defaultContent,
    ...rawContent,
    headline: rawContent?.headline || defaultContent.headline,
  };


  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tighter !leading-tight whitespace-pre-wrap">
            {heroContent.headline}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
            {heroContent.subheadline}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Button size="lg" asChild className="text-lg h-14 px-8 w-full sm:w-auto">
              <Link href="/app">{heroContent.cta_button}</Link>
            </Button>
            <p className="text-sm text-muted-foreground">{heroContent.cta_secondary}</p>
          </div>
        </motion.div>
        <UiMockup />
      </div>
    </section>
  );
}
