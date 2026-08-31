import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const colors = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
  reset: '\x1b[0m',
};

const formatMessage = (level: LogLevel, message: string, ...args: unknown[]): string => {
  const timestamp = new Date().toISOString();
  const color = colors[level];
  const reset = colors.reset;
  const prefix = `${color}[${timestamp}] [${level.toUpperCase()}]${reset}`;

  if (args.length > 0) {
    const extra = args
      .map((a) => (a instanceof Error ? a.stack ?? a.message : JSON.stringify(a, null, 2)))
      .join(' ');
    return `${prefix} ${message} ${extra}`;
  }
  return `${prefix} ${message}`;
};

const shouldLog = (level: LogLevel): boolean => {
  if (env.isProduction && level === 'debug') return false;
  return true;
};

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (shouldLog('debug')) console.debug(formatMessage('debug', message, ...args));
  },
  info: (message: string, ...args: unknown[]) => {
    if (shouldLog('info')) console.info(formatMessage('info', message, ...args));
  },
  warn: (message: string, ...args: unknown[]) => {
    if (shouldLog('warn')) console.warn(formatMessage('warn', message, ...args));
  },
  error: (message: string, ...args: unknown[]) => {
    if (shouldLog('error')) console.error(formatMessage('error', message, ...args));
  },
};
