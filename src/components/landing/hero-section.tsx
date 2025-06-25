
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const defaultContent = {
  headline: "Unlock Instant Insights From Your Documents",
  subheadline: "DocuChat AI lets you chat with your PDFs, get instant answers, and summarize complex information with the power of AI.",
  image_url: "https://placehold.co/600x400.png",
  image_hint: "dashboard chat",
};

export function HeroSection({ content = defaultContent }: { content?: typeof defaultContent }) {
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
            {content.headline}
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
