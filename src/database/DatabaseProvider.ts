import Database, { Database as BetterSqlite3Database } from "better-sqlite3";
import { join } from "path";

const databasePath =
  process.env.NODE_ENV === "development"
    ? "./database/gadt-database.db"
    : join(process.resourcesPath, "./gadt-database.db");

const database: BetterSqlite3Database = new Database(databasePath);
database.pragma("journal_mode = WAL");

export default database;
