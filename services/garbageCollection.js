import { readFileStorage, saveToFileStorage } from "./storage.js";

export async function cleanOldRecords() {
  try {
    // Read data from storage.json
    const storageData = await readFileStorage();
    console.log(
      `Total records in storage before cleanup: ${storageData.length}`
    );

    // Get the current date and calculate the cutoff date (30 days ago)
    const currentDate = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(currentDate.getDate() - 30);

    // Filter out records older than 30 days based on the datePosted field
    const updatedRecords = storageData.filter((record) => {
      const datePosted = new Date(record.datePosted);
      return datePosted >= cutoffDate; // Keep records within the last 30 days
    });

    console.log(`Total records after cleanup: ${updatedRecords.length}`);

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

    console.log("Old records successfully cleaned up.");
  } catch (error) {
    console.error("Error during garbage collection:", error.message);
  }
}
