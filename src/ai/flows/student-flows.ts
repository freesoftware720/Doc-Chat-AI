
'use server';
/**
 * @fileOverview AI flows for the Student Plan features.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';
import wav from 'wav';
import {
    DocumentContentInputSchema,
    StudyGuideOutputSchema,
    QuizInputSchema,
    QuizOutputSchema,
    FlashcardsInputSchema,
    FlashcardsOutputSchema,
    DictationOutputSchema,
    type StudyGuideOutput,
    type QuizOutput,
    type FlashcardsOutput,
    type QuizInput,
    type FlashcardsInput,
    type DocumentContentInput,
    type DictationOutput,
} from './student-flows-config';

// Re-export types for convenience in components
export type { StudyGuideOutput, QuizOutput, FlashcardsOutput, QuizQuestion, Flashcard, DictationOutput } from './student-flows-config';


// --- Study Guide ---

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
  input: DocumentContentInput
): Promise<StudyGuideOutput> {
  const { output } = await studyGuidePrompt(input);
  return output!;
}


// --- Quiz ---

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
  input: QuizInput
): Promise<QuizOutput> {
  const { output } = await quizPrompt(input);
  return output!;
}


// --- Flashcards ---

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
  input: FlashcardsInput
): Promise<FlashcardsOutput> {
  const { output } = await flashcardsPrompt(input);
  return output!;
}


// --- Dictation ---

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

export async function generateDictation(
    input: DocumentContentInput
): Promise<DictationOutput> {
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
