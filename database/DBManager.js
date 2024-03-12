import Database from "better-sqlite3";
import { join } from "path";

const dbPath =
  process.env.NODE_ENV === "development"
    ? "./database/gadt-database.db"
    : join(process.resourcesPath, "./gadt-database.db");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const _db = db;
export { _db };
