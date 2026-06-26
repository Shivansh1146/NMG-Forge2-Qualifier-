import { App } from '@slack/bolt';
import dotenv from 'dotenv';
import { logger } from './logger.js';

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
  });

  return app;
};
