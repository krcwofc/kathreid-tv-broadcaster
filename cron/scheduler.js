import cron from "node-cron";
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

export function startScheduler() {

  cron.schedule("* * * * *", async () => {

    try {
      const now = Date.now();
      if (now - lastPostTime < 60000) return;

      const state = await fetchTVState();

      const { slot, movieId, movieTitle } = state;

      const currentSlotKey = `${slot.start}-${slot.end}`;
      const movieKey = `${currentSlotKey}-${movieId}`;

      // 📺 BLOCK CHANGE
      if (currentSlotKey !== lastSlotKey) {
        lastSlotKey = currentSlotKey;

        await sendDiscordMessage(
`📺 KATHREID TV UPDATE

🎞️ Now Entering:
${slot.label}

🔴 Live Broadcast Continues 24/7

Watch here:
${KATHREID_TV_URL}`
        );

        lastPostTime = Date.now();
      }

      // 🎬 MOVIE CHANGE
      if (movieId && movieTitle && movieKey !== lastMovieKey) {
        lastMovieKey = movieKey;

        await sendDiscordMessage(
`🎬 NOW PLAYING

${movieTitle}

📺 KathReid TV - Feature Presentation

Watch live:
${KATHREID_TV_URL}`
        );

        lastPostTime = Date.now();
      }

    } catch (err) {
      console.error("Scheduler error:", err);
    }

  });
}
