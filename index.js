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
        "Answer question shown in the image. Give a direct, concise response without extra details. For multiple-choice questions, respond only with the letter of the correct option and its answer. Do not add any unrelated information.",
        createPartFromUri(image.uri, image.mimeType),
      ]),
    ],
  });
  console.log(response.text);
  await sendMessage(response.text);
}

await main();