import {
  config,
  naicsCodes,
  pCodes,
  setAsideValues,
  samApiUrl,
} from "../config.js";
import { alreadyExistsInFileStorage, saveToFileStorage } from "./storage.js";
import fetch from "node-fetch";

export async function fetchAndSaveOpportunities() {
  console.log("Starting to fetch opportunities from SAM.gov...");

  for (const naicsCode of naicsCodes) {
    // Construct query parameters for all pCodes and setAsideValues
    const pCodeParams = pCodes.map((pCode) => `ptype=${pCode}`).join("&");
    const setAsideParams = setAsideValues
      .map((setAside) => `typeOfSetAsideDescription=${setAside}`)
      .join("&");

    // Build the full query string
    const queryString = `${samApiUrl}?api_key=${
      config.SAM_API_KEY
    }&ncode=${naicsCode}&${pCodeParams}&${setAsideParams}&postedFrom=${getDate(
      30
    )}&postedTo=${getDate()}&limit=100&sortBy=createdDate&sortOrder=desc`;

    try {
      console.log(`Fetching opportunities for NAICS: ${naicsCode}`);
      console.log(`Query: ${queryString}`);
      const response = await fetch(queryString);
      const data = await response.json();

      if (data.opportunitiesData && Array.isArray(data.opportunitiesData)) {
        for (const opportunity of data.opportunitiesData) {
          const noticeId = opportunity.noticeId; // Use noticeId from the API response
          const title = opportunity.title;
          const federalOrg = opportunity.fullParentPathName;
          const datePosted = opportunity.postedDate; // Use datePosted from the API response
          const dueDate = opportunity.responseDeadLine; // Use dueDate from the API response
          const setAside = opportunity.typeOfSetAsideDescription; // Use setAsideDescription from the API response
          const naicsCodes = opportunity.naicsCodes; // Use naicsCodes from the API response
          // Safely expand placeOfPerformance object
          const placeOfPerformance = opportunity.placeOfPerformance || {};
          const locationCity = placeOfPerformance.city?.name || "Not specified";
          const locationState =
            placeOfPerformance.state?.name || "Not specified";
          const descriptionUrl = opportunity.description;
          const samUrl = opportunity.uiLink;
          const summaryText = "";
          const noticeStatus = "new";
          // Check if the notice already exists in the storage file
          if (!(await alreadyExistsInFileStorage(noticeId))) {
            // Save the opportunity to the storage file
            await saveToFileStorage(
              noticeId,
              new Date().toISOString().split("T")[0],
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
            );
            console.log(`Saved new opportunity: ${noticeId}`);
          } else {
            console.log(`Opportunity already exists: ${noticeId}`);
          }
        }
      } else {
        console.log(`No opportunities found for NAICS: ${naicsCode}`);
      }
    } catch (error) {
      console.error(
        `Error fetching opportunities for NAICS: ${naicsCode}`,
        error.message
      );
    }
  }

  console.log("Finished fetching opportunities from SAM.gov.");
}

export async function fetchDescription(descriptionUrl) {
  const queryString = `${descriptionUrl}&api_key=${config.SAM_API_KEY}`;
  try {
    console.log(`Fetching description from: ${queryString}`);
    const response = await fetch(queryString);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch description. Status: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`Successfully fetched description for URL: ${queryString}`);
    return data;
  } catch (error) {
    console.error(
      `Error fetching description from ${queryString}:`,
      error.message
    );
    throw error;
  }
}

// Utility function to get the date in MM/DD/YYYY format
function getDate(subtractDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() - subtractDays);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}/${day}/${year}`;
}
