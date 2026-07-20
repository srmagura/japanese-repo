import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "",
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const response = await openai.responses.create({
  model: "gemini-3.5-flash",
  instructions: "Speak in all caps",
  input: " say a random sentence",
});

console.log(response.output_text);
