import * as XLSX from "xlsx";
import { ProfessorModel } from "../models/ProfessorModel";

export class ExcelModel {
  public static async readProfessorsFromSheet(
    data: ArrayBuffer,
  ): Promise<void> {
    const workbook = XLSX.read(data);

    const worksheet = workbook.Sheets[workbook.SheetNames[7]];

    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    const result = this.jsonToProfessorList(jsonData);
    this.professorListToDB(result);
  }

  public static jsonToProfessorList(jsonData: any): ProfessorModel[] {
    let professorList: ProfessorModel[] = [];
    let tipo: string;
    jsonData.forEach((prof: any) => {
      if (prof["__EMPTY"]) {
        tipo = prof.__EMPTY;
      }
      let newProfessor = new ProfessorModel(prof["nombre del profesor"], tipo);
      professorList.push(newProfessor);
    });
    return professorList;
  }

  public static async professorListToDB(list: ProfessorModel[]) {
    await window.database.ProfessorDatabase.insertProfessors(list);
  }
}
