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

const systemInstructions = await readFile('SystemInstructions.txt', 'utf-8');

const ai = new GoogleGenAI({
  apiKey: apiKeys.gemini,
});

const interaction = await ai.interactions.create({
  model: 'gemini-3.5-flash',
  system_instruction: systemInstructions,
  input: '学校',
  // TODO change thinking level? https://ai.google.dev/gemini-api/docs/text-generation
});

console.log(interaction.output_text);

if (!interaction.output_text) {
  throw new Error('ERROR: No output_text!');
}

interface SentenceData {
  sentKanji: string;
  sentFurigana: string;
  sentEng: string;
}

const [sentKanji, sentFurigana, sentEng] = interaction.output_text
  .split('\n')
  .map((line) => line.trim());

if (!sentKanji || !sentFurigana || !sentEng) {
  throw new Error('ERROR: Failed to parse output_text!');
}

const sentenceData: SentenceData = { sentKanji, sentFurigana, sentEng };

console.log(sentenceData);
