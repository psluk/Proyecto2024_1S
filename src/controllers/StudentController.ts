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
   * @param phone The phone of the student.
   * @param email The email of the student.
   * @param carnet The identification of the student.
   * @param enabled The enabled value of the student.
   * @returns The student that was added.
   */
  public addStudent(
    name: string,
    phone: string,
    email: string,
    carnet: string,
    enabled: boolean,
  ): Student {
    const student = new Student(null, name, phone, email, carnet, enabled);
    return this.studentDao.addStudent(student);
  }

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
   * @param phoneNumber The phone of the student.
   * @param email The email of the student.
   * @param universityId The identification of the student.
   * @param isEnabled The enabled value of the student.
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
