import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import Professor from "../models/Professor";
import { toNormalCase } from "../utils/NameFormatter";
import Course from "../models/Course";
import CourseSchedule, {
  CourseScheduleProfessorInterface,
} from "../models/CourseSchedule";
import Workload from "../models/Workload";

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
      const professorList: Professor[] = [];
      let type: string;
      jsonData.forEach((professor: any) => {
        if (professor["__EMPTY"]) {
          type = professor.__EMPTY;
        }
        type = mapType(type);
        const newProfessor = new Professor(
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
   * Gets a list of courses from CourseSchedule sheet from an Excel file.
   * @param fileBuffer The Excel file's array buffer.
   * @returns A list of courses.
   */
  getCourseSchedule(fileBuffer: ArrayBuffer): CourseSchedule[] {
    const columnNames = {
      courseCode: "__EMPTY_5",
      courseName: "__EMPTY_6",
      professorsIds: "__EMPTY_13",
      professorsNames: "__EMPTY_14",
      capacity: "__EMPTY_8",
      groupStatus: "__EMPTY_10",
      groupNumber: "__EMPTY_7",
    };

    const jsonToScheduleList = (jsonData: any): CourseSchedule[] => {
      const courseScheduleList: CourseSchedule[] = [];
      jsonData.slice(2).forEach((courseScheduleRow: any) => {
        const professors: CourseScheduleProfessorInterface[] = [];

        // If the group is closed, the row is skipped
        const groupStatus = (courseScheduleRow[columnNames.groupStatus] ?? "")
          .trim()
          .toLowerCase();

        if (groupStatus == "cerrado") {
          return;
        }

        const groupNumber = parseInt(
          courseScheduleRow[columnNames.groupNumber] ?? "0",
        );

        // If there are multiple professors, split the ids and create a professor for each one
        const splitIds = courseScheduleRow[columnNames.professorsIds]
          .toString()
          .split("\n");

        // If there are multiple professors, split the names and create a professor for each one
        const splitNames =
          courseScheduleRow[columnNames.professorsNames].split(/\s{2,}/g);

        if (splitIds.length == splitNames.length && splitIds.length > 1) {
          splitIds.forEach((_: string, index: number) => {
            professors.push({
              name: toNormalCase(splitNames[index]),
              students: 1,
              experienceFactor: null,
              studentFactor: null,
              groupNumber,
            });
          });
        } else {
          professors.push({
            name: toNormalCase(courseScheduleRow[columnNames.professorsNames]),
            students: parseInt(courseScheduleRow[columnNames.capacity]),
            experienceFactor: null,
            studentFactor: null,
            groupNumber,
          });
        }

        const newCourse = new CourseSchedule(
          (courseScheduleRow[columnNames.courseCode] || "")
            .trim()
            .toUpperCase(),
          toNormalCase(courseScheduleRow[columnNames.courseName], true),
          professors,
        );
        courseScheduleList.push(newCourse);
      });
      return courseScheduleList;
    };

    const workbook = XLSX.read(fileBuffer);
    const sheetIndex = workbook.SheetNames.findIndex(
      (name) => name === "guiaHorario",
    );
    const worksheet = workbook.Sheets[workbook.SheetNames[sheetIndex]];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
    const result = jsonToScheduleList(jsonData);
    return result;
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
      const courseList: Course[] = [];
      let type: string;
      jsonData.forEach((course: any) => {
        type = mapType(course["tipo"]);
        const newCourse = new Course(
          null,
          type,
          course["codigo"],
          toNormalCase(course["curso"], true),
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
   * Gets a list of professors and their workloads from an Excel file.
   * @param fileBuffer The Excel file's array buffer.
   * @returns A list of professors and their workloads.
   */
  async getProfessorWorkload(
    fileBuffer: ArrayBuffer,
  ): Promise<{ professor: string; workload: Workload[] }[]> {
    const getCourseLoadType = (
      cellColor: number | string,
    ): "normal" | "extended" | "double" | "overload" | "adHonorem" => {
      let type: "normal" | "extended" | "double" | "overload" | "adHonorem" =
        "normal";
      switch (cellColor) {
        case 0.3999755851924192:
          // Ampliación
          type = "extended";
          break;

        case 0.5999938962981048:
          // Doble ampliación
          type = "double";
          break;

        case "FFFFC000":
          // Recargo
          type = "overload";
          break;

        case -0.3499862666707358:
          // Ad honorem
          type = "adHonorem";
          break;

        default:
          break;
      }
      return type;
    };

    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.load(fileBuffer);

    const sheet = workbook.getWorksheet("cargasProf");
    let workload: Workload[] = [];
    if (!sheet) {
      throw new Error("No sheet named 'cargasProf' found in the Excel file");
    }
    let professor = "";
    let jumpingToNextProfessor = true;
    let jumpingToWorkload = false;
    const courseRegex = /^[a-zA-Z]{2}\d{4}$/;
    const result: { professor: string; workload: Workload[] }[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const cell = row.getCell("B");
        if (
          // A professor's name is in the second column
          cell.value?.toString() === "Profesor:" ||
          // Or the cell is yellow
          (cell.style.fill?.type === "pattern" &&
            cell.style.fill?.fgColor?.argb === "FFFFFF00")
        ) {
          if (professor && workload.length) {
            result.push({
              professor,
              workload,
            });
            workload = [];
          }
          jumpingToNextProfessor = false;
          professor = toNormalCase(row.getCell("C").value?.toString() || "");
          jumpingToWorkload = true;
        } else if (jumpingToNextProfessor) {
          return;
        }

        if (jumpingToWorkload) {
          if (
            // A course code is in column B
            cell.value?.toString() === "Código"
          ) {
            jumpingToWorkload = false;
          }
          return;
        }

        const courseCode = cell.value?.toString().replaceAll(/\s+/g, "") || "";

        if (courseRegex.test(courseCode)) {
          // There is a course workload in the row
          const courseNameCell = row.getCell("C");
          workload.push(
            new Workload(
              "course",
              getCourseLoadType(
                (courseNameCell as any).style.fill?.fgColor?.tint ||
                  (courseNameCell as any).style.fill?.fgColor?.argb ||
                  0,
              ),
              courseCode,
              toNormalCase(courseNameCell.value?.toString().trim() || "", true),
              parseInt(row.getCell("D").value?.toString() || "0") || null,
              parseInt(row.getCell("E").value?.toString() || "0") || null,
              parseFloat(row.getCell("F").value?.toString() || "0"),
              parseInt(toNormalCase(courseNameCell.value?.toString().trim() || "", true).split("G").at(-1) || "0")
            )
          );
        }

        const researchWorkload =
          row.getCell("G").value?.toString().trim() || "";
        if (researchWorkload) {
          // There is a research workload in the row
          workload.push(
            new Workload(
              "research",
              "normal",
              null,
              researchWorkload,
              null,
              null,
              parseFloat(row.getCell("H").value?.toString() || "0"),
              null,
            ),
          );
        }

        const specialWorkload = row.getCell("I").value?.toString().trim() || "";
        if (specialWorkload) {
          // There is a special workload in the row
          workload.push(
            new Workload(
              "special",
              "normal",
              null,
              specialWorkload,
              null,
              null,
              parseFloat(row.getCell("J").value?.toString() || "0"),
              null,
            ),
          );
        }

        const administrativeWorkload =
          row.getCell("K").value?.toString().trim() || "";
        if (administrativeWorkload) {
          // There is an administrative workload in the row
          workload.push(
            new Workload(
              "administrative",
              "normal",
              null,
              administrativeWorkload,
              null,
              null,
              parseFloat(row.getCell("L").value?.toString() || "0"),
              null,
            ),
          );
        }
      }
    });

    if (professor && workload.length) {
      result.push({
        professor,
        workload,
      });
      workload = [];
    }

    return result;
  }
}
