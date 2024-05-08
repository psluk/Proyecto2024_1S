import * as XLSX from "xlsx";
import Professor from "../models/Professor";
import Student from "../models/Student";
import { toNormalCase } from "../utils/NameFormatter";
import Course from "../models/Course";

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

  /**
   * Gets a list of courses from HourGuide sheet from an Excel file.
   * @param fileBuffer The Excel file's array buffer.
   * @returns A list of course.
   */
  getHourGuide(fileBuffer: ArrayBuffer): string[] {
    const workbook = XLSX.read(fileBuffer);
    const sheetIndex = workbook.SheetNames.findIndex(
      (name) => name === "guiaHorario",
    );
    const worksheet = workbook.Sheets[workbook.SheetNames[sheetIndex]];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { range: 1 });
    return jsonData;
  }

  /**
   * Gets a list of courses from CourseHours sheet from an Excel file.
   * @param fileBuffer The Excel file's array buffer.
   * @returns A list of professors.
   */
  getCourseHours(fileBuffer: ArrayBuffer): Course[] {
    const mapType = (type: string): string => {
      const typeMapping: { [key: string]: string } = {
        teórico: "Theoretical",
        práctico: "Practical",
        "teórico practico": "Theoretical-Practical",
        proyecto: "Project",
      };
      return typeMapping[type.toLowerCase()] || type;
    };

    const jsonToCourseList = (jsonData: any): Course[] => {
      let courseList: Course[] = [];
      let type: string;
      jsonData.forEach((course: any) => {
        console.log("Tipo antes del map: ", course["tipo"]);
        type = mapType(course["tipo"]);
        console.log("Después del map: ", type);
        let newCourse = new Course(
          null,
          type,
          course["codigo"],
          toNormalCase(course["curso"]),
          parseInt(course["horas"]),
        );
        courseList.push(newCourse);
      });
      return courseList;
    };

    const workbook = XLSX.read(fileBuffer);
    const sheetIndex = workbook.SheetNames.findIndex(
      (name) => name === "horasCurso",
    );
    const worksheet = workbook.Sheets[workbook.SheetNames[sheetIndex]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    const result = jsonToCourseList(jsonData);
    return result;
  }

  /**
   * Gets a list of students from an Excel file.
   * @param fileBuffer The Excel file's array buffer.
   * @returns A list of students.
   */
  getStudents(fileBuffer: ArrayBuffer): Student[] {
    const jsonToStudentList = (jsonData: any): Student[] => {
      let studentList: Student[] = [];
      jsonData.forEach((student: any) => {
        let newStudent = new Student(
          null,
          student["Nombre completo"],
          student["Teléfono celular"],
          student["Correo electrónico"],
          student["Carnet institucional"],
          true,
        );
        studentList.push(newStudent);
      });
      return studentList;
    };

    const workbook = XLSX.read(fileBuffer);
    const sheetIndex = workbook.SheetNames.findIndex(
      (name) => name === "Lista de estudiantes",
    );
    const worksheet = workbook.Sheets[workbook.SheetNames[sheetIndex]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: 4 });
    const result = jsonToStudentList(jsonData);
    return result;
  }
}
