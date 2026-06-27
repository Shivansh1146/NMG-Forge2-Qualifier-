import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ollama from 'ollama';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const generatedDir = path.join(__dirname, '../generated');

if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

const systemPrompt = `You are OpenClaw.

Generate production-ready implementation code.

Return exactly in this format:
* Files to create:
FILE: frontend/path/to/file.ext
\`\`\`
code here
\`\`\`
* Commands required`;

export async function executeTask(taskPayload, taskId) {
  const startTime = Date.now();
  
  try {
    logger.info(`OpenClaw started execution for task ${taskId}`);
    
    const response = await ollama.chat({
      model: 'qwen2.5-coder',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: taskPayload }
      ]
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const content = response.message.content;
    
    // Save generated artifact
    const artifactPath = path.join(generatedDir, `artifact_${taskId || Date.now()}.md`);
    fs.writeFileSync(artifactPath, content);
    
    logger.info(`OpenClaw execution completed for task ${taskId} in ${duration}s`);
    
    return {
      content,
      duration,
      artifactPath
    };
  } catch (error) {
    logger.error('OpenClaw execution failed', { error: error.message });
    throw error;
  }
}
