import { ProfessorModel } from "../models/ProfessorModel";
import { ExcelModel } from "../models/ExcelModel";

class MainController {
  static uploadProfessorsFile(data: ArrayBuffer) {
    ExcelModel.readProfessorsFromSheet(data);
    return true;
  }

  static async getProfessors(): Promise<ProfessorModel[]> {
    const profes = await window.database.ProfessorDatabase.getProfessors();
    const professors: ProfessorModel[] = profes.map((professor) => {
      return new ProfessorModel(professor.name, professor.professorType, professor.email, professor.professorId);
    });

    return professors;
  }

  static async deleteProfessor(professorId: number) {
    return await window.database.ProfessorDatabase.deleteProfessor(professorId);
  }
}

export default MainController;
