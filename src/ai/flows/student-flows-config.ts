/**
 * @fileOverview Schemas and types for the Student Plan AI flows.
 * This file does not contain 'use server' and can be imported anywhere.
 */
import { z } from 'zod';

// Common input schema
export const DocumentContentInputSchema = z.object({
  documentContent: z.string().describe('The full text content of the document.'),
});
export type DocumentContentInput = z.infer<typeof DocumentContentInputSchema>;


// --- Study Guide ---

export const StudyGuideOutputSchema = z.object({
  studyGuide: z.string().describe('A comprehensive study guide in Markdown format, including a summary and key points.'),
});
export type StudyGuideOutput = z.infer<typeof StudyGuideOutputSchema>;


// --- Quiz ---

export const QuizQuestionSchema = z.object({
    question: z.string().describe("The quiz question."),
    options: z.array(z.string()).length(4).describe("An array of 4 possible answers."),
    correctAnswer: z.string().describe("The correct answer from the options."),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizInputSchema = DocumentContentInputSchema.extend({
    questionCount: z.number().int().positive().describe("The number of questions to generate.")
});
export type QuizInput = z.infer<typeof QuizInputSchema>;

export const QuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema),
});
export type QuizOutput = z.infer<typeof QuizOutputSchema>;


// --- Flashcards ---

export const FlashcardSchema = z.object({
    term: z.string().describe("The key term or concept."),
    definition: z.string().describe("A concise definition of the term."),
});
export type Flashcard = z.infer<typeof FlashcardSchema>;

export const FlashcardsInputSchema = DocumentContentInputSchema.extend({
    cardCount: z.number().int().positive().describe("The number of flashcards to generate.")
});
export type FlashcardsInput = z.infer<typeof FlashcardsInputSchema>;

export const FlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema),
});
export type FlashcardsOutput = z.infer<typeof FlashcardsOutputSchema>;


// --- Dictation ---

export const DictationOutputSchema = z.object({
    media: z.string().describe("A data URI of the generated audio."),
    text: z.string().describe("The text that was converted to speech.")
});
export type DictationOutput = z.infer<typeof DictationOutputSchema>;
