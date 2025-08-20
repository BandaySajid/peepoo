import dotenv from "dotenv";
dotenv.config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";
const DISCORD_MAX_LENGTH = 1900;

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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function sendDiscordMessage(content) {
  try {
    const messages = splitMessageByWord(content, DISCORD_MAX_LENGTH);
    for (let i = 0; i < messages.length; i++) {
      let formattedContent;
      if (i === 0) {
        const messageHeader = `**New Answer**`;
        formattedContent = `${messageHeader}\n\`\`\`\n${messages[i]}\n\`\`\``;
      } else {
        formattedContent = `\`\`\`\n${messages[i]}\n\`\`\``;
      }
      const res = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: formattedContent
        })
      });
      console.log("Discord webhook response:", res.status);
      await delay(1000); // 1 second delay between messages
    }
  } catch (err) {
    console.error("Discord webhook error:", err.message);
  }
}


