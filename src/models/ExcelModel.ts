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
      tipo = this.mapType(tipo);
      let newProfessor = new ProfessorModel(prof["nombre del profesor"], tipo);
      professorList.push(newProfessor);
    });
    return professorList;
  }

   private static async professorListToDB(list: ProfessorModel[]) {
    await window.database.ProfessorDatabase.insertProfessors(list);
  }

  private static mapType(type: string): string {
    const typeMapping: { [key: string]: string } = {
      "profesores de planta": "Permanent",
      "profesores iterinos": "Temporary",
    };

    return typeMapping[type.toLowerCase()] || type;
  }
}
