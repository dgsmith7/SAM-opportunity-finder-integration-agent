//import { fetchOpportunities } from "./services/samgov.js";
//import { generateSummary } from "./services/summarizer.js";
//import { sendNotification } from "./services/emailer.js";
//import { updateGoogleDoc } from "./services/gdocs.js";
//import { log } from "./utils/logger.js";
//import { alreadyExists, saveOpportunity } from "./db/opportunity.js";
import { fetchAndSaveOpportunities } from "./services/samgov.js";
import { go } from "./services/summarizer.js";
import { dumpStorageToGoogleSheet } from "./services/gdocs.js";

export async function runSofiaJob() {
  // try {
  //   const opportunities = await fetchOpportunities();
  //   for (const opp of opportunities) {
  //     if (!(await alreadyExists(opp.solicitationId))) {
  //       const summary = await generateSummary(opp);
  //       await saveOpportunity({
  //         solicitationId: opp.solicitationId,
  //         opportunity: opp,
  //         summary,
  //       });
  //       await sendNotification(opp, summary);
  //       await updateGoogleDoc(opp, summary);
  //     }
  //   }
  //   log(`Processed ${opportunities.length} opportunities.`);
  // } catch (err) {
  //   log("Error in SOFIA job:", err);
  // }
}

export async function runTestJob() {
  try {
    const testOpportunity = {
      opportunity: {
        title: "Test Opportunity",
        description: "This is a test opportunity.",
        solnum: "98wer7g98w7eg",
      },
    };
    // const summary = await generateSummary(testOpportunity);
    const summary = "This is a test summary for the test opportunity.";
    const proposal = "One day this will be an AI genreated proposal";
    await saveOpportunity({
      opportunity: testOpportunity,
      dateFetched: new Date(),
      summary: summary,
      proposal: proposal,
      interested: "maybe",
    });
    // await sendNotification(testOpportunity, summary);
    // await updateGoogleDoc(testOpportunity, summary);
    console.log("Test job completed successfully.");
  } catch (err) {
    console.log("Error in test job:", err);
  }
}

export async function runTestJob2() {
  try {
    console.log("Starting test job 2: Fetching and saving opportunities...");
    //await fetchAndSaveOpportunities();
    //await go();
    await dumpStorageToGoogleSheet();

    console.log("Test job 2 completed successfully.");
  } catch (err) {
    console.log("Error in test job 2:", err);
  }
}

/*
import {
  saveToFileStorage,
  alreadyExistsInFileStorage,
  readFileStorage,
  deleteFromFileStorage,
} from "./services/fileStorage.js";

(async () => {
  const solicitationId = "12345";
  const dateFetched = new Date().toISOString();

  // Save a new record
  await saveToFileStorage(solicitationId, dateFetched);

  // Check if the record exists
  const exists = await alreadyExistsInFileStorage(solicitationId);
  console.log(`Record exists: ${exists}`);

  // Read all records
  const records = await readFileStorage();
  console.log("All records:", records);

  // Delete the record
  await deleteFromFileStorage(solicitationId);
})();
*/
