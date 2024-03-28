import { ExcelModel } from "../models/ExcelModel";

class MainController {
  static uploadProfessorsFile(data: ArrayBuffer) {
    ExcelModel.readProfessorsFromSheet(data);
    return true;
  }

  static async getProfessors() {
    const profes = await window.database.ProfessorDatabase.getProfessors();
    console.log(profes);
  }
}

export default MainController;
