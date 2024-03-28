import * as XLSX from "xlsx";
import { ProfessorModel } from "./ProfessorModel";
//import ProfessorDatabase from "../database/ProfessorManager";


export class ExcelModel {
  library: string = "xlsx";

  public static readProfessorsFromSheet(data: ArrayBuffer): void {
    const workbook = XLSX.read(data);

    const worksheet = workbook.Sheets[workbook.SheetNames[7]];

    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    const result = this.jsonToProfessorList(jsonData);
    //ProfessorDatabase.loadProfessors(result);

  }

  public static jsonToProfessorList(jsonData:any): ProfessorModel[] {
    let professorList: ProfessorModel[] = [];
    let tipo:string;
    jsonData.forEach((prof:any) => {
      if (prof["__EMPTY"]) {
        tipo = prof.__EMPTY;
      }
      let newProfessor = new ProfessorModel(prof["nombre del profesor"], tipo);
      professorList.push(newProfessor);
    });
    console.log(professorList);
    return professorList;

  }
}
