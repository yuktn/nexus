import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("No MONGODB_URI");
}

const client = new MongoClient(uri);

export async function connectMongo() {
  await client.connect();

  const db = client.db();

  console.log("Connected to MongoDB");

  return db;
}

export { client };