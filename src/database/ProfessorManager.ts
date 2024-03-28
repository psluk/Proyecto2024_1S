import { db } from "./DBManager";
import { ProfessorModel } from "src/models/ProfessorModel";

const insertProfessors = (list: ProfessorModel[]) => {
  try {
    list.forEach((professor) => {
      const insertQuery = `
      INSERT INTO Professors (name, professorTypeId) VALUES (?, (SELECT professorTypeId FROM ProfessorTypes WHERE typeName = ?));
    `;
      const result = db
        .prepare(insertQuery)
        .run(professor.name, professor.professorType);
      console.log(result);
    });
  } catch (err) {
    console.error(err);
  }
};

const getProfessors = () => {
  try {
    const query = `SELECT * FROM Professors;`;
    const readQuery = db.prepare(query);
    const rowList = readQuery.all();
    return rowList;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default {
  insertProfessors,
  getProfessors,
};
