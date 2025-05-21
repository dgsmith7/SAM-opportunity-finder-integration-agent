import { google } from "googleapis";
import { readFileStorage, saveToFileStorage } from "./storage.js";
import { logError, logAction } from "../utils/logger.js";

// Ping Google Sheets API to check if it's operational
export async function pingGDocs() {
  try {
    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
    });
    const sheets = google.sheets({
      version: "v4",
      auth: await auth.getClient(),
    });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = "Sheet1!A1"; // Adjust the range as needed

    // Attempt to read a cell from the spreadsheet to verify connectivity
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    logAction("Google Sheets ping successful.");
    return true;
  } catch (error) {
    logError(`Google Sheets ping failed: ${error.message}`);
    return false;
  }
}

// Update Google Sheet with records that have been emailed
export async function updateGoogleSheetWithEmailedRecords() {
  try {
    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
    });
    const sheets = google.sheets({
      version: "v4",
      auth: await auth.getClient(),
    });

    // Read data from storage.json
    const storageData = await readFileStorage();

    // Filter records with noticeStatus "emailed"
    const emailedRecords = storageData.filter(
      (record) => record.noticeStatus === "emailed"
    );

    if (emailedRecords.length === 0) {
      logAction("No emailed records found to append to Google Sheets.");
      return;
    }

    // Prepare data for Google Sheets
    const rows = emailedRecords.map((record) => {
      // Extract the one-liner (short description) from the summaryText
      let shortDescription = "No short description available.";
      if (record.summaryText) {
        const oneLinerMatch = record.summaryText.match(
          /\*\*One-line Description:\*\*\s*(.+?)(?=\n|$)/
        );
        if (oneLinerMatch) {
          shortDescription = oneLinerMatch[1].trim();
        }
      }

      // Combine location city and state
      const location = `${record.locationCity || ""}, ${
        record.locationState || ""
      }`
        .trim()
        .replace(/^,|,$/, ""); // Remove leading/trailing commas

      return [
        record.noticeId,
        record.naicsCodes?.join(", ") || "Not specified",
        location || "Not specified",
        record.title || "No title available",
        shortDescription,
        record.setAside || "Not specified", // New "Vehicle" column
        record.samUrl || "No link available",
        record.dueDate || "Not specified",
        record.relatedNoticeId || "Not specified",
        "", // Awardee column left blank
      ];
    });

    // Add headers only if the sheet is empty
    const headers = [
      "Notice ID",
      "NAICS Code",
      "Location",
      "Title",
      "Short Description",
      "Vehicle", // New header for the "Vehicle" column
      "Link",
      "Date Due",
      "Related Notice ID",
      "Awardee",
    ];

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = "Sheet1!A1"; // Adjust the range as needed

    // Check if the sheet is empty
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    if (!existingData.data.values || existingData.data.values.length === 0) {
      rows.unshift(headers); // Add headers if the sheet is empty
    }

    // Append data to the spreadsheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1", // Specify the sheet name
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: rows,
      },
    });

    logAction("Successfully appended emailed records to Google Sheets.");

    // Update noticeStatus to "documented" for the appended records
    for (const record of emailedRecords) {
      record.noticeStatus = "documented";

      // Save the updated record back to storage.json
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
        record.summaryText,
        record.noticeStatus
      );
    }

    logAction("Updated noticeStatus to 'documented' for appended records.");
  } catch (error) {
    logError(
      `Error updating Google Sheet with emailed records: ${error.message}`
    );
    throw error;
  }
}
