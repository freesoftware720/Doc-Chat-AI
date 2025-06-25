
"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const defaultContent = {
  headline_static_1: "Unlock Instant Insights From Your",
  headline_animated: [
    "Documents.",
    "PDFs.",
    "Reports.",
    "Manuals.",
  ],
  subheadline: "Doc-Chat AI lets you chat with your PDFs, get instant answers, and summarize complex information with the power of AI.",
  image_url: "https://placehold.co/600x400.png",
  image_hint: "dashboard chat",
};

export function HeroSection({ content = defaultContent }: { content?: typeof defaultContent }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % (content.headline_animated || []).length);
    }, 2500); // Change text every 2.5 seconds
    return () => clearInterval(interval);
  }, [content.headline_animated]);
  
  if (!content || !content.headline_animated || content.headline_animated.length === 0) {
    // Fallback for when content is not loaded or structured incorrectly
    content = defaultContent;
  }

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tighter !leading-tight">
            {content.headline_static_1}{' '}
            <span className="relative inline-block h-[1.2em] overflow-hidden align-bottom">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={index}
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "-100%" }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="inline-block text-primary"
                    >
                        {content.headline_animated[index]}
                    </motion.span>
                </AnimatePresence>
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
            {content.subheadline}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button size="lg" asChild className="text-lg h-14 px-8">
              <Link href="/app">Get Started for Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-14 px-8">
              View Demo
            </Button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <Image
            src={content.image_url}
            alt="App Dashboard and AI Chat Interface"
            width={600}
            height={400}
            data-ai-hint={content.image_hint}
            className="rounded-2xl shadow-2xl shadow-primary/20"
          />
        </motion.div>
      </div>
    </section>
  );
}
