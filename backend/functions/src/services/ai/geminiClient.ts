import { GoogleGenAI } from '@google/genai';
import { getEnv } from '../../config/env';
import { AppError, ERROR_CODES } from '../../shared/errors';
import { logger } from '../../shared/logger/logger';

let cachedClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const env = getEnv();
  if (!env.GEMINI_API_KEY) {
    throw new AppError(
      ERROR_CODES.AI_SERVICE_UNAVAILABLE,
      'AI service is temporarily unavailable. Please consult a veterinarian if your pet needs medical attention.',
    );
  }

  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  return cachedClient;
}

export function resetGeminiClientForTests(): void {
  cachedClient = null;
}

export function extractJsonFromResponse(rawText: string): unknown {
  let cleaned = rawText.trim();
  // Remove markdown json fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    logger.warn('ai_json_parse_failed', {
      error: error instanceof Error ? error.message : String(error),
      previewLength: cleaned.length,
    });
    throw new AppError(
      ERROR_CODES.AI_INVALID_RESPONSE,
      'AI service returned an unparseable response. Please try again or consult a veterinarian.',
    );
  }
}

export interface GenerateTextOptions {
  systemInstruction?: string;
  prompt: string;
  model?: string;
  timeoutMs?: number;
}

export interface GenerateMultimodalOptions {
  systemInstruction?: string;
  prompt: string;
  imageBuffer: Buffer;
  mimeType: string;
  model?: string;
  timeoutMs?: number;
}

export async function generateStructuredContent<T>(options: GenerateTextOptions): Promise<T> {
  const client = getGeminiClient();
  const env = getEnv();
  const model = options.model ?? env.GEMINI_MODEL;
  const timeoutMs = options.timeoutMs ?? 25000;

  try {
    const callPromise = client.models.generateContent({
      model,
      contents: options.prompt,
      config: {
        systemInstruction: options.systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timeout exceeded')), timeoutMs),
    );

    const result = await Promise.race([callPromise, timeoutPromise]);
    const responseText = result.text ?? '';

    if (!responseText) {
      throw new AppError(
        ERROR_CODES.AI_INVALID_RESPONSE,
        'AI service returned an empty response. Please consult a veterinarian.',
      );
    }

    const parsed = extractJsonFromResponse(responseText);
    return parsed as T;
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('ai_gemini_call_failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(
      ERROR_CODES.AI_SERVICE_UNAVAILABLE,
      'AI service is temporarily unavailable. Please consult a veterinarian if your pet needs medical attention.',
    );
  }
}

export async function generateMultimodalStructuredContent<T>(
  options: GenerateMultimodalOptions,
): Promise<T> {
  const client = getGeminiClient();
  const env = getEnv();
  const model = options.model ?? env.GEMINI_MODEL;
  const timeoutMs = options.timeoutMs ?? 25000;

  try {
    const base64Data = options.imageBuffer.toString('base64');

    const callPromise = client.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            { text: options.prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: options.mimeType,
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction: options.systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI multimodal request timeout exceeded')), timeoutMs),
    );

    const result = await Promise.race([callPromise, timeoutPromise]);
    const responseText = result.text ?? '';

    if (!responseText) {
      throw new AppError(
        ERROR_CODES.AI_INVALID_RESPONSE,
        'AI breed identification returned an empty response.',
      );
    }

    const parsed = extractJsonFromResponse(responseText);
    return parsed as T;
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('ai_gemini_multimodal_call_failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(
      ERROR_CODES.AI_SERVICE_UNAVAILABLE,
      'AI breed identification is temporarily unavailable. Please try again later.',
    );
  }
}
