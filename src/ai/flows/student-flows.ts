
'use server';
/**
 * @fileOverview AI flows for the Student Plan features.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';
import wav from 'wav';

// Common input schema for document-based generation
const DocumentContentInputSchema = z.object({
  documentContent: z.string().describe('The full text content of the document.'),
});

// --- Study Guide ---

const StudyGuideOutputSchema = z.object({
  studyGuide: z.string().describe('A comprehensive study guide in Markdown format, including a summary and key points.'),
});
export type StudyGuideOutput = z.infer<typeof StudyGuideOutputSchema>;

const studyGuidePrompt = ai.definePrompt({
    name: 'studyGuidePrompt',
    input: { schema: DocumentContentInputSchema },
    output: { schema: StudyGuideOutputSchema },
    prompt: `You are an expert academic assistant. Your task is to generate a high-quality study guide from the provided document content.

The study guide should be well-structured and easy to read. Use Markdown for formatting. It must include the following sections:
1.  **Summary:** A concise overview of the document's main ideas.
2.  **Key Points:** A bulleted list of the most important concepts, facts, and conclusions.

Analyze the following document content and generate the study guide.

Document Content:
---
{{{documentContent}}}
---
`,
});

export async function generateStudyGuide(
  input: z.infer<typeof DocumentContentInputSchema>
): Promise<StudyGuideOutput> {
  const { output } = await studyGuidePrompt(input);
  return output!;
}


// --- Quiz ---

export const QuizQuestionSchema = z.object({
    question: z.string().describe("The quiz question."),
    options: z.array(z.string()).length(4).describe("An array of 4 possible answers."),
    correctAnswer: z.string().describe("The correct answer from the options."),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

const QuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema),
});
export type QuizOutput = z.infer<typeof QuizOutputSchema>;

const QuizInputSchema = DocumentContentInputSchema.extend({
    questionCount: z.number().int().positive().describe("The number of questions to generate.")
});

const quizPrompt = ai.definePrompt({
    name: 'quizPrompt',
    input: { schema: QuizInputSchema },
    output: { schema: QuizOutputSchema },
    prompt: `You are an expert quiz creator for students. Based on the provided document content, generate a quiz with exactly {{{questionCount}}} multiple-choice questions.

Each question must:
- Be relevant to the document content.
- Have 4 distinct options.
- Have one single correct answer.

Document Content:
---
{{{documentContent}}}
---
`,
});

export async function generateQuiz(
  input: z.infer<typeof QuizInputSchema>
): Promise<QuizOutput> {
  const { output } = await quizPrompt(input);
  return output!;
}


// --- Flashcards ---

export const FlashcardSchema = z.object({
    term: z.string().describe("The key term or concept."),
    definition: z.string().describe("A concise definition of the term."),
});
export type Flashcard = z.infer<typeof FlashcardSchema>;

const FlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema),
});
export type FlashcardsOutput = z.infer<typeof FlashcardsOutputSchema>;

const FlashcardsInputSchema = DocumentContentInputSchema.extend({
    cardCount: z.number().int().positive().describe("The number of flashcards to generate.")
});

const flashcardsPrompt = ai.definePrompt({
    name: 'flashcardsPrompt',
    input: { schema: FlashcardsInputSchema },
    output: { schema: FlashcardsOutputSchema },
    prompt: `You are an expert at creating study materials. From the document content provided, identify and generate exactly {{{cardCount}}} key terms and their definitions to be used as flashcards.

Document Content:
---
{{{documentContent}}}
---
`,
});

export async function generateFlashcards(
  input: z.infer<typeof FlashcardsInputSchema>
): Promise<FlashcardsOutput> {
  const { output } = await flashcardsPrompt(input);
  return output!;
}


// --- Dictation ---

const DictationOutputSchema = z.object({
    media: z.string().describe("A data URI of the generated audio."),
    text: z.string().describe("The text that was converted to speech.")
});

const dictationPrompt = ai.definePrompt({
    name: 'dictationPrompt',
    input: { schema: DocumentContentInputSchema },
    output: { schema: z.object({ summary: z.string().describe("A concise summary of the document, around 150-200 words, suitable for dictation.") }) },
    prompt: `You are an expert summarizer. Summarize the following document content into a clear and concise paragraph of about 150-200 words. This summary will be used for an audio dictation exercise.

Document Content:
---
{{{documentContent}}}
---
`,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

export const generateDictation = ai.defineFlow(
  {
    name: 'generateDictationFlow',
    inputSchema: DocumentContentInputSchema,
    outputSchema: DictationOutputSchema,
  },
  async (input) => {
    // 1. Generate a text summary first
    const { output: textOutput } = await dictationPrompt(input);
    const summaryText = textOutput!.summary;

    // 2. Convert the summary text to speech
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: summaryText,
    });

    if (!media) {
      throw new Error('No audio media was returned from the TTS model.');
    }
    
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);

    return {
      media: 'data:audio/wav;base64,' + wavBase64,
      text: summaryText
    };
  }
);
