export async function sendDiscordMessage(content) {
  const url = process.env.DISCORD_WEBHOOK_KRBROADC;

  if (!url) {
    console.error("Missing DISCORD_WEBHOOK_KRBROADC");
    return;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content })
    });

    if (!res.ok) {
      console.error("Discord webhook failed:", res.status, await res.text());
    }

  } catch (err) {
    console.error("Discord webhook error:", err);
  }
}
