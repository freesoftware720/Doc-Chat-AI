
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Layers, Wand2, ArrowLeft, ArrowRight } from 'lucide-react';
import { generateFlashcards, type Flashcard } from '@/ai/flows/student-flows';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

function FlashcardComponent({ card, isFlipped, onClick }: { card: Flashcard, isFlipped: boolean, onClick: () => void }) {
    return (
        <div
            className="w-full max-w-lg h-80 rounded-2xl cursor-pointer"
            onClick={onClick}
            style={{ perspective: '1000px' }}
        >
            <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Front */}
                <div className="absolute w-full h-full flex items-center justify-center p-6 bg-card/60 backdrop-blur-md border border-white/10 rounded-2xl" style={{ backfaceVisibility: 'hidden' }}>
                    <p className="text-2xl font-bold text-center">{card.term}</p>
                </div>
                {/* Back */}
                <div className="absolute w-full h-full flex items-center justify-center p-6 bg-primary/20 backdrop-blur-md border border-primary/20 rounded-2xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <p className="text-lg text-center text-primary-foreground">{card.definition}</p>
                </div>
            </motion.div>
        </div>
    )
}

export function FlashcardsTab({ documentContent }: { documentContent: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        setIsLoading(true);
        setFlashcards([]);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        try {
            const result = await generateFlashcards({ documentContent, cardCount: 20 });
            setFlashcards(result.flashcards);
        } catch (error) {
            console.error("Failed to generate flashcards:", error);
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'Could not generate flashcards. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentCardIndex(prev => (prev + 1) % flashcards.length);
        }, 300); // delay to allow flip back animation
    };

    const handlePrevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentCardIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
        }, 300);
    };

    return (
        <div className="max-w-4xl mx-auto h-full">
            <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layers /> AI Flashcard Generator
                    </CardTitle>
                    <CardDescription>
                        Create flashcards for key terms and concepts from your document.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
                    {flashcards.length === 0 ? (
                         <div className="text-center">
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                                    <p className="mt-4 text-muted-foreground">Generating your flashcards...</p>
                                </>
                            ) : (
                                <Button onClick={handleGenerate} size="lg">
                                    <Wand2 className="mr-2 h-5 w-5" />
                                    Generate 20 Flashcards
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center gap-6">
                            <FlashcardComponent
                                card={flashcards[currentCardIndex]}
                                isFlipped={isFlipped}
                                onClick={() => setIsFlipped(!isFlipped)}
                            />

                            <div className="text-center">
                                <p className="text-muted-foreground">Card {currentCardIndex + 1} of {flashcards.length}</p>
                                <p className="text-sm text-muted-foreground">(Click card to flip)</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="lg" onClick={handlePrevCard}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Prev
                                </Button>
                                <Button variant="outline" size="lg" onClick={handleNextCard}>
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>

                             <Button onClick={handleGenerate} variant="secondary">
                                <Wand2 className="mr-2 h-4 w-4" />
                                Regenerate Flashcards
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
