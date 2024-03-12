import { _db } from "./DBManager";

const getUsuarios = () => {
  try {
    const query = `SELECT * FROM Usuario`;
    const readQuery = _db.prepare(query);
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
