import Database, { Database as BetterSqlite3Database } from "better-sqlite3";
import { join } from "path";
import { existsSync, readFileSync } from "node:fs";

const GENERATION_SCRIPT = "gadt-database.sql";
const DATABASE_NAME = "gadt-database.db";

const databaseFolder =
  process.env.NODE_ENV === "development"
    ? "./database/"
    : join(process.resourcesPath);

const databasePath = join(databaseFolder, DATABASE_NAME);

// If the database doesn't exist, create it from the script
const databaseExists = existsSync(databasePath);

const database: BetterSqlite3Database = new Database(databasePath);
database.pragma("journal_mode = WAL");

if (!databaseExists) {
  const generationScript = readFileSync(
    join(databaseFolder, GENERATION_SCRIPT),
    "utf-8",
  );
  try {
    database.exec(generationScript);
  } catch (error) {
    console.error("Could not generate production database:\n", error);
  }
}

export default database;
