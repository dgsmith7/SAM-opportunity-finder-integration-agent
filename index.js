import express from "express";
import cron from "node-cron";
import { runSofiaJob, runTestJob, runTestJob2 } from "./worker.js";
//import { log } from "./utils/logger.js";
//import { google } from "googleapis";
//import { authenticate } from "./services/gdocs.js"; // we'll assume you use this for regular access
import { config } from "./config.js";
import { getDb } from "./db/client.js";
// import {
//   getAllOpportunities,
//   getOpportunityById,
//   updateOpportunity,
//   deleteOpportunity,
// } from "./db/opportunity.js";

const app = express();
app.use(express.json()); // For parsing JSON request bodies
const PORT = process.env.PORT || 3000;

// Automatically connect to the database when the app starts
// (async () => {
//   try {
//     await getDb(); // Establish the database connection
//     console.log("Connected to the database successfully.");
//   } catch (err) {
//     console.log("Failed to connect to the database:", err.message);
//     process.exit(1); // Exit the process if the database connection fails
//   }
// })();

// Schedule SOFIA job to run every hour
// cron.schedule("0 * * * *", async () => {
//   log("Scheduled SOFIA job starting...");
//   await runSofiaJob();
// });

//await runTestJob();
await runTestJob2();

/*
TODO
cron to prune database if opoortunity expired
*/

// Expose basic HTTP endpoints
app.get("/", (req, res) => {
  res.send("SOFIA microservice is running");
});

app.get("/health", async (req, res) => {
  const status = {
    express: true,
    mongodb: false,
    samgov: false,
    openai: false,
    googledocs: false,
  };

  try {
    const db = await getDb(); // Use the existing database connection
    await db.admin().ping(); // Check if the database is responsive
    status.mongodb = true;
  } catch (e) {
    console.error("MongoDB health check failed:", e.message);
  }

  try {
    const samResponse = await axios.get(
      "https://api.sam.gov/opportunities/v2/search",
      {
        headers: { "X-API-KEY": config.SAM_API_KEY },
        params: { limit: 1 },
      }
    );
    if (samResponse.status === 200) status.samgov = true;
  } catch (e) {
    console.error("SAM.gov health check failed:", e.message);
  }

  // try {
  //   const aiResponse = await axios.post(
  //     "https://api.openai.com/v1/chat/completions",
  //     {
  //       model: "gpt-4",
  //       messages: [{ role: "user", content: "Ping" }],
  //       max_tokens: 5,
  //     },
  //     {
  //       headers: {
  //         Authorization: `Bearer ${config.OPENAI_API_KEY}`,
  //       },
  //     }
  //   );
  //   if (aiResponse.status === 200) status.openai = true;
  // } catch (e) {
  //   console.error("OpenAI health check failed:", e.message);
  // }

  // try {
  //   const auth = await authenticate(); // get OAuth2 client or JWT
  //   const docs = google.docs({ version: "v1", auth });
  //   await docs.documents.get({ documentId: config.GOOGLE_DOC_ID });
  //   status.googledocs = true;
  // } catch (e) {
  //   console.error("Google Docs health check failed:", e.message);
  // }

  const allHealthy = Object.values(status).every((s) => s === true);

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "ok" : "fail",
    services: status,
  });
});

// app.get('/run-now', async (req, res) => {
//   try {
//     await runSofiaJob();
//     res.send('SOFIA job completed manually.');
//   } catch (err) {
//     res.status(500).send('Error running job: ' + err.message);
//   }
// });

// // Get all opportunities
// app.get("/opportunities", async (req, res) => {
//   try {
//     const opportunities = await getAllOpportunities();
//     res.json(opportunities);
//   } catch (err) {
//     res.status(500).send("Error fetching opportunities: " + err.message);
//   }
// });

// // Get a specific opportunity by solicitation ID
// app.get("/opportunities/:id", async (req, res) => {
//   try {
//     const opportunity = await getOpportunityById(req.params.id);
//     if (!opportunity) {
//       return res.status(404).send("Opportunity not found");
//     }
//     res.json(opportunity);
//   } catch (err) {
//     res.status(500).send("Error fetching opportunity: " + err.message);
//   }
// });

// // Update an opportunity by ID
// app.put("/opportunities/:id", async (req, res) => {
//   try {
//     const updates = req.body;
//     const result = await updateOpportunity(req.params.id, updates);
//     if (result.matchedCount === 0) {
//       return res.status(404).send("Opportunity not found");
//     }
//     res.send("Opportunity updated successfully");
//   } catch (err) {
//     res.status(500).send("Error updating opportunity: " + err.message);
//   }
// });

// // Delete an opportunity by ID
// app.delete("/opportunities/:id", async (req, res) => {
//   try {
//     const result = await deleteOpportunity(req.params.id);
//     if (result.deletedCount === 0) {
//       return res.status(404).send("Opportunity not found");
//     }
//     res.send("Opportunity deleted successfully");
//   } catch (err) {
//     res.status(500).send("Error deleting opportunity: " + err.message);
//   }
// });

app.listen(PORT, () => {
  console.log(`SOFIA service listening on port ${PORT}`);
});
