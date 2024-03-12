import { db as _db } from "./DBManager";
const db = _db;

const getUsuarios = () => {
  try {
    const query = `SELECT * FROM Usuario`;
    const readQuery = db.prepare(query);
    const rowList = readQuery.all();
    return rowList;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default {
  getUsuarios,
};
