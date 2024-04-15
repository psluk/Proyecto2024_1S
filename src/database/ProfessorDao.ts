import database from "./DatabaseProvider";
import Professor from "../models/Professor";

interface ProfessorRow {
  id: number;
  name: string;
  email: string;
  type: string;
}

export default class ProfessorDao {
  /**
   * Adds a professor to the database.
   * Throws an error if the professor could not be added.
   * @param professor The professor to be added.
   * @returns The professor that was added.
   */
  addProfessor(professor: Professor): Professor {
    const query = `
    INSERT INTO Professors (name, email, professorTypeId)
    VALUES (?, ?, (SELECT professorTypeId FROM ProfessorTypes WHERE typeName = ?));`;
    const result = database
      .prepare(query)
      .run(
        professor.getName(),
        professor.getEmail(),
        professor.getType(),
      );
    if (result.changes === 0) {
      throw new Error(`Failed to add professor: ${professor.getName()}`);
    }

    const id = result.lastInsertRowid;
    return this.getProfessorById(id as number);
  }

  /**
   * Adds multiple professors into the database.
   * Continues adding professors even if one fails, collecting errors for each failed insertion.
   * @param list Array of Professor objects to be added.
   * @param shouldClearList Whether to clear the list of professors before adding new ones.
   * @returns An object containing two arrays: one for the professors added successfully, and another for errors.
   */
  addProfessors(list: Professor[], shouldClearList: boolean = false): {
    successfulInserts: Professor[];
    errors: Professor[];
  } {
    const successfulInserts: Professor[] = [];
    const errors: Professor[] = [];

    const clearQuery = database.prepare(`DELETE FROM Professors;`);

    const insertQuery = database.prepare(`
      INSERT INTO Professors (name, professorTypeId)
      VALUES (?, (SELECT professorTypeId FROM ProfessorTypes WHERE typeName = ?));
    `);

    database.transaction(() => {
      if (shouldClearList) {
        clearQuery.run();
      }

      list.forEach((professor) => {
        try {
          const result = insertQuery.run(
            professor.getName(),
            professor.getType(),
          );
          if (result.changes === 0) {
            throw new Error(
              `Failed to insert professor: ${professor.getName()}`,
              { cause: professor },
            );
          }
          successfulInserts.push(professor);
        } catch (error) {
          console.error(error);
          errors.push(professor);
        }
      });
    })();

    return { successfulInserts, errors };
  }

  /**
   * Gets a professor from the database.
   * @param id The id of the professor to get.
   * @returns The professor with the given id.
   */
  getProfessorById(id: number): Professor {
    const query = `
    SELECT name, professorId AS 'id', email, typeName as type
    FROM Professors JOIN ProfessorTypes USING(professorTypeId) WHERE professorId = ?`;
    const readQuery = database.prepare(query);
    const row = readQuery.get(id) as ProfessorRow;
    if (!row) {
      throw new Error(`No professor found with ID ${id}`);
    }
    return new Professor(row.id, row.type, row.name, row.email);
  }

  /**
   * Gets a list of all professors in the database.
   * @returns A list of all professors in the database.
   */
  getProfessors(): Professor[] {
    const query = `
    SELECT professorId AS 'id', name, email, typeName as type
    FROM Professors JOIN ProfessorTypes USING(professorTypeId)`;
    const readQuery = database.prepare(query);
    const rowList = readQuery.all() as ProfessorRow[];
    return rowList.map((row) => new Professor(row.id, row.type, row.name, row.email));
  }

  /**
   * Updates a professor in the database.
   * Throws an error if the professor could not be updated.
   * @param professor The professor to update.
   * @returns The updated professor.
   */
  updateProfessor(professor: Professor): Professor {
    const query = `
    UPDATE Professors
    SET name = ?, email = ?, professorTypeId = (SELECT professorTypeId FROM ProfessorTypes WHERE typeName = ?)
    WHERE professorId = ?;`;
    const result = database
      .prepare(query)
      .run(
        professor.getName(),
        professor.getEmail(),
        professor.getType(),
        professor.getId(),
      );
    if (result.changes === 0) {
      throw new Error(`Failed to update professor: ${professor.getName()}`);
    }
    
    return this.getProfessorById(professor.getId() as number);
  }

  /**
   * Deletes a professor from the database.
   * Throws an error if the professor could not be deleted.
   */
  deleteProfessor(id: number): void {
    const query = `DELETE FROM Professors WHERE professorId = ?;`;
    const result = database.prepare(query).run(id);
    if (result.changes === 0) {
      throw new Error(`No professor found with ID ${id} to delete.`);
    }
  }
}
