import dotenv from "dotenv";
dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

console.log('envos are here', BOT_TOKEN, CHAT_ID);

const TELEGRAM_MAX_LENGTH = 1900;

function splitMessageByWord(message, maxLength) {
  if (message.length <= maxLength) return [message];
  const words = message.split(' ');
  const chunks = [];
  let current = '';
  for (const word of words) {
    if ((current + (current ? ' ' : '') + word).length > maxLength) {
      if (current) chunks.push(current);
      current = word;
    } else {
      current += (current ? ' ' : '') + word;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export default async function sendTelegramMessage(message) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const messages = splitMessageByWord(message, TELEGRAM_MAX_LENGTH);
    for (const part of messages) {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: part
        })
      });
      const data = await res.json();
      console.log(data);
    }
  } catch (err) {
    console.error(err.message);
  }
}
