import { app, BrowserWindow, globalShortcut } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import screenshot from "screenshot-desktop";
import sendTelegramMessage from "./tele.js";
import sendDiscordMessage from './discord.js';

import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let win;

async function takeScreenshotAndProcess() {
  try {
    if (win) win.webContents.send("hide-screen");
    const scrPath = path.join(__dirname, 'screenshot.png');
    await screenshot({ filename: scrPath });
    const image = await ai.files.upload({
      file: scrPath,
    });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        createUserContent([
          "Answer question shown in the image. Give a direct, response without extra details. For multiple-choice questions, respond only with the letter of the correct option and its answer. Do not add any unrelated information. If the question is a subjective question, with no options answer everything that question asks, according to the question, not too long, not two short, make sure that it at least can be written on 1 A4 page, make sure its in the format of college exam answer. Make sure the answer is not too big, I have only 15 minutes to write the answer.",
          // "Given the image and the caption text shown on screen, first extract the main question from the caption. Then, answer that question concisely as you would in a viva exam: keep the answer short, direct, and focused only on the essential points needed for a spoken response. Do not include extra details or unrelated information.",
          createPartFromUri(image.uri, image.mimeType),
        ]),
      ],
    });

    console.log('response', response.text);

    if (win) {
      win.webContents.send("update-text", response.text);
      win.webContents.send("show-screen");
    }

    sendTelegramMessage(response.text);//telegram
    sendDiscordMessage(response.text);//discord
  } catch (err) {
    if (win) {
      win.webContents.send("update-text", "Error: " + err.message);
      win.webContents.send("show-screen");
    }
    console.error(err);
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 200,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
  // win.webContents.openDevTools();
  win.setAlwaysOnTop(true, "screen-saver");

  let clickThrough = false;
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    clickThrough = !clickThrough;
    win.setIgnoreMouseEvents(clickThrough, { forward: true });
    win.setOpacity(clickThrough ? 0.9 : 1.0);
  });

  globalShortcut.register('CommandOrControl+Shift+O', () => {
    if (win.isVisible()) win.hide(); else win.show();
  });

  globalShortcut.register("CommandOrControl+Shift+F1", takeScreenshotAndProcess);
  globalShortcut.register("CommandOrControl+Shift+F2", takeScreenshotAndProcess);
  globalShortcut.register("F1", takeScreenshotAndProcess);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('will-quit', () => { globalShortcut.unregisterAll(); });