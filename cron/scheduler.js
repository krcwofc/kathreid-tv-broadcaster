import cron from "node-cron";
import { sendDiscordMessage } from "./discord.js";

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

      const { slot, movieId } = state;

      const currentSlotKey = `${slot.start}-${slot.end}`;
      const movieKey = `${currentSlotKey}-${movieId}`;

      // 📺 BLOCK CHANGE
      if (currentSlotKey !== lastSlotKey) {
        lastSlotKey = currentSlotKey;

        await sendDiscordMessage(
          `📺 BLOCK CHANGE\n\n${slot.label}\n\n🎬 KathReid TV is now switching programming`
        );

        lastPostTime = Date.now();
      }

      // 🎬 MOVIE CHANGE
      if (movieId && movieKey !== lastMovieKey) {
        lastMovieKey = movieKey;

        await sendDiscordMessage(
          `🎬 NOW PLAYING\n\n${movieId}\n\n📺 KathReid TV Feature Film`
        );

        lastPostTime = Date.now();
      }

    } catch (err) {
      console.error("Scheduler error:", err);
    }

  });
}
