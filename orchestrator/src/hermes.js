import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from './logger.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '../logs');
const plansDir = path.join(logsDir, 'plans');

if (!fs.existsSync(plansDir)) {
  fs.mkdirSync(plansDir, { recursive: true });
}

const hermesLogFile = path.join(logsDir, 'hermes.log');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    systemInstruction: "You are Hermes, an expert AI software architect.\n\nGenerate:\n\n## Task Summary\n\n## Implementation Plan\n\n## Files To Modify\n\n## Risks\n\n## Next Action"
});

export async function generatePlan(taskDescription) {
  try {
    const result = await model.generateContent(`Task:\n${taskDescription}`);
    const response = await result.response;
    const planText = response.text();

    const timestamp = new Date().toISOString();
    
    // 1. Persist plan to hermes.log
    const logEntry = `[${timestamp}] TASK:\n${taskDescription}\nPLAN:\n${planText}\n${'-'.repeat(40)}\n`;
    fs.appendFileSync(hermesLogFile, logEntry);

    // 2. Save plan as JSON in logs/plans/
    const planId = Date.now();
    const jsonPayload = {
      id: planId,
      timestamp,
      task: taskDescription,
      plan: planText
    };
    
    fs.writeFileSync(path.join(plansDir, `plan_${planId}.json`), JSON.stringify(jsonPayload, null, 2));

    return { planText, planId };
  } catch (error) {
    logger.error('Hermes generation failed', { error: error.message });
    throw error;
  }
}
