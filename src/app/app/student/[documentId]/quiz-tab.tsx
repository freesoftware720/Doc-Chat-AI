
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileQuestion, Wand2, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { generateQuiz, type QuizQuestion } from '@/ai/flows/student-flows';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function QuizTab({ documentContent }: { documentContent: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const { toast } = useToast();

    const handleGenerateQuiz = async () => {
        setIsLoading(true);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setScore(0);
        try {
            const result = await generateQuiz({ documentContent, questionCount: 10 });
            setQuestions(result.questions);
        } catch (error) {
            console.error("Failed to generate quiz:", error);
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'Could not generate the quiz. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnswerSubmit = () => {
        if (!selectedAnswer) return;
        setIsAnswered(true);
        if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        setIsAnswered(false);
        setSelectedAnswer(null);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const isQuizFinished = questions.length > 0 && currentQuestionIndex >= questions.length;
    const currentQuestion = questions[currentQuestionIndex];

    const getButtonClass = (option: string) => {
        if (!isAnswered) {
            return selectedAnswer === option ? 'bg-primary/20 border-primary' : 'bg-muted/50';
        }
        if (option === currentQuestion.correctAnswer) {
            return 'bg-green-500/20 border-green-500 text-green-500 hover:bg-green-500/30';
        }
        if (option === selectedAnswer) {
            return 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30';
        }
        return 'bg-muted/50 opacity-70';
    };

    return (
        <div className="max-w-4xl mx-auto h-full">
            <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileQuestion /> AI Quiz Generator
                    </CardTitle>
                    <CardDescription>
                        Test your knowledge with a quiz generated from the document content.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
                    {questions.length === 0 ? (
                        <div className="text-center">
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                                    <p className="mt-4 text-muted-foreground">Generating your quiz...</p>
                                </>
                            ) : (
                                <Button onClick={handleGenerateQuiz} size="lg">
                                    <Wand2 className="mr-2 h-5 w-5" />
                                    Generate 10-Question Quiz
                                </Button>
                            )}
                        </div>
                    ) : isQuizFinished ? (
                        <div className="text-center space-y-4">
                            <h2 className="text-2xl font-bold">Quiz Complete!</h2>
                            <p className="text-4xl font-bold text-primary">
                                {score} / {questions.length}
                            </p>
                            <p className="text-muted-foreground">You answered {((score / questions.length) * 100).toFixed(0)}% of the questions correctly.</p>
                            <Button onClick={handleGenerateQuiz} size="lg">
                                <Wand2 className="mr-2 h-5 w-5" />
                                Take Another Quiz
                            </Button>
                        </div>
                    ) : (
                        <div className="w-full space-y-6">
                            <div>
                                <p className="text-muted-foreground text-sm">Question {currentQuestionIndex + 1} of {questions.length}</p>
                                <h3 className="text-xl font-semibold mt-1">{currentQuestion.question}</h3>
                            </div>
                            <div className="space-y-3">
                                {currentQuestion.options.map((option) => (
                                    <Button
                                        key={option}
                                        variant="outline"
                                        className={cn("w-full h-auto text-left justify-start py-3 text-base whitespace-normal", getButtonClass(option))}
                                        onClick={() => !isAnswered && setSelectedAnswer(option)}
                                    >
                                        {isAnswered && (
                                            option === currentQuestion.correctAnswer ? <CheckCircle className="mr-3 h-5 w-5 text-green-500"/> :
                                            (option === selectedAnswer ? <XCircle className="mr-3 h-5 w-5 text-red-500"/> : <div className="w-8"/>)
                                        )}
                                        {option}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex justify-end">
                                {isAnswered ? (
                                    <Button onClick={handleNextQuestion}>
                                        Next Question <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer}>
                                        Submit Answer
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
