const BOT_TOKEN = '8087884422:AAH6f_EQ_fz5sZmgzVR6Oa2rU-jBxDySUAc';
const CHAT_ID = '1386155375';

export default async function sendMessage(message) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message
      })
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err.message);
  }
}
