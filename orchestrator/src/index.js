import { setupSlackListeners } from './slack.js';
import { logger } from './logger.js';
import dotenv from 'dotenv';

dotenv.config();

const start = async () => {
  try {
    const app = setupSlackListeners();
    await app.start();
    logger.info('⚡️ Orchestrator Slack app is running in Socket Mode!');
  } catch (error) {
    logger.error('Failed to start Orchestrator', { error: error.message });
    process.exit(1);
  }
};

start();
