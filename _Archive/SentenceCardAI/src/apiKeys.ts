import { readFile } from 'fs/promises';
import os from 'os';
import path from 'path';

interface ApiKeys {
  gemini: string;
  openai: string;
}

export const apiKeys: ApiKeys = JSON.parse(
  await readFile(path.join(os.homedir(), 'AI_API_KEYS.json'), 'utf-8'),
);
