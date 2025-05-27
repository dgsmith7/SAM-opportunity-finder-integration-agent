import fs from "fs/promises";
import path from "path";
import { logError, logAction } from "../utils/logger.js";

const STORAGE_FILE_PATH = path.resolve("storage.json");

// Save a new record to the local storage file
export async function saveToFileStorage(
  noticeId,
  type,
  dateFetched,
  relatedTo,
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
      type,
      dateFetched,
      relatedTo,
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

    const existingRecords = await readFileStorage();

    // Check if the record already exists
    const recordIndex = existingRecords.findIndex(
      (existingRecord) => existingRecord.noticeId === noticeId
    );

    if (recordIndex !== -1) {
      existingRecords[recordIndex] = record; // Update existing record
    } else {
      existingRecords.push(record); // Add new record
    }

    // Write updated records to the local file
    await fs.writeFile(
      STORAGE_FILE_PATH,
      JSON.stringify(existingRecords, null, 2),
      "utf-8"
    );

    logAction(`Successfully saved record to local storage: ${noticeId}`);
  } catch (error) {
    logError(`Error saving to local file storage: ${error.message}`);
  }
}

// Read all records from the local storage file
export async function readFileStorage() {
  try {
    const data = await fs.readFile(STORAGE_FILE_PATH, "utf-8");
    logAction("Successfully read data from local storage file.");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      logAction("Local storage file not found. Returning an empty array.");
      return [];
    }
    logError(`Error reading local file storage: ${error.message}`);
    throw error;
  }
}

// Delete a record from the local storage file by notice ID
export async function deleteFromFileStorage(noticeId) {
  try {
    const existingRecords = await readFileStorage();
    const updatedRecords = existingRecords.filter(
      (record) => record.noticeId !== noticeId
    );

    // Write updated records to the local file
    await fs.writeFile(
      STORAGE_FILE_PATH,
      JSON.stringify(updatedRecords, null, 2),
      "utf-8"
    );

    logAction(`Deleted record with Notice ID: ${noticeId}`);
  } catch (error) {
    logError(`Error deleting from local file storage: ${error.message}`);
  }
}

// Check if a record already exists in the local storage file
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
    logError(`Error checking local file storage: ${error.message}`);
    return false;
  }
}
