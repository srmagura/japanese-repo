import { GoogleGenAI } from '@google/genai';
import { readFile } from 'fs/promises';
import path from 'path';
import { YankiConnect } from 'yanki-connect';
import { apiKeys } from './apiKeys.ts';

// TODO Use 3.5-flash-lite?
const AI_MODEL = 'gemini-3.6-flash';
const DECK_NAME = 'Sentence Mining::Text Sentence Mining';
const WORD_LIST_DIR = 'wordLists/soundEuphonium';
const EPISODE = 's1e03'; // TODO make command line arg

const INSTRUCTIONS = `
I will send multiple Japanese words, one on each line. These are the "target words".

For each target word, create a SIMPLE example sentence in Japanese to help me learn the target word. Apart from the target word, the sentence should use easy vocab and kanji.

You must output 4 lines for each target word:

1. Example sentence in Japanese (no furigana). Wrap the target word in HTML <b></b>.
2. Example sentence in Japanese, with furigana inside square brackets. For each word that requires furigana, insert a single space before the word. Wrap the target word in HTML <b></b>, including its furigana and square brackets.
3. An English translation of the example sentence.
4. Blank line

Do NOT create a sentence that includes multiple target words.
`.trim();

const vocabFilename = path.join(WORD_LIST_DIR, `${EPISODE}.txt`);
const vocabFileContent = await readFile(vocabFilename, 'utf-8');

const ai = new GoogleGenAI({
  apiKey: apiKeys.gemini,
});

const interaction = await ai.interactions.create({
  model: AI_MODEL,
  system_instruction: INSTRUCTIONS,
  input: vocabFileContent,
});

if (!interaction.output_text) {
  throw new Error('ERROR: No output_text!');
}

console.log(interaction.output_text);
console.log('\n\n\n');

const anki = new YankiConnect();

// TODO this interface is actually unnecessary
interface SentenceData {
  sentKanji: string;
  sentFurigana: string;
  sentEng: string;
}

const lines = interaction.output_text.trim().split('\n');

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
