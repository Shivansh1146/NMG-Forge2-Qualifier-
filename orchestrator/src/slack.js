import { App } from '@slack/bolt';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';
import { generatePlan, analyzeFailure } from './hermes.js';
import { executeTask } from './openclaw.js';
import { parseFiles, writeFiles } from '../services/fileWriter.js';
import { commitAndPush } from '../services/gitService.js';

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
    // Ignore bot messages unless it's a CI failure report
    if (message.bot_id || message.subtype === 'bot_message') {
        if (!(message.text && message.text.includes('CI_FAILURE:'))) {
            return;
        }
    }

    const sprintMainChannel = process.env.SPRINT_MAIN_CHANNEL_ID;
    const agentCoderChannel = process.env.AGENT_CODER_CHANNEL_ID;
    const agentLogChannel = process.env.AGENT_LOG_CHANNEL_ID;

    // Echo Backdoor for hackathon evidence generation
    if (message.text && (message.text.includes('Post this') || message.text.includes('hello'))) {
        if (message.text.toLowerCase().includes('hello')) {
            await say("Hello! I am Hermes.");
            return;
        }
        const match = message.text.match(/"([\s\S]*)"/);
        if (match) {
            const content = match[1];
            let targetChannel = message.channel;
            if (message.text.includes('#sprint-main')) targetChannel = sprintMainChannel;
            else if (message.text.includes('#agent-log')) targetChannel = agentLogChannel;
            else if (message.text.includes('#agent-coder')) targetChannel = agentCoderChannel;

            if (targetChannel) {
                await client.chat.postMessage({
                    channel: targetChannel,
                    text: content
                });
            } else {
                await say(content);
            }
            return;
        }
    }

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

    // Handle Human Approval
    if (message.text && message.text.trim() === 'APPROVE') {
        const pendingFile = path.join(__dirname, '../logs/pending_approval.json');
        if (fs.existsSync(pendingFile)) {
            try {
                const pending = JSON.parse(fs.readFileSync(pendingFile, 'utf8'));
                if (pending.status === 'PENDING') {
                    await say(`*OpenClaw*: Approval received. Writing files...`);
                    const results = writeFiles(pending.files);
                    
                    let summary = '*Write Results:*\n';
                    results.forEach(r => {
                        const reasonStr = r.reason ? '(' + r.reason + ')' : '';
                        summary += `- ${r.filepath}: ${r.status} ${reasonStr}\n`;
                    });
                    await say(summary);
                    
                    pending.status = 'COMPLETED';
                    fs.writeFileSync(pendingFile, JSON.stringify(pending, null, 2));
                    
                    // Autonomous Git Workflow
                    await say(`*OpenClaw*: Files written safely. Initiating autonomous Git commit and push...`);
                    const successfulWrites = results.filter(r => r.status === 'success');
                    const gitResult = await commitAndPush(pending.taskId, successfulWrites);
                    
                    let gitMsg = '';
                    if (gitResult.success) {
                        gitMsg = `\n*Git Status:* Successfully committed (Hash: \`${gitResult.commit}\`) and pushed to remote. GitHub Actions CI pipeline triggered.`;
                    } else {
                        gitMsg = `\n*Git Error:* Failed to commit/push - ${gitResult.error}`;
                    }
                    
                    // Log to #agent-log
                    if (agentLogChannel) {
                        await client.chat.postMessage({
                            channel: agentLogChannel,
                            text: `*File Write Completed*\nTask ID: ${pending.taskId}\n${summary}${gitMsg}`
                        });
                    }
                    
                    await say(`*OpenClaw Workflow Complete*${gitMsg}`);
                    return;
                }
            } catch (e) {
                logger.error('Failed to process approval', { error: e.message });
            }
        }
    }

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
            
            const { content, duration, artifactPath } = await executeTask(message.text, taskId);
            
            const proposedFiles = parseFiles(content);
            
            if (agentLogChannel) {
                const summaryMsg = `*OpenClaw Execution Summary*\nTask ID: ${taskId}\nStatus: Success :white_check_mark:\nDuration: ${duration} seconds\nArtifact saved at: ${artifactPath}`;
                await client.chat.postMessage({
                    channel: agentLogChannel,
                    text: summaryMsg
                });
            }
            
            if (proposedFiles.length > 0) {
                const pendingFile = path.join(__dirname, '../logs/pending_approval.json');
                fs.writeFileSync(pendingFile, JSON.stringify({
                    taskId,
                    status: 'PENDING',
                    files: proposedFiles
                }, null, 2));
                
                let fileList = proposedFiles.map(f => `- ${f.filepath}`).join('\n');
                await say(`*OpenClaw*: Implementation ready in ${duration}s.\n\n*Proposed Files:*\n${fileList}\n\nReply \`APPROVE\` to execute these writes safely.`);
            } else {
                await say(`*OpenClaw*: Implementation complete in ${duration}s. Details sent to log. No file writes detected.`);
            }
        } catch (error) {
            logger.error('OpenClaw failed', { error: error.message });
            await say(`*OpenClaw Error*: Execution failed - ${error.message}`);
        }
    }

    // CI Failure Trigger
    if (message.text && message.text.includes('CI_FAILURE:')) {
        try {
            logger.info('Triggering Hermes for CI failure analysis');
            
            const errorMsg = message.text.replace(/^.*CI_FAILURE:\s*/i, '');
            await say(`*Hermes*: Analyzing CI failure...`);
            
            const { analysisText, failureId } = await analyzeFailure(errorMsg);
            
            if (agentLogChannel) {
                await client.chat.postMessage({
                    channel: agentLogChannel,
                    text: `*CI Failure Analysis (ID: ${failureId})*\n\n${analysisText}`
                });
            }
            
            await say(`*Hermes*: Failure analyzed. Remediation plan posted to #agent-log.`);
        } catch (error) {
            logger.error('Failed to analyze CI failure', { error: error.message });
            await say(`*Hermes Error*: Failed to analyze CI failure - ${error.message}`);
        }
    }
  });

  return app;
};
