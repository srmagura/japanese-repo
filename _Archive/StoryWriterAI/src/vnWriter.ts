import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { apiKeys } from './apiKeys.ts';

// Edit these each time
const VN_NAME = `Clannad`;
const VN_DESC = `Clannad`;
const NUMBER_OF_SCENES = 2;
const SCENE_LENGTH = '150 - 350 words';

const INSTRUCTIONS = `
Write the text for a visual novel in Japanese. The visual novel should be a fanfic, meaning that it differs from the original work.

The text must contain both narration and dialog. Put each block of text in its own paragraph.

For all character names, **only** use their given name. Write all character names in kana wrapped in a <span> tag. Example: <span class="name">はると</span>は学生です

Prefix each line of dialog with the character's name, like this: <span class="speaker">[はると]</span> いい天気だね。

All narration must be in short form (write だ instead of です).

The visual novel will have multiple scenes.
`.trim();

const INPUT = `
Visual novel description: ${VN_DESC}
Number of scenes: ${NUMBER_OF_SCENES}
Scene length: ${SCENE_LENGTH}
`.trim();

const openai = new OpenAI({
  apiKey: apiKeys.openai,
});

const startTime = performance.now();

const response = await openai.responses.create({
  model: 'gpt-5.6-terra',
  instructions: INSTRUCTIONS,
  input: INPUT,
});
console.log(response.usage);

const STYLE_BLOCK = `<style>
.name {
    color: #0000A3;
}

.speaker {
    color: #298F00;
    margin-right: 0.5rem;
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
const filename = `${VN_NAME} ${datetime}.md`;
const filePath = path.join(outputDir, filename);

fs.writeFileSync(filePath, markdownText);

console.log(`Wrote story to "${filename}" (${storyText.length} characters)`);

const elapsedSeconds = Math.round((performance.now() - startTime) / 1000);
console.log(`Took ${elapsedSeconds} seconds`);
