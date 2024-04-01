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
    const query = `SELECT Name, professorId, email, typeName as professorType FROM Professors JOIN ProfessorTypes USING(professorTypeId)`;
    const readQuery = db.prepare(query);
    const rowList = readQuery.all();
    return rowList;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const deleteProfessor = (professorId) => {
  try {
    // Optional: Add logic here to handle related records in other tables
    // e.g., delete or update records in ProfessorActivities, GroupProfessors, etc.

    const deleteQuery = `DELETE FROM Professors WHERE professorId = ?;`;
    const result = db.prepare(deleteQuery).run(professorId);
    console.log(`Deleted professor with ID: ${professorId}`, result);
  } catch (err) {
    console.error(err);
    throw err; 
  }
};

export default {
  insertProfessors,
  getProfessors,
  deleteProfessor,
};
