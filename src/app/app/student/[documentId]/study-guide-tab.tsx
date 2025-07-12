
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BookOpen, Wand2 } from 'lucide-react';
import { generateStudyGuide } from '@/ai/flows/student-flows';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export function StudyGuideTab({ documentContent }: { documentContent: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [studyGuide, setStudyGuide] = useState<string | null>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        setIsLoading(true);
        setStudyGuide(null);
        try {
            const result = await generateStudyGuide({ documentContent });
            setStudyGuide(result.studyGuide);
        } catch (error) {
            console.error("Failed to generate study guide:", error);
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'Could not generate the study guide. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-full">
            <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen /> Study Guide Generator
                    </CardTitle>
                    <CardDescription>
                        Generate a concise summary and key points from your document to kickstart your study session.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center text-center">
                    {!studyGuide && !isLoading && (
                         <div className="text-center">
                            <Button onClick={handleGenerate} size="lg">
                                <Wand2 className="mr-2 h-5 w-5" />
                                Generate Study Guide
                            </Button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="space-y-4 w-full">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Generating your study guide... This may take a moment.</p>
                            </div>
                            <Skeleton className="h-8 w-1/3 mx-auto" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6 mx-auto" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    )}
                    
                    {studyGuide && (
                        <div className="w-full h-full overflow-y-auto text-left border rounded-lg p-6 bg-background/50">
                             <article className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {studyGuide}
                                </ReactMarkdown>
                            </article>
                             <div className="text-center mt-6">
                                <Button onClick={handleGenerate} variant="outline" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                                    Regenerate Guide
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
