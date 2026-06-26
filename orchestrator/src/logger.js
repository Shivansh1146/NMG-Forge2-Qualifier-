import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'orchestrator.log');

export const logger = {
  info: (msg, meta = {}) => log('INFO', msg, meta),
  warn: (msg, meta = {}) => log('WARN', msg, meta),
  error: (msg, meta = {}) => log('ERROR', msg, meta),
};

function log(level, message, meta) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  
  const logString = JSON.stringify(logEntry);
  
  if (level === 'ERROR') {
    console.error(`[${timestamp}] ${level}: ${message}`, Object.keys(meta).length ? meta : '');
  } else {
    console.log(`[${timestamp}] ${level}: ${message}`, Object.keys(meta).length ? meta : '');
  }

  fs.appendFileSync(logFile, logString + '\n');
}
