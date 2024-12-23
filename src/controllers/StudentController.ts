import StudentDao from "../database/StudentDao";
import ExcelDao from "../database/ExcelDao";
import Student from "../models/Student";

export default class StudentController {
  private studentDao: StudentDao;
  private excelDao: ExcelDao;

  constructor() {
    this.studentDao = new StudentDao();
    this.excelDao = new ExcelDao();
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

  /**
   * Imports a list of students from an Excel file.
   * @param fileBuffer The Excel file's array buffer.
   * @param fileName The file name it has when uploaded
   * @returns An object containing two arrays: one for the students added successfully, and another for errors.
   */
  public importStudents(
    fileName: string,
    fileBuffer: ArrayBuffer,
  ): {
    successfulInserts: Student[];
    errors: Student[];
  } {
    this.excelDao.saveFile(fileName, fileBuffer, "studentsFile");
    const students = this.excelDao.getStudents(fileBuffer);
    return this.studentDao.addStudents(students, true);
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

  public getAmountOfActiveStudents(): { label: string; value: number }[] {
    return this.studentDao.getAmountOfActiveStudents();
  }
}
