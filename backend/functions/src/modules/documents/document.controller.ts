import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { assertAuthenticated } from '../../shared/auth/authorization';
import { AppError, ERROR_CODES } from '../../shared/errors';
import {
  confirmDocumentOcr,
  getDocument,
  triggerDocumentOcr,
  uploadDocument,
} from './document.service';
import { ConfirmOcrSchema } from './document.schema';
import { uploadDocumentFieldsSchema } from './document.schema';

export async function uploadDocumentHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);

  const parsedFields = uploadDocumentFieldsSchema.safeParse(req.body);
  if (!parsedFields.success) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid upload metadata', {
      details: parsedFields.error.flatten(),
    });
  }

  const document = await uploadDocument(user.uid, req.file!, parsedFields.data);
  sendSuccess(res, document, { message: 'Document uploaded successfully', statusCode: 201 });
}

export async function getDocumentHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const documentId = req.params.documentId as string;
  const document = await getDocument(documentId, user.uid);
  sendSuccess(res, document);
}

export async function triggerOcrHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const documentId = req.params.documentId as string;
  const document = await triggerDocumentOcr(documentId, user.uid);
  sendSuccess(res, document, { message: 'OCR processing started' });
}

export async function confirmOcrHandler(req: Request, res: Response): Promise<void> {
  const user = assertAuthenticated(req);
  const documentId = req.params.documentId as string;
  const result = await confirmDocumentOcr(documentId, user.uid, req.body as ConfirmOcrSchema);
  sendSuccess(res, result, { message: 'OCR data confirmed' });
}
