import OpenAI from 'openai';
import { apiKeys } from './apiKeys.ts';

const INPUT = `say a random sentence`.trim();

const INSTRUCTIONS = `speak in ALL CAPS`.trim();

const openai = new OpenAI({
  apiKey: apiKeys.openai,
});

const response = await openai.responses.create({
  model: 'gpt-5.6-luna',
  instructions: INSTRUCTIONS,
  input: INPUT,
});

console.log(response.output_text);
