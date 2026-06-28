import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { logger } from './logger.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '../logs');
const plansDir = path.join(logsDir, 'plans');
const failuresDir = path.join(logsDir, 'failures');

if (!fs.existsSync(plansDir)) {
  fs.mkdirSync(plansDir, { recursive: true });
}
if (!fs.existsSync(failuresDir)) {
  fs.mkdirSync(failuresDir, { recursive: true });
}

const hermesLogFile = path.join(logsDir, 'hermes.log');

const EASTROUTER_API_KEY = process.env.EASTROUTER_API_KEY;
const EASTROUTER_BASE_URL = process.env.EASTROUTER_BASE_URL || 'https://api.eastrouter.com/v1';

async function callEastRouter(systemInstruction, userMessage) {
  const response = await axios.post(
    `${EASTROUTER_BASE_URL}/chat/completions`,
    {
      model: 'claude-opus-4-6',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userMessage }
      ]
    },
    {
      headers: {
        'Authorization': `Bearer ${EASTROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.choices[0].message.content;
}

export async function generatePlan(taskDescription) {
  try {
    const systemInstruction = "You are Hermes, an expert AI software architect.\n\nGenerate:\n\n## Task Summary\n\n## Implementation Plan\n\n## Files To Modify\n\n## Risks\n\n## Next Action";
    const planText = await callEastRouter(systemInstruction, `Task:\n${taskDescription}`);

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

export async function analyzeFailure(errorMessage) {
  try {
    const skillFile = path.join(__dirname, '../../skills/error-fix/SKILL.md');
    let skillContext = '';
    if (fs.existsSync(skillFile)) {
      skillContext = fs.readFileSync(skillFile, 'utf8');
    }

    const systemInstruction = `You are Hermes. You must analyze the following CI/CD failure based on this skill definition:\n\n${skillContext}\n\nReturn:\n* Error Classification\n* Root Cause Analysis\n* Remediation Plan`;
    const analysisText = await callEastRouter(systemInstruction, `Error Message:\n${errorMessage}`);

    const failureId = Date.now();
    const timestamp = new Date().toISOString();
    
    const jsonPayload = {
      id: failureId,
      timestamp,
      error: errorMessage,
      analysis: analysisText
    };
    
    fs.writeFileSync(path.join(failuresDir, `failure_${failureId}.json`), JSON.stringify(jsonPayload, null, 2));

    return { analysisText, failureId };
  } catch (error) {
    logger.error('Hermes failure analysis failed', { error: error.message });
    throw error;
  }
}
