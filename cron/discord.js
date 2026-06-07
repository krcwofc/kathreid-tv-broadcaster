export async function sendDiscordMessage(content) {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    console.error("Missing DISCORD_WEBHOOK_URL");
    return;
  }

  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content })
  });
}
