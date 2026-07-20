import { GoogleGenAI } from '@google/genai';
import { readFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { YankiConnect } from 'yanki-connect';

const AI_MODEL = 'gemini-3.5-flash';
const DECK_NAME = 'Sentence Mining::Text Sentence Mining';

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
  model: AI_MODEL,
  system_instruction: systemInstructions,
  input: '学校',
  // TODO change thinking level? https://ai.google.dev/gemini-api/docs/text-generation
});

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

const anki = new YankiConnect();

try {
  const noteId = await anki.note.addNote({
    note: {
      deckName: DECK_NAME,
      modelName: 'Japanese sentences+',
      fields: {
        SentKanji: sentenceData.sentKanji,
        SentFurigana: sentenceData.sentFurigana,
        sentEng: sentenceData.sentEng,
      },
      tags: ['sentence-card-ai', AI_MODEL],
    },
  });

  console.log(`Success! Card created with Note ID: ${noteId}`);
} catch (error) {
  // YankiConnect automatically extracts the API error string and throws it
  console.error('Failed to add card:', error);
}
