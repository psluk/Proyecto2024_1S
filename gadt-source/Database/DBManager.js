const Database = require("better-sqlite3")
const path = require("path")

const dbPath =
    process.env.NODE_ENV === "development"
        ? "./Database/gadt-database.db"
        : path.join(process.resourcesPath, "./gadt-database.db")

const db = new Database(dbPath)
db.pragma("journal_mode = WAL")

exports.db = db
