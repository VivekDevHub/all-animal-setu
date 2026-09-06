import { getEnv } from '../../config/env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  userId?: string;
  endpoint?: string;
  status?: number;
  durationMs?: number;
  errorCode?: string;
  [key: string]: unknown;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(level: LogLevel): boolean {
  const configured = getEnv().LOG_LEVEL;
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[configured];
}

function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'animalsetu-backend',
    ...context,
  };
  return JSON.stringify(payload);
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (shouldLog('debug')) {
      console.debug(formatLog('debug', message, context));
    }
  },

  info(message: string, context?: LogContext): void {
    if (shouldLog('info')) {
      console.info(formatLog('info', message, context));
    }
  },

  warn(message: string, context?: LogContext): void {
    if (shouldLog('warn')) {
      console.warn(formatLog('warn', message, context));
    }
  },

  error(message: string, context?: LogContext): void {
    if (shouldLog('error')) {
      console.error(formatLog('error', message, context));
    }
  },
};
