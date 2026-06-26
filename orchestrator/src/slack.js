import { App } from '@slack/bolt';
import dotenv from 'dotenv';
import { logger } from './logger.js';
import { generatePlan } from './hermes.js';

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

export const setupSlackListeners = () => {
  app.message(async ({ message }) => {
    // Ignore bot messages
    if (message.bot_id || message.subtype === 'bot_message') {
      return;
    }

    // Listen only in #sprint-main
    const targetChannel = process.env.SPRINT_MAIN_CHANNEL_ID;
    if (targetChannel && message.channel !== targetChannel) {
      return; 
    }

    logger.info('Received human message in target channel', { 
        channel: message.channel, 
        user: message.user, 
        text: message.text 
    });

    console.log(`\n💬 Human Message:`);
    console.log(`Text: ${message.text}\n`);

    // Hermes Task Trigger
    if (message.text && message.text.startsWith('TASK:')) {
        try {
            logger.info('Triggering Hermes for planning');
            await say(`*Hermes*: Acknowledged task. Generating architecture plan...`);
            
            const taskDesc = message.text.replace(/^TASK:\s*/i, '');
            const plan = await generatePlan(taskDesc);
            
            await say(plan);
        } catch (error) {
            await say(`*Hermes Error*: Failed to generate plan - ${error.message}`);
        }
    }
  });

  return app;
};
