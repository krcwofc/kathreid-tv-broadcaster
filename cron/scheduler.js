import { sendDiscordMessage } from "./discord.js";

const KATHREID_TV_URL = "https://krcwofc.github.io/kathreid-tv/";

let lastSlotKey = null;
let lastMovieKey = null;
let lastPostTime = 0;

/* =========================
   📡 FETCH STATE
========================= */

async function fetchTVState() {
  const res = await fetch(
    `https://krcwofc.github.io/kathreid-tv/data/state.json?t=${Date.now()}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch state.json: ${res.status}`);
  }

  return await res.json();
}

/* =========================
   🧠 PLATFORM FORMATTER
========================= */

function formatDiscord({ type, title, slotLabel }) {
  if (type === "slot") {
    return `📺 KATHREID TV UPDATE

🎞️ Now Entering:
${slotLabel}

🔴 Live Broadcast Continues 24/7

Watch here:
${KATHREID_TV_URL}`;
  }

  if (type === "movie") {
    return `🎬 NOW PLAYING

${title}

📺 KathReid TV - Feature Presentation

Watch here:
${KATHREID_TV_URL}`;
  }

  return ""; // ✅ FIX: prevents undefined payload crashes
}

/* =========================
   📡 BROADCAST SENDER
========================= */

async function broadcast(type, payload) {
  const msg = formatDiscord({ type, ...payload });

  if (!msg) {
    console.error("❌ Empty message blocked");
    return;
  }

  await sendDiscordMessage(msg);
}

/* =========================
   🚀 MAIN EXECUTION
========================= */

async function runScheduler() {
  try {
    const now = Date.now();

    if (now - lastPostTime < 60000) {
      console.log("⏳ Cooldown active, skipping run");
      return;
    }

    const state = await fetchTVState();

    console.log("📦 STATE RECEIVED:", JSON.stringify(state, null, 2));

    const { slot, movieId, movieTitle } = state;

    /* =========================
       🧨 SAFETY GUARD
    ========================= */

    if (!slot || typeof slot.start !== "number" || typeof slot.end !== "number") {
      console.error("❌ Invalid slot data:", slot);
      return;
    }

    const currentSlotKey = `${slot.start}-${slot.end}`;

    // ✅ FIX: stable movieKey even if movieId missing
    const movieKey = movieId ? `${currentSlotKey}-${movieId}` : null;

    /* =========================
       📺 SLOT CHANGE
    ========================= */

    if (currentSlotKey !== lastSlotKey) {
      lastSlotKey = currentSlotKey;

      await broadcast("slot", {
        slotLabel: slot.label
      });

      lastPostTime = now;
    }

    /* =========================
       🎬 MOVIE CHANGE
    ========================= */

    if (
      movieId &&
      movieTitle &&
      movieKey &&
      movieKey !== lastMovieKey
    ) {
      lastMovieKey = movieKey;

      await broadcast("movie", {
        title: movieTitle
      });

      lastPostTime = now;
    }

  } catch (err) {
    console.error("❌ Scheduler error:", err);
  }
}

/* 🚀 RUN ONCE */
runScheduler();
