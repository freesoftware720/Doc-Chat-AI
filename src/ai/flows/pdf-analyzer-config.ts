/**
 * @fileOverview Configuration objects for the PDF analyzer.
 * This file does not contain 'use server' and can be imported anywhere.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const defaultSystemPrompt = 'You are an expert AI assistant. Your task is to answer the user\'s question based on the provided context, which consists of relevant snippets from a larger document. Synthesize a concise and accurate answer based solely on the information in the context. If the context does not contain enough information to answer the question, state that clearly.';

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
