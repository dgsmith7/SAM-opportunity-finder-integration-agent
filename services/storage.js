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
      noticeStatus,
    };
    const existingRecords = await readFileStorage();
    existingRecords.push(record);
    await fs.writeFile(STORAGE_FILE, JSON.stringify(existingRecords, null, 2));
    console.log(`Saved record: ${noticeId}`);
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
