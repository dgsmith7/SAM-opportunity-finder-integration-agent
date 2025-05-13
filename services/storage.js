import fs from "fs/promises";
import path from "path";

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
      console.log(`Updated existing record: ${noticeId}`);
    } else {
      // Add the new record
      existingRecords.push(record);
      console.log(`Added new record: ${noticeId}`);
    }

    // Write the updated records back to storage.json
    await fs.writeFile(STORAGE_FILE, JSON.stringify(existingRecords, null, 2));
  } catch (error) {
    console.error("Error saving to file storage:", error.message);
  }
}

// Check if a record already exists in the storage file
export async function alreadyExistsInFileStorage(noticeId) {
  try {
    const existingRecords = await readFileStorage();
    return existingRecords.some((record) => record.noticeId === noticeId);
  } catch (error) {
    console.error("Error checking file storage:", error.message);
    return false;
  }
}

// Read all records from the storage file
export async function readFileStorage() {
  try {
    const data = await fs.readFile(STORAGE_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // If the file doesn't exist, return an empty array
      return [];
    }
    console.error("Error reading file storage:", error.message);
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
    console.log(`Deleted record: ${noticeId}`);
  } catch (error) {
    console.error("Error deleting from file storage:", error.message);
  }
}
