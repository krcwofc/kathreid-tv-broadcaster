const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function test() {
  if (!WEBHOOK_URL) {
    console.error("❌ Missing DISCORD_WEBHOOK_URL");
    return;
  }

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: "🧪 TEST MESSAGE — Discord webhook working"
    })
  });

  console.log("Status:", res.status);
  console.log(await res.text());
}

test();
