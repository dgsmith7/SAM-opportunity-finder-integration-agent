import AWS from "aws-sdk";
import { logError, logAction } from "../utils/logger.js";

// Configure AWS SDK for DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint("nyc3.digitaloceanspaces.com");
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY, // Add this to your .env file
  secretAccessKey: process.env.DO_SPACES_SECRET, // Add this to your .env file
});

const BUCKET_NAME = "sofia";
const STORAGE_FILE_KEY = "storage.json";

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

    // Upload updated records to DigitalOcean Spaces
    await s3
      .putObject({
        Bucket: BUCKET_NAME,
        Key: STORAGE_FILE_KEY,
        Body: JSON.stringify(existingRecords, null, 2),
        ContentType: "application/json",
      })
      .promise();

    logAction(`Successfully saved record to storage: ${noticeId}`);
  } catch (error) {
    logError(`Error saving to file storage: ${error.message}`);
  }
}

// Read all records from the storage file
export async function readFileStorage() {
  try {
    const data = await s3
      .getObject({
        Bucket: BUCKET_NAME,
        Key: STORAGE_FILE_KEY,
      })
      .promise();

    logAction("Successfully read data from storage file.");
    return JSON.parse(data.Body.toString("utf-8"));
  } catch (error) {
    if (error.code === "NoSuchKey") {
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

    // Upload updated records to DigitalOcean Spaces
    await s3
      .putObject({
        Bucket: BUCKET_NAME,
        Key: STORAGE_FILE_KEY,
        Body: JSON.stringify(updatedRecords, null, 2),
        ContentType: "application/json",
      })
      .promise();

    logAction(`Deleted record with Notice ID: ${noticeId}`);
  } catch (error) {
    logError(`Error deleting from file storage: ${error.message}`);
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
