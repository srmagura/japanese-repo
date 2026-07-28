import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { apiKeys } from './apiKeys.ts';

// Edit these each time
const LEVEL = 'N4';
const STORY_NAME = `[${LEVEL}] Sound! Euphonium`;
const STORY_DESC = `Fanfic of Sound! Euphonium (anime)`;
const NUMBER_OF_CHAPTERS = 7;
const CHAPTER_LENGTH = '300 - 450 words';

const INSTRUCTIONS = `
Write a story in Japanese. Use only ${LEVEL} vocab or easier. No furigana.

For all character names, **only** use their given name. Write all character names in kana wrapped in a <span> tag. Examples: <span>はると</span>は学生です, <span>ジョン</span>は学生です

All narration and prose must be in short form (write だ instead of です).

The story may have multiple chapters.
`.trim();

const INPUT = `
Story description: ${STORY_DESC}
Number of chapters: ${NUMBER_OF_CHAPTERS}
Chapter length: ${CHAPTER_LENGTH}
`.trim();

const openai = new OpenAI({
  apiKey: apiKeys.openai,
});

const startTime = performance.now();

const response = await openai.responses.create({
  model: 'gpt-5.6-luna',
  instructions: INSTRUCTIONS,
  input: INPUT,
});
console.log(response.usage);

const STYLE_BLOCK = `<style>
span {
    color: #0000A3;
}
</style>`;

// Regex targeting Unicode zero-width and invisible formatting characters - THANKS GPT
const storyText = response.output_text.replace(/[\u200B-\u200D\uFEFF]/g, '');

const markdownText = `${STYLE_BLOCK}\n\n${storyText}`;

const now = new Date();
const datetime = now
  .toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  .replace(/[/:]/g, '-')
  .replace(',', '');

const outputDir = path.join(import.meta.dirname, '..', 'storyOutput');
const filename = `${STORY_NAME} ${datetime}.md`;
const filePath = path.join(outputDir, filename);

fs.writeFileSync(filePath, markdownText);

console.log(`Wrote story to "${filename}" (${storyText.length} characters)`);

const elapsedSeconds = Math.round((performance.now() - startTime) / 1000);
console.log(`Took ${elapsedSeconds} seconds`);
