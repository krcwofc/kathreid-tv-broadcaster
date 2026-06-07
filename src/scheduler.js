let lastSlotKey = null;
let lastMovieKey = null;
let lastPostTime = 0;

cron.schedule("* * * * *", async () => {

  const now = Date.now();
  if (now - lastPostTime < 60000) return;

  const { slot } = getSlot(); // MUST exist in your code

  const currentSlotKey = `${slot.start}-${slot.end}`;

  // 📺 BLOCK CHANGE
  if (currentSlotKey !== lastSlotKey) {
    lastSlotKey = currentSlotKey;

    await sendDiscordMessage(
      `📺 BLOCK CHANGE\n\n${slot.label}\n\n🎬 KathReid TV is now switching programming`
    );

    lastPostTime = Date.now();
  }

  // 🎬 MOVIE DETECTION (must come from your build logic)
  const movieId = currentMovieId; // already set elsewhere in your system

  const movieKey = `${currentSlotKey}-${movieId}`;

  if (movieId && movieKey !== lastMovieKey) {
    lastMovieKey = movieKey;

    await sendDiscordMessage(
      `🎬 NOW PLAYING\n\n${movieId}\n\n📺 KathReid TV Feature Film`
    );

    lastPostTime = Date.now();
  }

});
