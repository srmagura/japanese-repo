import { GoogleGenAI } from '@google/genai';
import { readFile } from 'fs/promises';
import os from 'os';
import path from 'path';

interface ApiKeys {
  gemini: string;
}

const apiKeys: ApiKeys = JSON.parse(
  await readFile(path.join(os.homedir(), 'AI_API_KEYS.json'), 'utf-8'),
);

const ai = new GoogleGenAI({
  apiKey: apiKeys.gemini,
});

const interaction = await ai.interactions.create({
  model: 'gemini-3.5-flash',
  input: 'Explain how AI works in less than 20 words',
});

console.log(interaction.output_text);
