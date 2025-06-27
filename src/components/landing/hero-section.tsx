
"use client";

import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { File } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const defaultContent = {
  headline_part_1: "Chat with your",
  headline_animated_texts: ["documents", "reports", "manuals", "textbooks"],
  headline_part_2: "using AI",
  subheadline: "Upload a PDF and get instant answers to your questions with the power of AI.",
  cta_button: "Upload PDF",
  cta_secondary: "No credit card required",
};

const AnimatedText = ({ texts }: { texts: string[] }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!texts || texts.length === 0) return;

    if (isDeleting) {
      if (subIndex === 0) {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % texts.length);
        return;
      }

      const timeout = setTimeout(() => {
        setSubIndex((prev) => prev - 1);
      }, 100);
      return () => clearTimeout(timeout);
    }

    if (subIndex === texts[index].length) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2500);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + 1);
    }, 150);

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting, texts]);

  if (!texts || texts.length === 0) {
    return <span className="text-primary inline-block">documents</span>;
  }
  
  return (
    <span className={cn("text-primary inline-block typing-cursor")}>
      {texts[index].substring(0, subIndex)}
    </span>
  );
};


const UiMockup = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 200, damping: 40 });
  const mouseY = useSpring(y, { stiffness: 200, damping: 40 });

  const rotateX = useTransform(
    mouseY,
    [-200, 200],
    ["-15deg", "15deg"]
  );
  const rotateY = useTransform(
    mouseX,
    [-200, 200],
    ["15deg", "-15deg"]
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className="relative gsap-hero-el"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
        }}
        className="relative"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl -z-10"></div>

        <motion.div
          style={{ transformStyle: "preserve-3d" }}
          className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-primary/10 w-full max-w-md mx-auto"
        >
          <motion.div style={{ transform: "translateZ(20px)" }}>
            <div className="bg-background/80 rounded-lg px-3 py-1.5 text-sm shadow-sm flex items-center">
              <span>example.pdf</span>
            </div>
          </motion.div>
          
          <motion.div style={{ transform: "translateZ(40px)" }} className="mt-3">
            <div className="border-dashed border-2 border-border/50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <File className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Drop PDF here or click to upload</p>
            </div>
          </motion.div>

          <motion.div style={{ transform: "translateZ(30px)" }} className="mt-4 space-y-2 flex flex-col">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl rounded-br-none max-w-[85%] self-end text-sm">
              <p>What are the main findings from the report?</p>
            </div>
            <div className="bg-background/80 p-3 rounded-xl rounded-bl-none max-w-[95%] self-start text-sm text-muted-foreground">
              <p>The main findings from the report are that the company achieved a 20% increase in revenue compared to the previous year, with significant growth in the European and Asian markets.</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export function HeroSection({ content: rawContent }: { content?: any }) {
  // This merge logic is the fix. It handles null or undefined rawContent gracefully.
  const content = { ...defaultContent, ...rawContent };

  const animatedTexts = (content.headline_animated_texts || []).map((item: any) =>
    typeof item === 'object' && item.value ? item.value : item
  ).filter((item: any) => typeof item === 'string');

  return (
    <section className="py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div
          className="text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tighter !leading-tight gsap-hero-el">
            {content.headline_part_1}{' '}
            <AnimatedText texts={animatedTexts} />{' '}
            {content.headline_part_2}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0 gsap-hero-el">
            {content.subheadline}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start gsap-hero-el">
            <Button size="lg" asChild className="text-lg h-14 px-8 w-full sm:w-auto">
              <Link href="/app">{content.cta_button}</Link>
            </Button>
            <p className="text-sm text-muted-foreground">{content.cta_secondary}</p>
          </div>
        </div>
        <UiMockup />
      </div>
    </section>
  );
}
