import ProfessorDao from "../database/ProfessorDao";
import ExcelDao from "../database/ExcelDao";
import Professor from "../models/Professor";

export default class ProfessorController {
  private professorDao: ProfessorDao;
  private excelDao: ExcelDao;

  constructor() {
    this.professorDao = new ProfessorDao();
    this.excelDao = new ExcelDao();
  }

  /**
   * Adds a professor to the database.
   * Throws an error if the professor could not be added.
   * @param type The type of the professor.
   * @param name The name of the professor.
   * @param email The email of the professor.
   * @returns The professor that was added.
   */
  public addProfessor(
    type: string,
    name: string,
    email?: string | null,
  ): Professor {
    const professor = new Professor(null, type, name, email || null);
    return this.professorDao.addProfessor(professor);
  }

  /**
   * Imports a list of professors from an Excel file.
   * @param fileBuffer The Excel file's array buffer.
   * @returns An object containing two arrays: one for the professors added successfully, and another for errors.
   */
  public importProfessors(fileBuffer: ArrayBuffer): {
    successfulInserts: Professor[];
    errors: Professor[];
  } {
    const professors = this.excelDao.getProfessors(fileBuffer);
    return this.professorDao.addProfessors(professors, true);
  }

  /**
   * Gets a professor from the database.
   * @param id The id of the professor to get.
   * @returns The professor with the given id.
   */
  public getProfessorById(id: number): Professor | null {
    return this.professorDao.getProfessorById(id);
  }

  /**
   * Gets all professors from the database.
   * @returns An array of all professors.
   */
  public getProfessors(): Professor[] {
    return this.professorDao.getProfessors();
  }

  /**
   * Updates a professor in the database.
   * Throws an error if the professor could not be added.
   * @param id The ID of the professor to update.
   * @param type The type of the professor.
   * @param name The name of the professor.
   * @param email The email of the professor.
   * @returns The professor that was updated.
   */
  public updateProfessor(
    id: number,
    type: string,
    name: string,
    email?: string | null,
  ): Professor {
    const professor = new Professor(id, type, name, email || null);
    return this.professorDao.updateProfessor(professor);
  }

  /**
   * Deletes a professor from the database.
   * @param id The id of the professor to delete.
   */
  public deleteProfessor(id: number): void {
    this.professorDao.deleteProfessor(id);
  }
}
