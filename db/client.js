import { MongoClient } from "mongodb";
import { config } from "../config.js";

let sofia;

export async function getDb() {
  if (sofia) return sofia;

  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  sofia = client.db();
  return sofia;
}
export async function closeDb() {
  if (sofia) {
    await sofia.client.close();
    sofia = null;
  }
}
