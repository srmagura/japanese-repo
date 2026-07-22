import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { apiKeys } from './apiKeys.ts';

// Edit these each time
const STORY_NAME = 'Angel Beats';
const STORY_DESC = `Angel Beats fanfic`;
const NUMBER_OF_CHAPTERS = 4;
const CHAPTER_LENGTH = '125 - 225 words';

const INSTRUCTIONS = `
Write a story in Japanese. Use only N4 vocab or easier. No furigana, apart from the following exception.

When a character's name first appears, show the hiragana for the name like this: 田中[たなか]春人[はると]は学生です

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

const response = await openai.responses.create({
  model: 'gpt-5.6-luna',
  instructions: INSTRUCTIONS,
  input: INPUT,
});

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

fs.writeFileSync(filePath, response.output_text);

console.log(
  `Wrote story to "${filename}" (${response.output_text.length} characters)`,
);
