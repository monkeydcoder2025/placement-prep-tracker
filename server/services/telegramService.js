// Using native fetch
export async function sendTelegramMessage(botToken, chatId, message) {
  if (!botToken || !chatId) {
    throw new Error('Telegram bot token or chat ID is missing');
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML' // allow some basic formatting
    })
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Telegram API Error: ${data.description}`);
  }

  return data;
}
