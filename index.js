import express from "express";
import cron from "node-cron";
import { runDailyTasks, runWeeklyTasks } from "./worker.js";
import { logError, logAction, logTraffic } from "./utils/logger.js";
import { pingSamGov } from "./services/samgov.js";
import { pingGDocs } from "./services/gdocs.js";
import { pingAI } from "./services/summarizer.js";

const app = express();
app.use(express.json()); // For parsing JSON request bodies
const PORT = process.env.PORT || 3000;

// Middleware to log traffic
app.use((req, res, next) => {
  logTraffic(req.ip, req.originalUrl);
  next();
});

// Middleware to handle errors
app.use((err, req, res) => {
  logError(`Error occurred: ${err.message}`);
  res.status(500).send("Internal Server Error");
});

// Configure CORS – adjust origin as needed - for future use when endpoints are public
// app.use(
//   cors({
//     origin: "https://pin.dgs-creative.com", // update to your frontend domain if needed
//   })
// );

// Schedule daily tasks to run every day at 2:01 AM Eastern Time, except Friday
cron.schedule("1 6 * * 0-4,6", async () => {
  try {
    logAction("Scheduled daily tasks starting...");
    await runDailyTasks();
    logAction("Scheduled daily tasks completed.");
  } catch (error) {
    logError(`Error in scheduled daily tasks: ${error.message}`);
  }
});

// Schedule weekly tasks to run every Friday at 2:01 AM Eastern Time
cron.schedule("1 6 * * 5", async () => {
  try {
    logAction("Scheduled weekly tasks starting...");
    await runWeeklyTasks();
    logAction("Scheduled weekly tasks completed.");
  } catch (error) {
    logError(`Error in scheduled weekly tasks: ${error.message}`);
  }
});

// Will run on startup
try {
  logAction("Running weekly tasks on startup...");
  await runWeeklyTasks();
  // Send an email roll-up of summarized opportunities
  logAction("Startup tasks completed.");
} catch (error) {
  logError(`Error in startup tasks: ${error.message}`);
}

// Expose basic HTTP endpoints
// Basic status endpoint
app.get("/", (req, res) => {
  res.send("SOFIA microservice is running");
});

// Endpoint to manually trigger weekly tasks
app.get("/runall", async (req, res) => {
  try {
    logAction("Manual trigger for weekly tasks starting...");
    await runWeeklyTasks();
    logAction("Manual trigger for weekly tasks completed.");
    res.status(200).send("Weekly tasks executed successfully.");
  } catch (error) {
    logError(`Error in manual trigger for weekly tasks: ${error.message}`);
    res.status(500).send("Error executing weekly tasks.");
  }
});

// Feature health check endpoint
app.get("/health", async (req, res) => {
  const status = {
    express: true,
    samgov: false,
    openai: false,
    googledocs: false,
  };

  // SAM.gov health check
  try {
    const samResponse = await pingSamGov();
    if (samResponse == true) {
      status.samgov = true;
    } else {
      logError(`SAM.gov responded with status ${samResponse.status}`);
    }
  } catch (e) {
    logError(`SAM.gov health check failed: ${e.message}`);
  }

  // OpenAI health check
  try {
    const aiResponse = await pingAI();
    if (aiResponse == true) {
      status.openai = true;
    } else {
      logError(`OpenAI responded with status ${aiResponse.status}`);
    }
  } catch (e) {
    logError(`OpenAI health check failed: ${e.message}`);
  }

  // Google Docs health check
  try {
    const driveResponse = await pingGDocs();
    if (driveResponse == true) {
      status.googledocs = true;
    } else {
      logError(`Google Docs responded with status ${driveResponse.status}`);
    }
  } catch (e) {
    logError(`Google Docs health check failed: ${e.message}`);
  }

  const allHealthy = Object.values(status).every((s) => s === true);

  if (allHealthy) {
    logAction("Health check passed: All services are operational.");
  } else {
    logError("Health check failed: One or more services are down.");
  }

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "ok" : "fail",
    services: status,
  });
});

// Start the server
app.listen(PORT, () => {
  logAction(`SOFIA service listening on port ${PORT}`);
});
