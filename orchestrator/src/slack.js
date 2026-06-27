import { App } from '@slack/bolt';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';
import { generatePlan } from './hermes.js';
import { executeTask } from './openclaw.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const delegationsFile = path.join(__dirname, '../logs/delegations.json');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

export const setupSlackListeners = () => {
  app.message(async ({ message, say, client }) => {
    // Ignore bot messages
    if (message.bot_id || message.subtype === 'bot_message') {
      return;
    }

    const sprintMainChannel = process.env.SPRINT_MAIN_CHANNEL_ID;
    const agentCoderChannel = process.env.AGENT_CODER_CHANNEL_ID;
    const agentLogChannel = process.env.AGENT_LOG_CHANNEL_ID;

    if (message.channel !== sprintMainChannel && message.channel !== agentCoderChannel) {
      return; 
    }

    logger.info('Received message in monitored channel', { 
        channel: message.channel, 
        user: message.user, 
        text: message.text 
    });

    console.log(`\n💬 Human Message:`);
    console.log(`Text: ${message.text}\n`);

    // Hermes Task Trigger
    if (message.channel === sprintMainChannel && message.text && message.text.startsWith('TASK:')) {
        try {
            logger.info('Triggering Hermes for planning');
            await say(`*Hermes*: Acknowledged task. Generating architecture plan...`);
            
            const taskDesc = message.text.replace(/^TASK:\s*/i, '');
            const { planText, planId } = await generatePlan(taskDesc);
            
            await say(planText);

            // Delegate to OpenClaw
            const agentCoderChannel = process.env.AGENT_CODER_CHANNEL_ID;
            const agentLogChannel = process.env.AGENT_LOG_CHANNEL_ID;
            
            if (agentCoderChannel && agentLogChannel) {
                const delegationMessage = `OPENCLAW_TASK\n\nTask ID: ${planId}\nOriginal User: <@${message.user}>\nTimestamp: ${new Date().toISOString()}\n\n${planText}`;
                
                // Send to #agent-coder
                await client.chat.postMessage({
                    channel: agentCoderChannel,
                    text: delegationMessage
                });
                
                // Notify #agent-log
                await client.chat.postMessage({
                    channel: agentLogChannel,
                    text: `Hermes delegated task ${planId} to OpenClaw`
                });

                // Save delegation metadata
                let delegations = [];
                if (fs.existsSync(delegationsFile)) {
                    try {
                        const raw = fs.readFileSync(delegationsFile, 'utf8');
                        if (raw.trim()) {
                            delegations = JSON.parse(raw);
                        }
                    } catch (e) {
                        logger.warn('Failed to parse delegations.json, starting fresh');
                    }
                }
                
                delegations.push({
                    taskId: planId,
                    user: message.user,
                    delegatedAt: new Date().toISOString()
                });
                
                fs.writeFileSync(delegationsFile, JSON.stringify(delegations, null, 2));
                logger.info(`Successfully delegated task ${planId} to OpenClaw`);
            } else {
                logger.warn('Delegation skipped: AGENT_CODER_CHANNEL_ID or AGENT_LOG_CHANNEL_ID missing in .env');
            }
        } catch (error) {
            logger.error('Failed to process task', { error: error.message, stack: error.stack });
            await say(`*Hermes Error*: Failed to process task - ${error.message}`);
        }
    }

    // OpenClaw Task Trigger
    if (message.channel === agentCoderChannel && message.text && message.text.startsWith('OPENCLAW_TASK')) {
        try {
            logger.info('Triggering OpenClaw for execution');
            
            const taskIdMatch = message.text.match(/Task ID:\s*(.+)/i);
            const taskId = taskIdMatch ? taskIdMatch[1].trim() : Date.now().toString();

            await say(`*OpenClaw*: Received task ${taskId}. Initializing qwen2.5-coder execution...`);
            
            const { duration, artifactPath } = await executeTask(message.text, taskId);
            
            if (agentLogChannel) {
                const summaryMsg = `*OpenClaw Execution Summary*\nTask ID: ${taskId}\nStatus: Success :white_check_mark:\nDuration: ${duration} seconds\nArtifact saved at: ${artifactPath}`;
                await client.chat.postMessage({
                    channel: agentLogChannel,
                    text: summaryMsg
                });
            }
            
            await say(`*OpenClaw*: Implementation complete in ${duration}s. Details sent to log.`);
        } catch (error) {
            logger.error('OpenClaw failed', { error: error.message });
            await say(`*OpenClaw Error*: Execution failed - ${error.message}`);
        }
    }
  });

  return app;
};
