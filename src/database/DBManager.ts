import Database, { Database as BetterSqlite3Database } from "better-sqlite3";
import { join } from "path";

const dbPath =
  process.env.NODE_ENV === "development"
    ? "./database/gadt-database.db"
    : join(process.resourcesPath, "./gadt-database.db");

const db: BetterSqlite3Database = new Database(dbPath);
db.pragma("journal_mode = WAL");

export { db };
