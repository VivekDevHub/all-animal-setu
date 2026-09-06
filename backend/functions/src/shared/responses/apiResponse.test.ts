import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { sendSuccess, sendError } from './apiResponse';

describe('apiResponse helpers', () => {
  it('sendSuccess returns standardized success payload', () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;

    sendSuccess(res, { id: '123' }, { message: 'Created', statusCode: 201 });

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({
      success: true,
      data: { id: '123' },
      message: 'Created',
    });
  });

  it('sendError returns standardized error payload', () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;

    sendError(res, 403, 'FORBIDDEN', 'Access denied');

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied',
      },
    });
  });
});
