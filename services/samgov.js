import {
  config,
  naicsCodes,
  pCodes,
  setAsideValues,
  samApiUrl,
} from "../config.js";
import { alreadyExistsInFileStorage, saveToFileStorage } from "./storage.js";
import fetch from "node-fetch";
import { logError, logAction } from "../utils/logger.js";

// Ping SAM.gov API to check if it's operational
export async function pingSamGov() {
  const queryString = `${samApiUrl}?api_key=${
    config.SAM_API_KEY
  }&postedFrom=${getDate(30)}&postedTo=${getDate()}&limit=1`;

  try {
    logAction(`Pinging SAM.gov with query: ${queryString}`);
    const response = await fetch(queryString);

    if (response.status === 200) {
      logAction("SAM.gov ping successful.");
      return true;
    } else {
      logError(`SAM.gov ping failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Error pinging SAM.gov: ${error.message}`);
    return false;
  }
}

// Fetch opportunities from SAM.gov and save them to storage
export async function fetchAndSaveOpportunities() {
  logAction("Starting to fetch opportunities from SAM.gov...");

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
      logAction(`Fetching opportunities for NAICS: ${naicsCode}`);
      const response = await fetch(queryString);
      const data = await response.json();

      if (data.opportunitiesData && Array.isArray(data.opportunitiesData)) {
        for (const opportunity of data.opportunitiesData) {
          const noticeId = opportunity.noticeId;
          const title = opportunity.title;
          const federalOrg = opportunity.fullParentPathName;
          const datePosted = opportunity.postedDate;
          const dueDate = opportunity.responseDeadLine;
          const setAside = opportunity.typeOfSetAsideDescription;
          const naicsCodes = opportunity.naicsCodes;
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
            logAction(`Saved new opportunity: ${noticeId}`);
          } else {
            logAction(`Opportunity already exists: ${noticeId}`);
          }
        }
      } else {
        logAction(`No opportunities found for NAICS: ${naicsCode}`);
      }
    } catch (error) {
      logError(
        `Error fetching opportunities for NAICS: ${naicsCode}: ${error.message}`
      );
    }
  }

  logAction("Finished fetching opportunities from SAM.gov.");
}

// Fetch the description document for a specific opportunity
export async function fetchDescription(descriptionUrl) {
  const queryString = `${descriptionUrl}&api_key=${config.SAM_API_KEY}`;
  try {
    logAction(`Fetching description from: ${queryString}`);
    const response = await fetch(queryString);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch description. Status: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    logAction(`Successfully fetched description for URL: ${queryString}`);
    return data;
  } catch (error) {
    logError(
      `Error fetching description from ${queryString}: ${error.message}`
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
