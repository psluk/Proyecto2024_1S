import StudentDao from "../database/StudentDao";
import Student from "../models/Student";

export default class StudentController {
  private studentDao: StudentDao;

  constructor() {
    this.studentDao = new StudentDao();
  }

  /**
   * Adds a student to the database.
   * Throws an error if the student could not be added.
   * @param name The name of the student.
   * @param phoneNumber The phone number of the student.
   * @param email The email of the student.
   * @param universityId The ID of the university the student belongs to.
   * @param isEnabled Whether the student is enabled or not.
   * @returns The student that was added.
   */
  public addStudent(
    name: string,
    phoneNumber: string,
    email: string,
    universityId: string,
    isEnabled: boolean,
  ): Student {
    const student = new Student(
      null,
      name,
      phoneNumber,
      email,
      universityId,
      isEnabled,
    );
    return this.studentDao.addStudent(student);
  }

  /**
   * Gets a student from the database.
   * @param id The id of the student to get.
   * @returns The student with the given id.
   */
  public getStudentById(id: number): Student | null {
    return this.studentDao.getStudentById(id);
  }

  /**
   * Gets all students from the database.
   * @returns An array of all students.
   */
  public getStudents(): Student[] {
    return this.studentDao.getStudents();
  }

  /**
   * Updates a student in the database.
   * Throws an error if the student could not be added.
   * @param id The ID of the student to update.
   * @param name The name of the student.
   * @param phoneNumber The phone number of the student.
   * @param email The email of the student.
   * @param universityId The ID of the university the student belongs to.
   * @param isEnabled Whether the student is enabled or not.
   * @returns The student that was updated.
   */
  public updateStudent(
    id: number,
    name: string,
    phoneNumber: string,
    email: string,
    universityId: string,
    isEnabled: boolean,
  ): Student {
    const student = new Student(
      id,
      name,
      phoneNumber,
      email,
      universityId,
      isEnabled,
    );
    return this.studentDao.updateStudent(student);
  }

  /**
   * Deletes a student from the database.
   * @param id The id of the student to delete.
   */
  public deleteStudent(id: number): void {
    this.studentDao.deleteStudent(id);
  }
}
