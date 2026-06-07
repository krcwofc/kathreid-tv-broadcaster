import express from "express";
import { startScheduler } from "../cron/scheduler.js";

const app = express();
const PORT = process.env.PORT || 3000;

console.log("📡 KathReid TV Broadcaster starting...");

// Start your scheduler
startScheduler();

// Health endpoint (used by cron-job.org)
app.get("/", (req, res) => {
  res.status(200).send("KathReid TV is running ✅");
});

// Optional: dedicated ping route
app.get("/ping", (req, res) => {
  res.status(200).json({
    status: "ok",
    time: Date.now()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
