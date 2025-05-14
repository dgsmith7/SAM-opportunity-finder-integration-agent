import { fetchDescription } from "./samgov.js";
import { readFileStorage, saveToFileStorage } from "./storage.js";
import fetch from "node-fetch";
import { logError, logAction } from "../utils/logger.js";

const BATCH_SIZE = 2; // Number of records to process per batch
const BATCH_DELAY = 60001; // Delay between batches in milliseconds (60 seconds)

// Function to ping OpenAI API to check if it's operational
export async function pingAI() {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      logError(`OpenAI ping failed with status: ${response.status}`);
      return false;
    }
    logAction("OpenAI ping successful.");
    return true;
  } catch (error) {
    logError(`OpenAI ping failed: ${error.message}`);
    return false;
  }
}

// Function to generate summaries for records in storage.json
export async function generateSummariesForStorage() {
  try {
    // Read data from storage.json
    const storageData = await readFileStorage();
    logAction(`Total records in storage: ${storageData.length}`);

    // Filter records with a status of "new"
    const recordsToProcess = storageData.filter(
      (record) => record.noticeStatus === "new"
    );
    logAction(`Records to process: ${recordsToProcess.length}`);

    // Process records in batches
    for (let i = 0; i < recordsToProcess.length; i += BATCH_SIZE) {
      const batch = recordsToProcess.slice(i, i + BATCH_SIZE);
      logAction(
        `Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(
          recordsToProcess.length / BATCH_SIZE
        )} with ${batch.length} records...`
      );

      // Process each record in the batch
      for (const record of batch) {
        try {
          logAction(`Processing record with Notice ID: ${record.noticeId}`);

          // Fetch the description document from SAM.gov
          const descriptionData = await fetchDescription(record.descriptionUrl);

          // Prepare the prompt for OpenAI
          const prompt = `
            Based on the following description and details, summarize the work required in a paragraph.
            Before the paragraph, include a one-line description with the big picture and location.
            In the summary paragraph, include the number of people required, the period of performance, and the value if available. 
            If not available, state that. Also include the location of work (remote, on-site, hybrid, or not specified).
            Be sure to include topics such as Logistics, Data Analysis, Engineering Management, Consulting, System Engineering, or similar topics.
            The output should be in Markdown format with the following structure:
            **One-line Description:** [One-line description]
            **Summary:** [Summary paragraph]

            Description: ${
              descriptionData.description || "No description provided."
            }
            Details:
            - Notice ID: ${record.noticeId}
            - Date Posted: ${record.datePosted}
            - Federal Organization: ${record.federalOrg}
            - Set Aside: ${record.setAside}
            - NAICS Codes: ${record.naicsCodes?.join(", ") || "Not specified"}
            - Location: ${record.locationCity}, ${record.locationState}
          `;

          // Call OpenAI API to generate the summary
          const summary = await generateSummaryWithOpenAI(prompt);

          // Update the record with the generated summary
          record.summaryText = summary;
          logAction(`Generated summary for Notice ID: ${record.noticeId}`);

          // Save the updated record back to storage.json immediately
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
            "summarized"
          );

          logAction(
            `Summary generated and saved for Notice ID: ${record.noticeId}`
          );
        } catch (error) {
          logError(
            `Error processing record with Notice ID: ${record.noticeId}: ${error.message}`
          );
        }
      }

      // Delay between batches to respect rate limits
      if (i + BATCH_SIZE < recordsToProcess.length) {
        logAction(
          `Batch ${i / BATCH_SIZE + 1} completed. Waiting ${
            BATCH_DELAY / 1000
          } seconds before next batch...`
        );
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
      }
    }

    logAction("All summaries have been processed.");
  } catch (error) {
    logError(`Error generating summaries: ${error.message}`);
  }
}

// Helper function to call OpenAI API
async function generateSummaryWithOpenAI(prompt) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo", // Use the GPT-4 model
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes government opportunities.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error?.message || "Failed to generate summary with OpenAI."
      );
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    logError(`Error calling OpenAI API: ${error.message}`);
    throw error;
  }
}
