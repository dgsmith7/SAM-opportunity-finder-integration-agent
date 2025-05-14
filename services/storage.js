import fs from "fs/promises";
import path from "path";
import { logError, logAction } from "../utils/logger.js";

const STORAGE_FILE = path.resolve("storage.json");

// Save a new record to the storage file
export async function saveToFileStorage(
  noticeId,
  dateFetched,
  title,
  federalOrg,
  datePosted,
  dueDate,
  setAside,
  naicsCodes,
  locationCity,
  locationState,
  descriptionUrl,
  samUrl,
  summaryText,
  noticeStatus
) {
  try {
    const record = {
      noticeId,
      dateFetched,
      title,
      federalOrg,
      datePosted,
      dueDate,
      setAside,
      naicsCodes,
      locationCity,
      locationState,
      descriptionUrl,
      samUrl,
      summaryText,
      noticeStatus,
    };

    // Read existing records from storage.json
    const existingRecords = await readFileStorage();

    // Check if the record already exists
    const recordIndex = existingRecords.findIndex(
      (existingRecord) => existingRecord.noticeId === noticeId
    );

    if (recordIndex !== -1) {
      // Overwrite the existing record
      existingRecords[recordIndex] = record;
      logAction(`Updated existing record: ${noticeId}`);
    } else {
      // Add the new record
      existingRecords.push(record);
      logAction(`Added new record: ${noticeId}`);
    }

    // Write the updated records back to storage.json
    await fs.writeFile(STORAGE_FILE, JSON.stringify(existingRecords, null, 2));
    logAction(`Successfully saved record to storage: ${noticeId}`);
  } catch (error) {
    logError(`Error saving to file storage: ${error.message}`);
  }
}

// Check if a record already exists in the storage file
export async function alreadyExistsInFileStorage(noticeId) {
  try {
    const existingRecords = await readFileStorage();
    const exists = existingRecords.some(
      (record) => record.noticeId === noticeId
    );
    logAction(
      `Checked existence of record with Notice ID: ${noticeId}. Exists: ${exists}`
    );
    return exists;
  } catch (error) {
    logError(`Error checking file storage: ${error.message}`);
    return false;
  }
}

// Read all records from the storage file
export async function readFileStorage() {
  try {
    const data = await fs.readFile(STORAGE_FILE, "utf-8");
    logAction("Successfully read data from storage file.");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // If the file doesn't exist, return an empty array
      logAction("Storage file not found. Returning an empty array.");
      return [];
    }
    logError(`Error reading file storage: ${error.message}`);
    throw error;
  }
}

// Delete a record from the storage file by notice ID
export async function deleteFromFileStorage(noticeId) {
  try {
    const existingRecords = await readFileStorage();
    const updatedRecords = existingRecords.filter(
      (record) => record.noticeId !== noticeId
    );
    await fs.writeFile(STORAGE_FILE, JSON.stringify(updatedRecords, null, 2));
    logAction(`Deleted record with Notice ID: ${noticeId}`);
  } catch (error) {
    logError(`Error deleting from file storage: ${error.message}`);
  }
}
