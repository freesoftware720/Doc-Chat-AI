
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const defaultContent = {
    headline: "Frequently Asked Questions",
    subheadline: "Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.",
    items: [
        {
            question: "How does Doc-Chat AI work?",
            answer: "Doc-Chat AI uses advanced large language models to analyze the content of your PDF documents. Once you upload a file, our AI reads and understands the text, allowing you to ask questions and receive intelligent, context-aware answers in a conversational format.",
        },
        {
            question: "Is my data secure?",
            answer: "Yes, security is our top priority. All documents are encrypted in transit and at rest. We do not use your data for training our models. You have full control over your documents and can delete them from our servers at any time.",
        },
        {
            question: "What kind of documents can I upload?",
            answer: "Currently, we support PDF documents. We are working on expanding our capabilities to include other formats like DOCX, TXT, and more in the near future. The maximum file size depends on your subscription plan.",
        },
        {
            question: "Can I cancel my subscription anytime?",
            answer: "Absolutely. You can manage your subscription from your account settings. If you cancel, you will retain access to your plan's features until the end of the current billing cycle. There are no cancellation fees.",
        },
    ]
};

type FaqItem = {
    question: string;
    answer: string;
}

export function FaqSection({ content = defaultContent }: { content?: typeof defaultContent }) {
  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">{content.headline}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {content.subheadline}
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {content.items.map((faq: FaqItem, index: number) => (
            <AccordionItem key={index} value={`item-${index}`} className="bg-card/40 border border-white/10 rounded-2xl shadow-lg backdrop-blur-md mb-4 px-6">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
