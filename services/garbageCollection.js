import { readFileStorage, saveToFileStorage } from "./storage.js";
import { logError, logAction } from "../utils/logger.js";

// Function to clean up old records from storage.json
export async function cleanOldRecords() {
  try {
    // Read data from storage.json
    const storageData = await readFileStorage();
    logAction("Starting garbage collection...");
    logAction(`Total records in storage before cleanup: ${storageData.length}`);

    // Get the current date and calculate the cutoff date (30 days ago)
    const currentDate = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(currentDate.getDate() - 30);

    // Filter out records older than 30 days based on the datePosted field
    const updatedRecords = storageData.filter((record) => {
      const datePosted = new Date(record.datePosted);
      return datePosted >= cutoffDate; // Keep records within the last 30 days
    });

    logAction(`Total records after cleanup: ${updatedRecords.length}`);

    // Save the updated records back to storage.json
    for (const record of updatedRecords) {
      await saveToFileStorage(
        record.noticeId,
        record.dateFetched,
        record.title,
        record.federalOrg,
        record.datePosted,
        record.dueDate,
        record.setAside,
        record.naicsCodes,
        record.locationCity,
        record.locationState,
        record.descriptionUrl,
        record.samUrl,
        record.summary,
        record.noticeStatus
      );
    }

    logAction("Old records successfully cleaned up.");
  } catch (error) {
    logError(`Error during garbage collection: ${error.message}`);
  }
}
