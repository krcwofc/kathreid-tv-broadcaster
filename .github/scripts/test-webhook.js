const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function run() {
  if (!WEBHOOK_URL) {
    console.error("❌ Missing DISCORD_WEBHOOK_URL");
    process.exit(1);
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: "🧪 TEST MESSAGE — webhook working"
      })
    });

    const text = await res.text();

    console.log("STATUS:", res.status);
    console.log("RESPONSE:", text);

  } catch (err) {
    console.error("❌ Fetch failed:", err);
    process.exit(1);
  }
}

run();
