import { ImageAnnotatorClient } from '@google-cloud/vision';
import { getEnv, isTest } from '../../config/env';
import { logger } from '../../shared/logger/logger';

let visionClient: ImageAnnotatorClient | null = null;

function getVisionClient(): ImageAnnotatorClient | null {
  if (isTest()) {
    return null;
  }

  if (!visionClient) {
    const env = getEnv();
    visionClient = new ImageAnnotatorClient({
      projectId: env.GOOGLE_CLOUD_PROJECT || env.FIREBASE_PROJECT_ID,
    });
  }

  return visionClient;
}

export async function extractTextFromStorage(storagePath: string): Promise<string> {
  const client = getVisionClient();
  if (!client) {
    return '';
  }

  const env = getEnv();
  const gcsUri = `gs://${env.STORAGE_BUCKET}/${storagePath}`;
  const [result] = await client.textDetection(gcsUri);
  return result.fullTextAnnotation?.text ?? result.textAnnotations?.[0]?.description ?? '';
}

export function parseMedicalText(rawText: string): Record<string, string> {
  const extracted: Record<string, string> = {};

  const vaccineMatch = rawText.match(/(?:vaccine|vaccination)[:\s-]*([A-Za-z0-9\s]+)/i);
  if (vaccineMatch?.[1]) {
    extracted.vaccineName = vaccineMatch[1].trim().slice(0, 100);
  }

  const dateMatches = rawText.match(/\b(20\d{2}-\d{2}-\d{2}|\d{2}[/-]\d{2}[/-]\d{4})\b/g) ?? [];
  if (dateMatches[0]) {
    extracted.dateGiven = normalizeDate(dateMatches[0]);
  }
  if (dateMatches[1]) {
    extracted.nextDueDate = normalizeDate(dateMatches[1]);
  }

  const vetMatch = rawText.match(/(?:vet|doctor|dr\.?)[:\s-]*([A-Za-z.\s]+)/i);
  if (vetMatch?.[1]) {
    extracted.vetName = vetMatch[1].trim().slice(0, 100);
  }

  const clinicMatch = rawText.match(/(?:clinic|hospital)[:\s-]*([A-Za-z0-9\s]+)/i);
  if (clinicMatch?.[1]) {
    extracted.clinicName = clinicMatch[1].trim().slice(0, 200);
  }

  return extracted;
}

function normalizeDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parts = value.includes('/') ? value.split('/') : value.split('-');
  if (parts.length === 3 && parts[2].length === 4) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return value;
}

export async function runOcrSafely(storagePath: string): Promise<{
  rawText: string;
  extractedData: Record<string, string>;
}> {
  try {
    logger.info('ocr_started', { storagePath });
    const rawText = await extractTextFromStorage(storagePath);
    const extractedData = parseMedicalText(rawText);
    logger.info('ocr_completed', { storagePath });
    return { rawText, extractedData };
  } catch (error) {
    logger.error('ocr_failed', {
      storagePath,
      message: error instanceof Error ? error.message : 'Unknown OCR error',
    });
    return { rawText: '', extractedData: {} };
  }
}
