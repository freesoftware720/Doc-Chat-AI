
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tables } from "@/lib/supabase/database.types";
import { ChatTab } from "./chat-tab";
import { StudyGuideTab } from "./study-guide-tab";
import { QuizTab } from "./quiz-tab";
import { FlashcardsTab } from "./flashcards-tab";
import { DictationTab } from "./dictation-tab";
import { BookOpen, MessageSquare, BrainCircuit, FileQuestion, Layers, Headphones } from "lucide-react";

type Document = Tables<'documents'>;

export function StudentHubClient({ document }: { document: Document }) {

    const tabs = [
        { value: "chat", label: "Chat", icon: MessageSquare, component: <ChatTab documentId={document.id} documentName={document.name} /> },
        { value: "study-guide", label: "Study Guide", icon: BookOpen, component: <StudyGuideTab documentContent={document.content || ''} /> },
        { value: "quiz", label: "Quiz", icon: FileQuestion, component: <QuizTab documentContent={document.content || ''} /> },
        { value: "flashcards", label: "Flashcards", icon: Layers, component: <FlashcardsTab documentContent={document.content || ''} /> },
        { value: "dictation", label: "Dictation", icon: Headphones, component: <DictationTab documentContent={document.content || ''} /> },
    ];

    return (
        <div className="p-4 md:p-6 h-full flex flex-col">
            <header className="mb-6">
                <div className="flex items-center gap-3">
                    <BrainCircuit className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold font-headline truncate" title={document.name}>{document.name}</h1>
                        <p className="text-muted-foreground mt-1">Student Study Hub</p>
                    </div>
                </div>
            </header>
            
            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                 <div className="w-full overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <TabsList className="inline-flex h-auto">
                        {tabs.map(tab => (
                            <TabsTrigger key={tab.value} value={tab.value} className="gap-2 text-base px-6 py-3">
                                <tab.icon className="h-5 w-5"/>
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                
                <div className="flex-1 mt-4 overflow-y-auto">
                    {tabs.map(tab => (
                        <TabsContent key={tab.value} value={tab.value} className="h-full">
                           {tab.component}
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
}
