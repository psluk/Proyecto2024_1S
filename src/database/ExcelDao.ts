import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import Professor from "../models/Professor";
import Student from "../models/Student";
import { toNormalCase } from "../utils/NameFormatter";
import Course from "../models/Course";
import CourseSchedule, {
  CourseScheduleProfessorInterface,
} from "../models/CourseSchedule";
import ImportedWorkload from "../models/ImportedWorkload";

interface JSONProfessorInterface {
  id: number | null;
  type: string;
  name: string;
  email: string | null;
  _1: string | null;
  __EMPTY: string | null;
}

interface ScheduleJsonBodyInterface {
  __EMPTY_1: string;
  __EMPTY_2: string;
  __EMPTY_3: string;
  __EMPTY_4: string;
  __EMPTY_5: string;
  __EMPTY_6: string;
  __EMPTY_7: number;
  __EMPTY_8: number;
  __EMPTY_9: string;
  __EMPTY_10: string;
  __EMPTY_11: string;
  __EMPTY_12: string;
  __EMPTY_13: number;
  __EMPTY_14: string;
  __EMPTY_15: string;
}

interface ScheduleJsonHeaderInterface {
  __EMPTY_1: string;
  __EMPTY_2: string;
  __EMPTY_3: string;
  __EMPTY_4: string;
  __EMPTY_5: string;
  __EMPTY_6: string;
  __EMPTY_7: string;
  __EMPTY_8: string;
  __EMPTY_9: string;
  __EMPTY_10: string;
  __EMPTY_11: string;
  __EMPTY_12: string;
  __EMPTY_13: string;
  __EMPTY_14: string;
  __EMPTY_15: string;
}

interface ScheduleJsonInterface {
  0: ScheduleJsonHeaderInterface;
  1: {
    __EMPTY_11: string;
    __EMPTY_12: string;
  };
  [key: number]:
    | ScheduleJsonBodyInterface
    | ScheduleJsonHeaderInterface
    | { __EMPTY_11: string; __EMPTY_12: string };
}

export default class ExcelDao {
  /**
   * Saves a file into internal storage to persist it
   * @param fileName The file's name to save it internally.
   * @param fileBuffer The Excel file's array buffer.
   * @param type The type of file to categorize it in a specific folder.
   * @returns Success status of saving the file.
   */
  saveFile = (fileName, fileBuffer, type): { success: boolean } => {
    const hiddenDataPath = path.join(__dirname, "..", `.hidden_data/${type}`);

    if (!fs.existsSync(hiddenDataPath)) {
      fs.mkdirSync(hiddenDataPath, { recursive: true });
    }

    try {
      const existingFiles = fs.readdirSync(hiddenDataPath);
      for (const file of existingFiles) {
        fs.unlinkSync(path.join(hiddenDataPath, file));
      }

      const filePath = path.join(hiddenDataPath, fileName);
      fs.writeFileSync(filePath, Buffer.from(fileBuffer));
      return { success: true };
    } catch (error) {
      console.error("Error saving file:", error);
      return { success: false };
    }
  };

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

