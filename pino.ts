// Improved pino logger configuration
// - Environment-aware (pretty-printing only in non-production)
// - Includes service + version metadata from package.json
// - Redacts common sensitive fields
// - Adds std serializers and timestamp in ISO format
// - Exports a `createLogger` helper for creating child loggers

import { pino, type Logger, stdSerializers } from 'pino';
import pkg from './package.json';

const isProd = process.env.NODE_ENV === 'production';
const level = process.env.PINO_LOG_LEVEL || (isProd ? 'info' : 'debug');

const base = {
  service: (pkg && pkg.name) || 'devflow',
  version: (pkg && pkg.version) || '0.0.0',
};

// Common fields to redact from logs to avoid leaking secrets
const redact = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  'password',
  'token',
  'secret',
];

const transport = isProd
  ? undefined
  : {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    };

export const logger: Logger = pino({
  level,
  base,
  redact,
  serializers: {
    err: stdSerializers.err,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport,
});

// Helper to create a child logger with additional bindings/context
export function createLogger(bindings?: Record<string, unknown>) {
  return bindings ? logger.child(bindings) : logger;
}

