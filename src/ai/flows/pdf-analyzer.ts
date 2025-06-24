// src/ai/flows/pdf-analyzer.ts
'use server';
/**
 * @fileOverview A PDF analysis AI agent.
 *
 * - analyzePdf - A function that handles the PDF analysis process.
 * - AnalyzePdfInput - The input type for the analyzePdf function.
 * - AnalyzePdfOutput - The return type for the analyzePdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The PDF document content, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  query: z.string().describe('The question about the PDF content.'),
});
export type AnalyzePdfInput = z.infer<typeof AnalyzePdfInputSchema>;

const AnalyzePdfOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the PDF content.'),
});
export type AnalyzePdfOutput = z.infer<typeof AnalyzePdfOutputSchema>;

export async function analyzePdf(input: AnalyzePdfInput): Promise<AnalyzePdfOutput> {
  return analyzePdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePdfPrompt',
  input: {schema: AnalyzePdfInputSchema},
  output: {schema: AnalyzePdfOutputSchema},
  prompt: `You are an expert AI assistant. Answer this question based on the provided document context.

Document Context: {{media url=pdfDataUri}}

User Question: {{{query}}}

Provide a concise and accurate answer based solely on the document. If the document does not contain information relevant to the question, state that the information is not available in the document.`,
});

const analyzePdfFlow = ai.defineFlow(
  {
    name: 'analyzePdfFlow',
    inputSchema: AnalyzePdfInputSchema,
    outputSchema: AnalyzePdfOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
