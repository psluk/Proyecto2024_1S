import database from "./DatabaseProvider";
import Student from "../models/Student";

interface StudentRow {
  id: number;
  name: string;
  phoneNumber: string;
  email: string;
  universityId: string;
  isEnabled: boolean;
}

export default class StudentDao {
  /**
   *
   * @param tableName table to be cleaned on database, record are deleted and primary key sequence is reset
   */
  cleanTable(tableName: string): void {
    try {
      database.transaction(() => {
        database.prepare(`DELETE FROM ${tableName};`).run();

        database
          .prepare(`DELETE FROM sqlite_sequence WHERE name=?;`)
          .run(tableName);
      })();
    } catch (error) {
      console.error(`Failed to clean the table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Adds a student to the database.
   * Throws an error if the student could not be added.
   * @param student The student to be added.
   * @returns The student that was added.
   */
  addStudent(student: Student): Student {
    const isEnabledValue: number = student.getIsEnabled() ? 1 : 0;
    const query = `
    INSERT INTO Students (name, phoneNumber, email, universityId, isEnabled)
    VALUES (?, ?, ?, ?, ?);`;
    const result = database
      .prepare(query)
      .run(
        student.getName(),
        student.getPhoneNum(),
        student.getEmail(),
        student.getUniversityId(),
        isEnabledValue,
      );
    if (result.changes === 0) {
      throw new Error(`Failed to add student: ${student.getName()}`);
    }

    const id = result.lastInsertRowid;
    return this.getStudentById(id as number);
  }

  /**
   * Adds multiple students into the database.
   * Continues adding students even if one fails, collecting errors for each failed insertion.
   * @param list Array of Students objects to be added.
   * @param shouldClearList Whether to clear the list of students before adding new ones.
   * @returns An object containing two arrays: one for the students added successfully, and another for errors.
   */
  addStudents(
    list: Student[],
    shouldClearList: boolean = false,
  ): {
    successfulInserts: Student[];
    errors: Student[];
  } {
    const successfulInserts: Student[] = [];
    const errors: Student[] = [];

    const clearActivity = `UPDATE Activities SET students = 0, load = 0 WHERE suggestedStudents IS NOT NULL`;
    const insertQuery = database.prepare(`
    INSERT INTO Students (name, phoneNumber, email, universityId, isEnabled) VALUES (?, ?, ?, ?, ?);`);

    database.transaction(() => {
      if (shouldClearList) {
        this.cleanTable("GroupStudents");
        this.cleanTable("StudentProfessors");
        this.cleanTable("Students");
      }

      database.prepare(clearActivity).run();

      list.forEach((student) => {
        try {
          const result = insertQuery.run(
            student.getName(),
            student.getPhoneNum(),
            student.getEmail(),
            student.getUniversityId(),
            student.getIsEnabled() ? 1 : 0,
          );
          if (result.changes === 0) {
            throw new Error(`Failed to insert student: ${student.getName()}`, {
              cause: student,
            });
          }
          successfulInserts.push(student);
        } catch (error) {
          console.error(error);
          errors.push(student);
        }
      });
    })();

    return { successfulInserts, errors };
  }

  /**
   * Gets a student from the database.
   * @param id The id of the student to get.
   * @returns The student with the given id.
   */
  getStudentById(id: number): Student {
    const query = `
    SELECT studentId AS 'id', name, phoneNumber, email, universityId, isEnabled
    FROM Students WHERE studentId = ?;`;
    const readQuery = database.prepare(query);
    const row = readQuery.get(id) as StudentRow;
    if (!row) {
      throw new Error(`No student found with ID ${id}`);
    }
    return new Student(
      row.id,
      row.name,
      row.phoneNumber,
      row.email,
      row.universityId,
      row.isEnabled,
    );
  }

  /**
   * Gets a list of all students in the database.
   * @returns A list of all students in the database.
   */
  getStudents(): Student[] {
    const query = `
    SELECT studentId AS 'id', name, phoneNumber, email, universityId, isEnabled FROM Students;`;
    const readQuery = database.prepare(query);
    const rowList = readQuery.all() as StudentRow[];
    return rowList.map(
      (row) =>
        new Student(
          row.id,
          row.name,
          row.phoneNumber,
          row.email,
          row.universityId,
          row.isEnabled,
        ),
    );
  }

  /**
   * Updates a student in the database.
   * Throws an error if the student could not be updated.
   * @param student The student to update.
   * @returns The updated student.
   */
  updateStudent(student: Student): Student {
    const isEnabledValue: number = student.getIsEnabled() ? 1 : 0;
    const query = `
    UPDATE Students
    SET name = ?, phoneNumber = ?, email = ?, universityId = ?, isEnabled = ?
    WHERE studentId = ?;`;
    const result = database
      .prepare(query)
      .run(
        student.getName(),
        student.getPhoneNum(),
        student.getEmail(),
        student.getUniversityId(),
        isEnabledValue,
        student.getId(),
      );
    if (result.changes === 0) {
      throw new Error(`Failed to update student: ${student.getName()}`);
    }

    return this.getStudentById(student.getId() as number);
  }

  /**
   * Deletes a student from the database.
   * Throws an error if the student could not be deleted.
   */
  deleteStudent(id: number): void {
    const query = `DELETE FROM Students WHERE studentId = ?;`;
    const result = database.prepare(query).run(id);
    if (result.changes === 0) {
      throw new Error(`No student found with ID ${id} to delete.`);
    }
  }
}
