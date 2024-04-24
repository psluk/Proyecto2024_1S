import database from "./DatabaseProvider";
import Student from "../models/Student";

interface StudentRow {
  studentId: number;
  name: string;
  phoneNumber: string;
  email: string;
  universityId: string;
  isEnabled: number;
}

export default class StudentDao {
  /**
   * Adds a student to the database.
   * Throws an error if the student could not be added.
   * @param student The student to be added.
   * @returns The student that was added.
   */
  addStudent(student: Student): Student {
    const query = `
      INSERT INTO Students (name, phoneNumber, email, universityId, isEnabled)
      VALUES (?, ?, ?, ?, ?);
    `;
    const result = database.prepare(query).run(
      student.getName(),
      student.getPhoneNum(),
      student.getEmail(),
      student.getUniversityId(),
      student.getIsEnabled() ? 1 : 0, // Convert boolean to integer
    );
    if (result.changes === 0) {
      throw new Error(`Failed to add student: ${student.getName()}`);
    }

    const id = result.lastInsertRowid;
    return this.getStudentById(id as number);
  }

  /**
   * Gets a student from the database.
   * @param id The id of the student to get.
   * @returns The student with the given id.
   */
  getStudentById(id: number): Student {
    const query = `
      SELECT *
      FROM Students
      WHERE studentId = ?;
    `;
    const readQuery = database.prepare(query);
    const row = readQuery.get(id) as StudentRow;
    if (!row) {
      throw new Error(`No student found with ID ${id}`);
    }
    return new Student(
      row.studentId, // Make sure to pass the student ID as well
      row.name,
      row.phoneNumber,
      row.email,
      row.universityId,
      Boolean(row.isEnabled), // Convert integer to boolean
    );
  }

  /**
   * Gets a list of all students in the database.
   * @returns A list of all students in the database.
   */
  getStudents(): Student[] {
    const query = `
      SELECT *
      FROM Students;
    `;
    const readQuery = database.prepare(query);
    const rowList = readQuery.all() as StudentRow[];
    return rowList.map(
      (row) =>
        new Student(
          row.studentId, // Make sure to pass the student ID as well
          row.name,
          row.phoneNumber,
          row.email,
          row.universityId,
          Boolean(row.isEnabled), // Convert integer to boolean
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
    const query = `
      UPDATE Students
      SET name = ?, phoneNumber = ?, email = ?, universityId = ?, isEnabled = ?
      WHERE studentId = ?;
    `;
    const result = database.prepare(query).run(
      student.getName(),
      student.getPhoneNum(),
      student.getEmail(),
      student.getUniversityId(),
      student.getIsEnabled() ? 1 : 0, // Convert boolean to integer
      student.getId(),
    );
    if (result.changes === 0) {
      throw new Error(`Failed to update student: ${student.getName()}`);
    }

    return this.getStudentById(student.getId());
  }

  /**
   * Deletes a student from the database.
   * Throws an error if the student could not be deleted.
   */
  deleteStudent(id: number): void {
    const query = `
      DELETE FROM Students
      WHERE studentId = ?;
    `;
    const result = database.prepare(query).run(id);
    if (result.changes === 0) {
      throw new Error(`No student found with ID ${id} to delete.`);
    }
  }
}
