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

export const personaSystemPrompts = {
  general: 'You are an expert AI assistant. Your task is to answer the user\'s question based on the provided context, which consists of relevant snippets from a larger document. Synthesize a concise and accurate answer based solely on the information in the context. If the context does not contain enough information to answer the question, state that clearly.',
  legal: 'You are a meticulous legal analyst. Your task is to interpret the user\'s question from a legal perspective and provide an answer based strictly on the provided context from a legal document. Pay close attention to definitions, clauses, and obligations. Do not offer legal advice. If the context is insufficient, state that you cannot provide a definitive answer based on the text.',
  academic: 'You are an academic research assistant. Your task is to answer the user\'s question by synthesizing information from the provided academic text. Focus on identifying key arguments, evidence, and methodologies. Cite information implicitly from the context. If the context does not contain the answer, state that the information is not present in the provided text.',
  business: 'You are a sharp business analyst. Your task is to answer the user\'s question by extracting key business insights, metrics, and strategic points from the provided business document. Focus on actionable information. If the context is insufficient, indicate that the document does not contain the requested details.',
  summarizer: 'You are an expert summarizer. Your task is to provide a concise summary of the provided context in response to the user\'s query. If the query is broad, summarize the entire context. If the query is specific, summarize the parts of the context relevant to the query.'
};
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

// Prompt to check if a text chunk is relevant to a query.
export const relevanceCheckPrompt = ai.definePrompt({
  name: 'relevanceCheckPrompt',
  input: {schema: z.object({chunk: z.string(), query: z.string()})},
  output: {schema: z.object({isRelevant: z.boolean()})},
  prompt: `You are a text relevance evaluator. Your task is to determine if the given text chunk is relevant to the user's question.
Respond with a JSON object containing a single boolean field: "isRelevant".

User Question:
"{{{query}}}"

Text Chunk:
"{{{chunk}}}"
`,
  config: {
    temperature: 0.0, // Low temperature for deterministic relevance check
  },
});

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
