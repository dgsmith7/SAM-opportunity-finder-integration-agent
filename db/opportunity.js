import { getDb } from "./client.js";

const COLLECTION_NAME = "opportunities";

// Save a new opportunity
export async function saveOpportunity(opp) {
  const db = await getDb();
  return db.collection(COLLECTION_NAME).insertOne({
    solicitationId: opp.solicitationId,
    opportunity: opp.opportunity,
    dateFetched: new Date(),
    summary: opp.summary || null,
    proposal: opp.proposal || null,
    interested: opp.interested || "maybe",
  });
}

// Get an opportunity by solicitation ID
export async function getOpportunityById(solicitationId) {
  const db = await getDb();
  return db.collection(COLLECTION_NAME).findOne({ solicitationId });
}

// Get all opportunities
export async function getAllOpportunities() {
  const db = await getDb();
  return db.collection(COLLECTION_NAME).find().toArray();
}

// Update an opportunity by ID
export async function updateOpportunity(id, updates) {
  const db = await getDb();
  return db
    .collection(COLLECTION_NAME)
    .updateOne({ _id: id }, { $set: updates });
}

// Delete an opportunity by ID
export async function deleteOpportunity(id) {
  const db = await getDb();
  return db.collection(COLLECTION_NAME).deleteOne({ _id: id });
}

// Check if an opportunity already exists by solicitation ID
export async function alreadyExists(solicitationId) {
  return !!(await getOpportunityById(solicitationId));
}
