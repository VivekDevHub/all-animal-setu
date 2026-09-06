import { v4 as uuidv4 } from 'uuid';

export function generateRequestId(): string {
  return uuidv4();
}

export function sanitizeForLog(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    if (value.length > 200) {
      return `${value.slice(0, 200)}...[truncated]`;
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeForLog);
  }

  if (typeof value === 'object') {
    const sensitiveKeys = new Set([
      'password',
      'token',
      'authorization',
      'privateKey',
      'apiKey',
      'secret',
    ]);

    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (sensitiveKeys.has(key.toLowerCase())) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = sanitizeForLog(val);
      }
    }
    return result;
  }

  return value;
}
