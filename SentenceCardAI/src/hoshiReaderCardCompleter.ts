import OpenAI from 'openai';
import { apiKeys } from './apiKeys.ts';
import { YankiConnect } from 'yanki-connect';

const NOTE_LIMIT = 10;
const AI_MODEL = 'gpt-5.6-luna';

const INSTRUCTIONS = `
I will send you multiple Japanese sentences, one per line. In each sentence, the target word is in an HTML <b> tag. I want to learn the target word.

For each input sentence, in the same order, you must output 3 lines:

1. The sentence in Japanese, with furigana inside square brackets. The furigana must appear after the word. For each word that requires furigana, insert a single space before the word. Wrap the target word in HTML <b></b>, including its furigana and square brackets. The furigana must only contain the reading of the kanji. For example, you must write 着[つ]きました instead of 着きました[つきました]
2. An English translation of the example sentence.
3. Blank line

Do this for every input sentence. The number of 3-line blocks you output must equal the number of input sentences.
`.trim();

const anki = new YankiConnect();
const originalNoteIds = await anki.note.findNotes({
  query: `"deck:Sentence Mining::Text Sentence Mining" tag:hoshi-reader-new`,
});
const noteIds = originalNoteIds.slice(0, NOTE_LIMIT);

const noteInfo = await anki.note.notesInfo({ notes: noteIds });

const sentKanjis = noteInfo.map((info, i) => {
  const sentKanji = info.fields.SentKanji?.value.trim();
  if (!sentKanji) {
    throw new Error(`SentKanji is undefined/empty for note ${noteIds[i]}`);
  }
  return sentKanji;
});

const openai = new OpenAI({
  apiKey: apiKeys.openai,
});

const startTime = performance.now();

const response = await openai.responses.create({
  model: AI_MODEL,
  instructions: INSTRUCTIONS,
  input: sentKanjis.join('\n'),
});

console.log(response.output_text + '\n\n\n');

const lines = response.output_text.trim().split('\n');

const linesPerWord = 3;

for (let i = 0; i < lines.length; i += linesPerWord) {
  const noteIndex = i / linesPerWord;
  const noteId = noteIds[noteIndex]!;
  const sentFurigana = lines[i]!.trim();
  const sentEng = lines[i + 1]!.trim();
  // lines[i + 2] is blank

  if (!sentFurigana || !sentEng) {
    throw new Error('ERROR: Failed to parse output_text!');
  }

  //console.log({ sentFurigana, sentEng });

  try {
    await anki.note.updateNoteFields({
      note: {
        id: noteId,
        fields: {
          SentFurigana: sentFurigana,
          SentEng: sentEng,
        },
      },
    });
    await anki.note.removeTags({
      notes: [noteId],
      tags: 'hoshi-reader-new',
    });
    console.log(
      `(${noteIndex + 1} of ${noteIds.length}) Updated Note ID: ${noteId}`,
    );
  } catch (error) {
    console.error(`Updating Note ${noteId} failed:\n`);
    throw error;
  }
}

console.log();

const elapsedSeconds = Math.round((performance.now() - startTime) / 1000);
console.log(`Took ${elapsedSeconds} seconds\n`);
console.log(`${originalNoteIds.length - noteIds.length} notes left to go.`);
