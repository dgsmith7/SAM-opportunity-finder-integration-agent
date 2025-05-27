import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { logError, logAction } from "../utils/logger.js";

// Configure AWS SDK for DigitalOcean Spaces
const s3 = new S3Client({
  endpoint: "https://nyc3.digitaloceanspaces.com",
  region: "us-east-1", // Specify the region
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY, // Add this to your .env file
    secretAccessKey: process.env.DO_SPACES_SECRET, // Add this to your .env file
  },
});

const BUCKET_NAME = process.env.BUCKET_NAME;
const STORAGE_FILE_NAME = process.env.STORAGE_FILE_NAME;

// Helper function to convert stream to string
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

// Save a new record to the storage file
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

    // Upload updated records to DigitalOcean Spaces
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: STORAGE_FILE_NAME,
      Body: JSON.stringify(existingRecords, null, 2),
      ContentType: "application/json",
    });
    await s3.send(command);

    logAction(`Successfully saved record to storage: ${noticeId}`);
  } catch (error) {
    logError(`Error saving to file storage: ${error.message}`);
  }
}

// Read all records from the storage file
export async function readFileStorage() {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: STORAGE_FILE_NAME,
    });
    const data = await s3.send(command);
    const body = await streamToString(data.Body);

    logAction("Successfully read data from storage file.");
    return JSON.parse(body);
  } catch (error) {
    if (error.name === "NoSuchKey") {
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
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: STORAGE_FILE_NAME,
      Body: JSON.stringify(updatedRecords, null, 2),
      ContentType: "application/json",
    });
    await s3.send(command);

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
