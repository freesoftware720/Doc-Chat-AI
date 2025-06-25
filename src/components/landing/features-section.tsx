
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Sparkles, ShieldCheck } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion } from "framer-motion";

const iconMap: { [key: string]: React.ElementType } = {
  UploadCloud,
  Sparkles,
  ShieldCheck,
};

const defaultContent = {
    headline: "A Smarter Way to Work With Documents",
    subheadline: "DocuChat AI transforms your static documents into dynamic conversational partners.",
    items: [
        { icon: "UploadCloud", title: "Seamless PDF Upload", description: "Drag and drop any PDF to get started. Your documents are processed quickly and securely." },
        { icon: "Sparkles", title: "Intelligent AI-Powered Q&A", description: "Ask complex questions and receive accurate, context-aware answers in seconds." },
        { icon: "ShieldCheck", title: "Secure & Private by Design", description: "Your data is encrypted and confidential. Chat with your documents with complete peace of mind." },
    ]
};

type Feature = {
  icon: string;
  title: string;
  description: string;
}

export function FeaturesSection({ content = defaultContent }: { content?: typeof defaultContent }) {
  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">{content.headline}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {content.subheadline}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.items.map((feature: Feature, index: number) => {
            const IconComponent = iconMap[feature.icon] || Sparkles;
            return (
                <motion.div
                key={index}
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.3 }}
                variants={cardVariants}
                transition={{ delay: index * 0.1 }}
                >
                <Card className="h-full rounded-2xl shadow-2xl shadow-primary/10 bg-gradient-to-br from-card/60 to-card/20 border-white/20 transition-all duration-300 hover:shadow-primary/20 hover:scale-[1.03] hover:-translate-y-1">
                    <CardHeader className="flex flex-col items-center text-center p-8">
                    <div className="p-4 bg-primary/10 rounded-full w-fit mb-4">
                        <IconComponent className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-headline tracking-tight">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground px-8 pb-8">
                    {feature.description}
                    </CardContent>
                </Card>
                </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
