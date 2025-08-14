import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import screenshot from 'screenshot-desktop';
import path from "path";
import { fileURLToPath } from "url";
import sendMessage from "./tele.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

console.log('env', process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const scrPath = path.join(__dirname, 'screenshot.png');
  await screenshot({ filename: scrPath });
  const image = await ai.files.upload({
    file: scrPath,
  });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      createUserContent([
        "Only answer the question directly without any extra details. If the question is a multiple choice question with multiple options, respond only with the option and the answer",
        createPartFromUri(image.uri, image.mimeType),
      ]),
    ],
    config: {
      systemInstruction: "Only answer the question directly without any extra details. If the question is a multiple choice question with multiple options, respond only with the option and the answer.",
    },
  });
  await sendMessage(response.text);
}

await main();