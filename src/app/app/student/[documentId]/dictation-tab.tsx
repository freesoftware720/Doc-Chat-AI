
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Headphones, Wand2 } from 'lucide-react';
import { generateDictation } from '@/ai/flows/student-flows';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WaveformPlayer } from './waveform-player';

export function DictationTab({ documentContent }: { documentContent: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
    const [dictationText, setDictationText] = useState<string>("");
    const { toast } = useToast();

    const handleGenerate = async () => {
        setIsLoading(true);
        setAudioDataUri(null);
        setDictationText("");
        try {
            const { media, text } = await generateDictation({ documentContent });
            setAudioDataUri(media);
            setDictationText(text);
        } catch (error) {
            console.error("Failed to generate dictation:", error);
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'Could not generate the dictation. Please try again.'
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
                        <Headphones /> AI Dictation Generator
                    </CardTitle>
                    <CardDescription>
                        Listen to a summary of your document to improve listening comprehension.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                    {isLoading ? (
                        <>
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Generating audio... This might take up to a minute.</p>
                        </>
                    ) : audioDataUri ? (
                        <div className="w-full space-y-4">
                            <WaveformPlayer audioUrl={audioDataUri} />
                             <div className="w-full h-80 overflow-y-auto text-left border rounded-lg p-6 bg-background/50">
                                 <article className="prose dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {dictationText}
                                    </ReactMarkdown>
                                </article>
                            </div>
                            <Button onClick={handleGenerate} variant="outline" size="lg">
                                <Wand2 className="mr-2 h-5 w-5" />
                                Regenerate Dictation
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={handleGenerate} size="lg">
                            <Wand2 className="mr-2 h-5 w-5" />
                            Generate Dictation
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
