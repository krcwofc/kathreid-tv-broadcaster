import { sendDiscordMessage } from "./discord.js";

const KATHREID_TV_URL = "https://krcwofc.github.io/kathreid-tv/";

let lastSlotKey = null;
let lastMovieKey = null;
let lastPostTime = 0;

async function fetchTVState() {
  const res = await fetch(
    `https://krcwofc.github.io/kathreid-tv/data/state.json?t=${Date.now()}`
  );
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

Watch live:
${KATHREID_TV_URL}`;
  }
}

/* =========================
   📡 BROADCAST SENDER
========================= */

async function broadcast(type, payload) {
  const discordMsg = formatDiscord({ type, ...payload });
  await sendDiscordMessage(discordMsg);
}

/* =========================
   🚀 MAIN EXECUTION (GitHub Actions)
========================= */

async function runScheduler() {
  try {
    const now = Date.now();
    if (now - lastPostTime < 60000) return;

    const state = await fetchTVState();

    const { slot, movieId, movieTitle } = state;

    const currentSlotKey = `${slot.start}-${slot.end}`;
    const movieKey = `${currentSlotKey}-${movieId}`;

    /* 📺 SLOT CHANGE */
    if (currentSlotKey !== lastSlotKey) {
      lastSlotKey = currentSlotKey;

      await broadcast("slot", {
        slotLabel: slot.label
      });

      lastPostTime = now;
    }

    /* 🎬 MOVIE CHANGE */
    if (movieId && movieTitle && movieKey !== lastMovieKey) {
      lastMovieKey = movieKey;

      await broadcast("movie", {
        title: movieTitle
      });

      lastPostTime = now;
    }

  } catch (err) {
    console.error("Scheduler error:", err);
  }
}

/* 🚀 RUN ONCE (GitHub Actions trigger) */
runScheduler();
