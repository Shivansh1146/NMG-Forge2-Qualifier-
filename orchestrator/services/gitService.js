import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../src/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../../');
const gitHistoryFile = path.join(__dirname, '../logs/git-history.json');

const git = simpleGit(projectRoot);

export async function commitAndPush(taskId, filesWritten) {
    try {
        await git.add('.');
        
        const modifiedFiles = filesWritten.map(f => f.filepath).join(', ');
        const commitMessage = `auto(openclaw): implement task ${taskId}\n\nModified: ${modifiedFiles}`;
        
        const commitResult = await git.commit(commitMessage);
        const pushResult = await git.push();
        
        const timestamp = new Date().toISOString();
        
        let history = [];
        if (fs.existsSync(gitHistoryFile)) {
            try {
                history = JSON.parse(fs.readFileSync(gitHistoryFile, 'utf8'));
            } catch(e) {}
        }
        
        history.push({
            taskId,
            commitHash: commitResult.commit || 'unknown',
            branch: commitResult.branch || 'unknown',
            timestamp,
            files: filesWritten
        });
        
        fs.writeFileSync(gitHistoryFile, JSON.stringify(history, null, 2));
        logger.info(`Git workflow completed for task ${taskId}`);
        
        return { success: true, commit: commitResult.commit };
    } catch (error) {
        logger.error('Git workflow failed', { error: error.message });
        return { success: false, error: error.message };
    }
}