    const jsonToProfessorList = (
      jsonData: JSONProfessorInterface[],
    ): Professor[] => {
      const professorList: Professor[] = [];
      let type: string;
      jsonData.forEach((JSONProfessorInterface) => {
        if (JSONProfessorInterface["__EMPTY"]) {
          type = JSONProfessorInterface.__EMPTY;
        }
        if (JSONProfessorInterface["_1"]) {
          type = JSONProfessorInterface._1;
        }

        type = mapType(type);
        const newProfessor = new Professor(
          null,
          type,
          toNormalCase(JSONProfessorInterface["nombre del profesor"]),
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
    const jsonData: JSONProfessorInterface[] =
      XLSX.utils.sheet_to_json<JSONProfessorInterface>(worksheet);
    console.log(jsonData);
    return jsonToProfessorList(jsonData);
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

    const jsonToScheduleList = (
      jsonData: ScheduleJsonInterface[],
    ): CourseSchedule[] => {
      const courseScheduleList: CourseSchedule[] = [];
      jsonData.slice(2).forEach((courseScheduleRow) => {
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
    const jsonData: ScheduleJsonInterface[] =
      XLSX.utils.sheet_to_json(worksheet);
    return jsonToScheduleList(jsonData);
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

    const jsonToCourseList = (jsonData: Course[]): Course[] => {
      const courseList: Course[] = [];
      let type: string;
      jsonData.forEach((course) => {
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
    const jsonData = XLSX.utils.sheet_to_json<Course>(worksheet);
    return jsonToCourseList(jsonData);
  }

  /**
   * Gets a list of professors and their workloads from an Excel file.
   * @param fileBuffer The Excel file's array buffer.
   * @returns A list of professors and their workloads.
   */
  async getProfessorWorkload(
    fileBuffer: ArrayBuffer,
  ): Promise<{ professor: string; workload: ImportedWorkload[] }[]> {
    const getCourseLoadType = (
      cellColor: number | string,
    ): "normal" | "extended" | "double" | "overload" | "adHonorem" => {
      let type: "normal" | "extended" | "double" | "overload" | "adHonorem" =
        "normal";
      switch (cellColor) {
        case 0.3999755851924192:
        case "FFFFBFAF":
          // Ampliación
          type = "extended";
          break;

        case 0.5999938962981048:
        case "8DB4E2":
          // Doble ampliación
          type = "double";
          break;

        case "FFFFC000":
          // Recargo
          type = "overload";
          break;

        case -0.3499862666707358:
        case "FFA6A6A6":
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
    let workload: ImportedWorkload[] = [];
    if (!sheet) {
      throw new Error("No sheet named 'cargasProf' found in the Excel file");
    }
    let professor = "";
    let jumpingToNextProfessor = true;
    let jumpingToWorkload = false;
    const courseRegex = /^[a-zA-Z]{2}\d{4}$/;
    const result: { professor: string; workload: ImportedWorkload[] }[] = [];

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
          const groupNumber = parseInt(
            toNormalCase(courseNameCell.value?.toString().trim() || "", true)
              .split("G")
              .at(-1) || "0",
          );

          workload.push(
            new ImportedWorkload(
              "course",
              getCourseLoadType(
                (
                  courseNameCell as unknown as {
                    style: {
                      fill: {
                        type: string;
                        fgColor: { tint: string };
                      };
                    };
                  }
                ).style.fill?.fgColor?.tint ||
                  (
                    courseNameCell as {
                      style: {
                        fill: {
                          type: string;
                          fgColor: { argb: string };
                        };
                      };
                    }
                  ).style.fill?.fgColor?.argb ||
                  0,
              ),
              courseCode,
              toNormalCase(courseNameCell.value?.toString().trim() || "", true),
              parseInt(row.getCell("D").value?.toString() || "0") || null,
              parseInt(row.getCell("E").value?.toString() || "0") || null,
              parseFloat(row.getCell("F").value?.toString() || "0"),
              isNaN(groupNumber) ? 1 : groupNumber,
            ),
          );
        }

        const researchWorkload =
          row.getCell("G").value?.toString().trim() || "";
        if (researchWorkload) {
          // There is a research workload in the row
          workload.push(
            new ImportedWorkload(
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
            new ImportedWorkload(
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
            new ImportedWorkload(
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

  /**
   * Gets a list of students from an Excel file.
   * @param fileBuffer The Excel file's array buffer.
   * @returns A list of students.
   */
  getStudents(fileBuffer: ArrayBuffer): Student[] {
    const jsonToStudentList = (jsonData: Student[]): Student[] => {
      const studentList: Student[] = [];
      jsonData.forEach((student) => {
        const newStudent = new Student(
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
      (name) => name === "Lista de estidiantes",
    );
    const worksheet = workbook.Sheets[workbook.SheetNames[sheetIndex]];
    const jsonData = XLSX.utils.sheet_to_json<Student>(worksheet, { range: 4 });
    return jsonToStudentList(jsonData);
  }
}
