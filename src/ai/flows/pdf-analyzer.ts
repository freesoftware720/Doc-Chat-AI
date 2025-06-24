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
  prompt: `You are an expert AI assistant specializing in PDF document analysis. Your task is to answer questions about the content of a PDF document based on the user's query.

  Use the following PDF document content as the primary source of information to answer the question.

  PDF Content: {{media url=pdfDataUri}}

  User Query: {{{query}}}

  Please provide a concise and accurate answer to the user's question based solely on the provided PDF content. If the PDF does not contain information relevant to the query, please respond with "I am sorry, but this document does not contain information relevant to your query."`,
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
