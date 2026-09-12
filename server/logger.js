import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGS_DIR = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

// Console readable format
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}]: ${stack || message}${metaStr}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true })
  ),
  defaultMeta: { service: 'shit-or-hit-server' },
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: combine(
        colorize(),
        consoleFormat
      )
    }),
    // Structured JSON log for all server operations
    new winston.transports.File({
      filename: path.join(LOGS_DIR, 'server.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      format: combine(
        json()
      )
    }),
    // Dedicated error log
    new winston.transports.File({
      filename: path.join(LOGS_DIR, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      format: combine(
        json()
      )
    })
  ]
});

// Express request logging middleware
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: statusCode,
      durationMs: duration,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
    };

    if (statusCode >= 500) {
      logger.error(`HTTP ${req.method} ${req.originalUrl} ${statusCode} [${duration}ms]`, logData);
    } else if (statusCode >= 400) {
      logger.warn(`HTTP ${req.method} ${req.originalUrl} ${statusCode} [${duration}ms]`, logData);
    } else {
      logger.info(`HTTP ${req.method} ${req.originalUrl} ${statusCode} [${duration}ms]`, logData);
    }
  });
  next();
}
