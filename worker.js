import { fetchAndSaveOpportunities } from "./services/samgov.js";
import { updateGoogleSheetWithEmailedRecords } from "./services/gdocs.js";
import { generateSummariesForStorage } from "./services/summarizer.js";
import { sendEmailRollup } from "./services/emailer.js";
import { cleanOldRecords } from "./services/garbageCollection.js";
import { logAction, logError } from "./utils/logger.js";

// Function to run daily tasks
export async function runDailyTasks() {
  try {
    logAction("Starting daily tasks.");

    // Fetch new opportunities and save them to storage
    await fetchAndSaveOpportunities();

    // Generate summaries for the fetched opportunities
    await generateSummariesForStorage();

    logAction("Daily tasks completed successfully.");
  } catch (err) {
    logError(`Error in daily tasks: ${err.message}`);
  }
}

// Function to run weekly tasks
export async function runWeeklyTasks() {
  try {
    logAction("Starting weekly tasks.");

    // Fetch new opportunities and save them to storage
    await fetchAndSaveOpportunities();

    // Generate summaries for the fetched opportunities
    await generateSummariesForStorage();

    // Send an email roll-up of summarized opportunities
    await sendEmailRollup();

    // Update Google Sheets with emailed records
    await updateGoogleSheetWithEmailedRecords();

    // Clean up old records from storage
    await cleanOldRecords();

    logAction("Weekly tasks completed successfully.");
  } catch (err) {
    logError(`Error in weekly tasks: ${err.message}`);
  }
}
