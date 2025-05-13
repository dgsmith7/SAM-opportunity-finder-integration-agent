import { google } from "googleapis";
import { config } from "../config.js";
import { readFileStorage } from "./storage.js";

export async function dumpStorageToGoogleSheet() {
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
    if (storageData.length === 0) {
      console.log("No data found in storage.json to dump.");
      return;
    }

    // Prepare data for Google Sheets
    const rows = storageData.map((record) => [
      record.noticeId,
      record.dateFetched,
      record.title,
      record.federalOrg,
      record.datePosted,
      record.dueDate,
      record.setAside,
      record.naicsCodes?.join(", ") || "",
      record.locationCity,
      record.locationState,
      record.descriptionUrl,
      record.samUrl,
    ]);

    // Add headers to the rows
    const headers = [
      "Notice ID",
      "Date Fetched",
      "Title",
      "Federal Organization",
      "Date Posted",
      "Due Date",
      "Set Aside",
      "NAICS Codes",
      "Location City",
      "Location State",
      "Description URL",
      "SAM URL",
    ];
    rows.unshift(headers);

    // Write data to Google Sheets
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = "Sheet1!A1"; // Adjust the range as needed
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values: rows,
      },
    });

    console.log("Successfully dumped storage.json data to Google Sheets.");
  } catch (error) {
    console.error(
      "Error dumping storage.json to Google Sheets:",
      error.message
    );
    throw error;
  }
}
