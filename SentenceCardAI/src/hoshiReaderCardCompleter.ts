import OpenAI from 'openai';
import { apiKeys } from './apiKeys.ts';
import { YankiConnect } from 'yanki-connect';

const AI_MODEL = 'gpt-5.6-luna';

const INSTRUCTIONS = `
I will send a Japanese sentence. The target word is in an HTML <b> tag. I want to learn the target word.

You must output 3 lines:

1. The sentence in Japanese, with furigana inside square brackets. The furigana must appear after the word. For each word that requires furigana, insert a single space before the word. Wrap the target word in HTML <b></b>, including its furigana and square brackets.
2. An English translation of the example sentence.
3. Blank line
`.trim();

const anki = new YankiConnect();
const noteIds = await anki.note.findNotes({
  query: `"deck:Sentence Mining::Text Sentence Mining" tag:hoshi-reader-new`,
});

// if (noteIds.length > 20) {
//   throw new Error(
//     'too many note ids (this can certainly be improved with batching)',
//   );
// }

const noteInfo = await anki.note.notesInfo({ notes: noteIds });

const sentKanji = noteInfo[0]!.fields.SentKanji?.value.trim();
if (!sentKanji) {
  console.log(
    `SentKanji is undefined/empty for note ${noteIds[0]}, skipping...\n`,
  );
  throw new Error('temp error');
}

const openai = new OpenAI({
  apiKey: apiKeys.openai,
});

const startTime = performance.now();

const response = await openai.responses.create({
  model: AI_MODEL,
  instructions: INSTRUCTIONS,
  input: sentKanji,
});

console.log(response.output_text + '\n\n\n');

const lines = response.output_text.trim().split('\n');

const linesPerWord = 3;

for (let i = 0; i < lines.length; i += linesPerWord) {
  const sentFurigana = lines[i]!.trim();
  const sentEng = lines[i + 1]!.trim();
  // lines[i + 2] is blank

  if (!sentFurigana || !sentEng) {
    throw new Error('ERROR: Failed to parse output_text!');
  }

  console.log({ sentFurigana, sentEng });

  try {
    await anki.note.updateNoteFields({
      note: {
        id: noteIds[0]!,
        fields: {
          SentFurigana: sentFurigana,
          SentEng: sentEng,
        },
      },
    });
    await anki.note.removeTags({
      notes: [noteIds[0]!],
      tags: 'hoshi-reader-new',
    });
    console.log(`Success! Updated Note ID: ${noteIds[0]}`);
  } catch (error) {
    console.error(`Updating Note ${noteIds[0]} failed:\n`);
    throw error;
  }

  console.log();
}

const elapsedSeconds = Math.round((performance.now() - startTime) / 1000);
console.log(`Took ${elapsedSeconds} seconds`);
