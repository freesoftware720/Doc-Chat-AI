'use server';
/**
 * @fileOverview A file analysis AI agent that chunks documents to handle large files.
 *
 * - analyzeFile - A function that handles the file analysis process.
 * - AnalyzeFileInput - The input type for the analyzeFile function.
 * - AnalyzeFileOutput - The return type for the analyzeFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  defaultSystemPrompt,
  relevanceCheckPrompt,
} from './file-analyzer-config';

const AnalyzeFileInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The full text content of the document.'),
  query: z.string().describe('The question about the document content.'),
});
export type AnalyzeFileInput = z.infer<typeof AnalyzeFileInputSchema>;

const AnalyzeFileOutputSchema = z.object({
  answer: z
    .string()
    .describe('The answer to the question about the document content.'),
});
export type AnalyzeFileOutput = z.infer<typeof AnalyzeFileOutputSchema>;

export async function analyzeFile(
  input: AnalyzeFileInput
): Promise<AnalyzeFileOutput> {
  return analyzeFileFlow(input);
}

// The main flow for analyzing the file
const analyzeFileFlow = ai.defineFlow(
  {
    name: 'analyzeFileFlow',
    inputSchema: AnalyzeFileInputSchema,
    outputSchema: AnalyzeFileOutputSchema,
  },
  async ({documentContent, query}) => {
    // 1. Chunk the document content. This is a simple strategy.
    const CHUNK_SIZE = 2000; // characters
    const CHUNK_OVERLAP = 200;
    const chunks: string[] = [];
    for (
      let i = 0;
      i < documentContent.length;
      i += CHUNK_SIZE - CHUNK_OVERLAP
    ) {
      chunks.push(documentContent.substring(i, i + CHUNK_SIZE));
    }

    // 2. Find relevant chunks in parallel by calling the relevance check prompt.
    const relevanceChecks = await Promise.all(
      chunks.map(async chunk => {
        const {output} = await relevanceCheckPrompt({chunk, query});
        return {chunk, isRelevant: output?.isRelevant ?? false};
      })
    );

    const relevantChunks = relevanceChecks
      .filter(check => check.isRelevant)
      .map(check => check.chunk);

    if (relevantChunks.length === 0) {
      return {
        answer:
          'I could not find any relevant information in the document to answer your question.',
      };
    }

    const context = relevantChunks.join('\n---\n');
    const systemPrompt = defaultSystemPrompt;

    // 3. Generate a final answer based on the concatenated relevant chunks and persona.
    const {output} = await ai.generate({
        model: ai.model,
        system: systemPrompt,
        prompt: `Context:\n---\n${context}\n---\n\nUser Question: ${query}\n\nAnswer:`,
        output: {
            schema: AnalyzeFileOutputSchema,
        },
        config: {
            temperature: 0.2,
        }
    });

    return (
      output ?? {
        answer: 'The AI failed to generate a response based on the context.',
      }
    );
  }
);
