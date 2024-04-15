import * as XLSX from "xlsx";
import Professor from "../models/Professor";
import { toNormalCase } from "../utils/NameFormatter";

export default class ExcelDao {
  /**
   * Gets a list of professors from an Excel file.
   * @param fileBuffer The Excel file's array buffer.
   * @returns A list of professors.
   */
  getProfessors(fileBuffer: ArrayBuffer): Professor[] {
    const mapType = (type: string): string => {
      const typeMapping: { [key: string]: string } = {
        "profesores de planta": "Permanent",
        "profesores iterinos": "Temporary",
      };
      return typeMapping[type.toLowerCase()] || type;
    };

    const jsonToProfessorList = (jsonData: any): Professor[] => {
      let professorList: Professor[] = [];
      let type: string;
      jsonData.forEach((professor: any) => {
        if (professor["__EMPTY"]) {
          type = professor.__EMPTY;
        }
        type = mapType(type);
        let newProfessor = new Professor(
          null,
          type,
          toNormalCase(professor["nombre del profesor"]),
          null,
        );
        professorList.push(newProfessor);
      });
      return professorList;
    };

    const workbook = XLSX.read(fileBuffer);
    const sheetIndex = workbook.SheetNames.findIndex(
      (name) => name === "profesores",
    );
    const worksheet = workbook.Sheets[workbook.SheetNames[sheetIndex]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    const result = jsonToProfessorList(jsonData);
    return result;
  }
}
