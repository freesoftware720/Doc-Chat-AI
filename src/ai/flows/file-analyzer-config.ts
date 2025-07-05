/**
 * @fileOverview Configuration objects for the PDF analyzer.
 * This file does not contain 'use server' and can be imported anywhere.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const defaultSystemPrompt = 'You are a professional AI assistant specializing in document analysis. Your task is to provide a clear, concise, and professional answer to the user\'s question based strictly on the provided context from a document. Structure your response for clarity. If the context does not contain sufficient information to answer the question accurately, you must state: "Based on the provided context, I cannot answer this question." Do not add any information not present in the context.';

// Prompt to check if a text chunk is relevant to a query.
export const relevanceCheckPrompt = ai.definePrompt({
  name: 'relevanceCheckPrompt',
  input: {schema: z.object({chunk: z.string(), query: z.string()})},
  output: {schema: z.object({isRelevant: z.boolean()})},
  prompt: `You are an expert at determining if a snippet of text is relevant to a question.
Your goal is to evaluate if the provided 'Text Chunk' contains information that would help answer the 'User Question'.

If the chunk is relevant, you must respond with: {"isRelevant": true}
If the chunk is NOT relevant, you must respond with: {"isRelevant": false}

Do not provide any other text, explanation, or preamble. Your entire response must be ONLY the JSON object.

User Question:
"{{{query}}}"

---
Text Chunk:
"{{{chunk}}}"
---
`,
  config: {
    temperature: 0.0, // Low temperature for deterministic relevance check
  },
});
