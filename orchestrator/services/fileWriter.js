import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../src/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../../');

const ALLOWED_DIRS = ['frontend', 'backend'];
const PROTECTED_FILES = ['.env', '.git', '.github'];

export function isPathAllowed(targetPath) {
    const normalizedTarget = targetPath.replace(/\\/g, '/').replace(/^\/+/, '');
    
    const isAllowedDir = ALLOWED_DIRS.some(dir => normalizedTarget.startsWith(dir + '/') || normalizedTarget === dir);
    if (!isAllowedDir) return false;

    const isProtected = PROTECTED_FILES.some(protectedPath => 
        normalizedTarget === protectedPath || 
        normalizedTarget.startsWith(protectedPath + '/')
    );
    if (isProtected) return false;

    return true;
}

export function parseFiles(content) {
    const files = [];
    const regex = /FILE:\s*`?([a-zA-Z0-9_\-\.\/]+)`?\s*\n*```[a-zA-Z0-9]*\n([\s\S]*?)\n```/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
        files.push({ filepath: match[1].trim(), content: match[2] });
    }
    return files;
}

export function writeFiles(files) {
    const results = [];
    for (const file of files) {
        const { filepath, content } = file;
        
        if (!isPathAllowed(filepath)) {
            logger.warn(`File write rejected (security violation): ${filepath}`);
            results.push({ filepath, status: 'rejected', reason: 'Security violation' });
            continue;
        }

        try {
            const absolutePath = path.join(projectRoot, filepath);
            const dir = path.dirname(absolutePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(absolutePath, content);
            logger.info(`Successfully wrote file: ${filepath}`);
            results.push({ filepath, status: 'success' });
        } catch (error) {
            logger.error(`Failed to write file: ${filepath}`, { error: error.message });
            results.push({ filepath, status: 'failed', reason: error.message });
        }
    }
    return results;
}
