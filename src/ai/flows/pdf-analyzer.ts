'use server';
/**
 * @fileOverview A PDF analysis AI agent that chunks documents to handle large files.
 *
 * - analyzePdf - A function that handles the PDF analysis process.
 * - AnalyzePdfInput - The input type for the analyzePdf function.
 * - AnalyzePdfOutput - The return type for the analyzePdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  personaSystemPrompts,
  relevanceCheckPrompt,
} from './pdf-analyzer-config';

// The personaSystemPrompts object is now imported, so we can derive the Persona type from it.
export type Persona = keyof typeof personaSystemPrompts;

const AnalyzePdfInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The full text content of the document.'),
  query: z.string().describe('The question about the document content.'),
  persona: z.nativeEnum(Object.keys(personaSystemPrompts) as [Persona, ...Persona[]]).optional().default('general').describe('The persona for the AI assistant.'),
});
export type AnalyzePdfInput = z.infer<typeof AnalyzePdfInputSchema>;

const AnalyzePdfOutputSchema = z.object({
  answer: z
    .string()
    .describe('The answer to the question about the document content.'),
});
export type AnalyzePdfOutput = z.infer<typeof AnalyzePdfOutputSchema>;

export async function analyzePdf(
  input: AnalyzePdfInput
): Promise<AnalyzePdfOutput> {
  return analyzePdfFlow(input);
}

// The main flow for analyzing the PDF
const analyzePdfFlow = ai.defineFlow(
  {
    name: 'analyzePdfFlow',
    inputSchema: AnalyzePdfInputSchema,
    outputSchema: AnalyzePdfOutputSchema,
  },
  async ({documentContent, query, persona}) => {
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
    const systemPrompt = personaSystemPrompts[persona ?? 'general'];

    // 3. Generate a final answer based on the concatenated relevant chunks and persona.
    const {output} = await ai.generate({
        model: ai.model,
        system: systemPrompt,
        prompt: `Context:\n---\n${context}\n---\n\nUser Question: ${query}\n\nAnswer:`,
        output: {
            schema: AnalyzePdfOutputSchema,
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
