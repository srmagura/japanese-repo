import { GoogleGenAI } from '@google/genai';
import { readFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { YankiConnect } from 'yanki-connect';

// TODO Use 3.5-flash-lite?
const AI_MODEL = 'gemini-3.6-flash';
const DECK_NAME = 'Sentence Mining::Text Sentence Mining';
const WORD_LIST_DIR = 'wordLists/soundEuphonium';
const EPISODE = 's1e03'; // TODO make command line arg

const vocabFilename = path.join(WORD_LIST_DIR, `${EPISODE}.txt`);
const vocabFileContent = await readFile(vocabFilename, 'utf-8');

interface ApiKeys {
  gemini: string;
}

const apiKeys: ApiKeys = JSON.parse(
  await readFile(path.join(os.homedir(), 'AI_API_KEYS.json'), 'utf-8'),
);

const systemInstructions = await readFile('SystemInstructions.md', 'utf-8');

const ai = new GoogleGenAI({
  apiKey: apiKeys.gemini,
});

const interaction = await ai.interactions.create({
  model: AI_MODEL,
  system_instruction: systemInstructions,
  input: vocabFileContent,
});

if (!interaction.output_text) {
  throw new Error('ERROR: No output_text!');
}

console.log(interaction.output_text);
console.log('\n\n\n');

const anki = new YankiConnect();

interface SentenceData {
  sentKanji: string;
  sentFurigana: string;
  sentEng: string;
}

const lines = interaction.output_text.split('\n');

const linesPerWord = 4;

for (let i = 0; i < lines.length; i += linesPerWord) {
  const sentKanji = lines[i]!.trim();
  const sentFurigana = lines[i + 1]!.trim();
  const sentEng = lines[i + 2]!.trim();
  // lines[i + 3] is blank

  if (!sentKanji || !sentFurigana || !sentEng) {
    throw new Error('ERROR: Failed to parse output_text!');
  }

  const sentenceData: SentenceData = { sentKanji, sentFurigana, sentEng };

  console.log(sentenceData);

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

  console.log();
}
