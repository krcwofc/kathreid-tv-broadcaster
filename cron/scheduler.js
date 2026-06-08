import fs from "fs";
import { sendDiscordMessage } from "./discord.js";

const KATHREID_TV_URL =
  "https://krcwofc.github.io/kathreid-tv/";

const MEMORY_FILE = "./data/scheduler-memory.json";

/* =========================
   🧠 MEMORY LOAD/SAVE
========================= */

function loadMemory() {
  try {
    return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
  } catch {
    return {
      lastSlotKey: null,
      lastMovieKey: null
    };
  }
}

function saveMemory(memory) {
  fs.mkdirSync("./data", { recursive: true });
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

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
   🧠 FORMAT MESSAGE
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

  return "";
}

/* =========================
   📡 DISCORD SEND
========================= */

async function broadcast(type, payload) {
  const msg = formatDiscord({ type, ...payload });

  if (!msg) return;

  await sendDiscordMessage(msg);
}

/* =========================
   🚀 MAIN SCHEDULER
========================= */

async function runScheduler() {
  try {
    const memory = loadMemory();

    const state = await fetchTVState();

    const { slot, movieId, movieTitle } = state;

    if (!slot || typeof slot.start !== "number" || typeof slot.end !== "number") {
      console.error("❌ Invalid slot data:", slot);
      return;
    }

    const currentSlotKey = `${slot.start}-${slot.end}`;
    const movieKey = movieId ? `${currentSlotKey}-${movieId}` : null;

    /* =========================
       📺 SLOT CHANGE
    ========================= */

    if (currentSlotKey !== memory.lastSlotKey) {
      memory.lastSlotKey = currentSlotKey;

      await broadcast("slot", {
        slotLabel: slot.label
      });
    }

    /* =========================
       🎬 MOVIE CHANGE
    ========================= */

    if (
      movieId &&
      movieTitle &&
      movieKey &&
      movieKey !== memory.lastMovieKey
    ) {
      memory.lastMovieKey = movieKey;

      await broadcast("movie", {
        title: movieTitle
      });
    }

    /* =========================
       💾 SAVE MEMORY (IMPORTANT)
    ========================= */

    saveMemory(memory);
  } catch (err) {
    console.error("❌ Scheduler error:", err);
  }
}

/* =========================
   ▶ RUN
========================= */

runScheduler();
