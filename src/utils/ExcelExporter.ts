import ExcelJS, { Workbook, FillPattern } from "exceljs";
import ProfessorDao from "../database/ProfessorDao";
import Professor from "../models/Professor";
import Workload, { WorkloadInterface } from "../models/Workload";
import Course from "../models/Course";
import StudentDao from "../database/StudentDao";
import GroupDao from "../database/GroupDao";
import StudentProfessorDao from "../database/StudentProfessorDao";
import fs from "fs";
import path from "path";
import {
  convertIsoStringToLocalDate,
  convertDateToLocalTime,
} from "./DateTools";

interface FileResult {
  success: boolean;
  fileBuffer?: Buffer;
  fileName?: string;
  message?: string;
}

interface SolidFill {
  type: "pattern";
  pattern: "solid";
  fgColor: { argb: string };
}

type Fill = SolidFill;

const groupColors = ["FFC6E0B4", "FFBDD7EE", "FFFFE699", "FFDBDBDB"];
const borderStyles: Partial<ExcelJS.Borders> = {
  top: { style: "medium" },
  left: { style: "medium" },
  bottom: { style: "medium" },
  right: { style: "medium" },
};

const workloadTypeColors: { [key: string]: Fill } = {
  normal: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } },
  extended: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFBFAF" },
  },
  double: { type: "pattern", pattern: "solid", fgColor: { argb: "8DB4E2" } },
  overload: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF0000" },
  },
  adHonorem: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFA6A6A6" },
  },
};

interface WorkloadData {
  code: string | null;
  name: string;
  hours: number | null;
  students: number | null;
  workload: number;
  fill: FillPattern;
}

export default class ExcelExporter {
  private professorDao: ProfessorDao;
  private studentDao: StudentDao;
  private groupDao: GroupDao;
  private studentProfessorDao: StudentProfessorDao;

  constructor() {
    this.professorDao = new ProfessorDao();
    this.studentDao = new StudentDao();
    this.groupDao = new GroupDao();
    this.studentProfessorDao = new StudentProfessorDao();
  }

  /**
   * Removes a sheet from the Excel file and adds a new one with the same name.
   * @param ExcelFile The Excel file to remove the sheet from.
   * @param sheetName The name of the sheet to remove.
   * @returns The new sheet added.
   */
  private removeAndAddSheet(
    ExcelFile: Workbook,
    sheetName: string,
  ): ExcelJS.Worksheet {
    const existingSheet = ExcelFile.getWorksheet(sheetName);
    if (existingSheet) {
      ExcelFile.removeWorksheet(existingSheet.id);
    }
    return ExcelFile.addWorksheet(sheetName);
  }

  /**
   * Gets a file from the internal file folder to export data.
   * @param type type of file to export (professorsFile | studentsFile)
   * @returns returns a success status. In case of finding a file, returns the buffer and name of such file
   */
  public getSavedFile(type: string): FileResult {
    const hiddenDataPath = path.join(__dirname, "..", `.hidden_data/${type}`);
    if (!fs.existsSync(hiddenDataPath)) {
      fs.mkdirSync(hiddenDataPath);
    }

    const files = fs.readdirSync(hiddenDataPath);
    if (files.length > 0) {
      const fileName = files[0];
      const filePath = path.join(hiddenDataPath, fileName);
      const fileBuffer = fs.readFileSync(filePath);
      return { success: true, fileBuffer, fileName };
    } else {
      return { success: false, message: "No files found" };
    }
  }

  /**
   * Exports the professors Excel file for the user to save it.
   */
  public async exportProfessorsFile(): Promise<void> {
    const existingFile = this.getSavedFile("professorsFile");
    const workbook = new ExcelJS.Workbook();

    if (existingFile.success) {
      await workbook.xlsx.load(existingFile.fileBuffer!);
    }

    this.exportProfessorsSheet(workbook);
    this.exportWorkloadSheet(workbook);
    this.exportCourseHoursSheet(workbook);

    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = existingFile.fileName!;
    const newFileName = fileName.replace(/\.[^/.]+$/, ".xlsx");

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = newFileName;
    anchor.click();

    window.URL.revokeObjectURL(url);
  }
  /**
   *Exports the courses hours sheet for the professors Excel file
   * @param ExcelFile The Excel file to export to.
   */
  private exportCourseHoursSheet(ExcelFile: Workbook): void {
    const mapType = (type: string): string => {
      const typeMapping: { [key: string]: string } = {
        Theoretical: "Teórico",
        Practical: "Práctico",
        "Theoretical-Practical": "Teórico practico",
        Project: "Proyecto",
      };
      return typeMapping[type] || type;
    };

    const existingSheet = ExcelFile.getWorksheet("horasCurso");
    if (existingSheet) {
      ExcelFile.removeWorksheet(existingSheet.id);
    }

    const courseList = this.professorDao.getCourses();
    const sheet = ExcelFile.addWorksheet("horasCurso");

    sheet.columns = [
      { header: "", key: "empty", width: 11 },
      { header: "codigo", key: "code", width: 8 },
      { header: "curso", key: "name", width: 39 },
      { header: "horas", key: "hours", width: 6 },
      { header: "tipo", key: "type", width: 21 },
    ];

    courseList.forEach((course: Course) => {
      sheet.addRow({
        empty: "",
        code: course.getCode(),
        name: course.getName().toUpperCase(),
        hours: course.getHours(),
        type: mapType(course.getType()),
      });
    });

    const headerRow = sheet.getRow(1);
    headerRow.font = { name: "Arial", size: 10, bold: true };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    sheet.eachRow((row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber > 1) {
          if (rowNumber > 1) {
            cell.font = { name: "Arial", size: 10 };
          }
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      });
    });
  }
  /**
   *Exports the professors information sheet for the professors Excel file
   * @param ExcelFile The Excel file to export to.
   */
  private exportProfessorsSheet(ExcelFile: Workbook): void {
    const existingSheet = ExcelFile.getWorksheet("profesores");
    if (existingSheet) {
      ExcelFile.removeWorksheet(existingSheet.id);
    }
    const sheet = ExcelFile.addWorksheet("profesores");
    const professors: Professor[] = this.professorDao.getProfessors();
    const permanentProfessors = professors.filter(
      (professor) => professor.getType() === "Permanent",
    );
    const temporaryProfessors = professors.filter(
      (professor) => professor.getType() === "Temporary",
    );

    sheet.columns = [
      { header: "", key: "empty", width: 11 },
      { header: "", key: "professorsType", width: 11 },
      { header: "nombre del profesor", key: "professorName", width: 43 },
    ];

    const permanentLength = permanentProfessors.length;
    const temporaryLength = temporaryProfessors.length;

    sheet.mergeCells(2, 2, permanentLength + 1, 2);
    const plantaCell = sheet.getCell("B2");
    plantaCell.value = "profesores de planta";
    plantaCell.alignment = {
      vertical: "middle",
      horizontal: "center",
      textRotation: 90,
    };
    plantaCell.font = { name: "Times New Roman", size: 11 };

    const interinosStartRow = permanentLength + 2;
    sheet.mergeCells(
      interinosStartRow,
      2,
      interinosStartRow + temporaryLength - 1,
      2,
    );
    const interinosCell = sheet.getCell(interinosStartRow, 2);
    interinosCell.value = "profesores iterinos";
    interinosCell.alignment = {
      vertical: "middle",
      horizontal: "center",
      textRotation: 90,
    };
    interinosCell.font = { name: "Times New Roman", size: 11 };

    permanentProfessors.forEach((professor, index) => {
      const cell = sheet.getCell(index + 2, 3);
      cell.value = professor.getName().toUpperCase();
      cell.font = { name: "Arial", size: 10 };
    });

    temporaryProfessors.forEach((professor, index) => {
      const cell = sheet.getCell(interinosStartRow + index, 3);
      cell.value = professor.getName().toUpperCase();
      cell.font = { name: "Arial", size: 10 };
    });

    const headerRow = sheet.getRow(1);
    headerRow.font = { name: "Times New Roman", size: 11, bold: true };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    sheet.eachRow((row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        const colMatch = cell.address.match(/[A-Z]+/);
        if (colMatch && colMatch[0] !== "A") {
          cell.font = {
            name: cell.font?.name || "Arial",
            size: cell.font?.size || 10,
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
        if (rowNumber === 1) {
          cell.font = { name: "Times New Roman", size: 11, bold: true };
        }

        // Asegúrate de que la celda B1 esté vacía y sin bordes
        if (cell.address === "B1") {
          cell.value = "";
          cell.border = {};
        }
      });
    });
  }

  /**
   *Exports the workload of each professor sheet for the professors Excel file
   * @param ExcelFile The Excel file to export to.
   */
  exportWorkloadSheet(ExcelFile: ExcelJS.Workbook): void {
    const existingSheet = ExcelFile.getWorksheet("cargasProf");
    if (existingSheet) {
      ExcelFile.removeWorksheet(existingSheet.id);
    }
    const professors = this.professorDao.getProfessors();
    const sheet = ExcelFile.addWorksheet("cargasProf");

    // Configuración inicial de la hoja
    sheet.getColumn(1).width = 0.5; // Columna vacía A
    sheet.getColumn(2).width = 8; // Código
    sheet.getColumn(3).width = 56; // Labores docentes
    sheet.getColumn(4).width = 6; // Hr
    sheet.getColumn(5).width = 5; // Est
    sheet.getColumn(6).width = 8; // Carga1
    sheet.getColumn(7).width = 23; // Labores de investigación
    sheet.getColumn(8).width = 8; // Carga 2
    sheet.getColumn(9).width = 19; // Labores especiales
    sheet.getColumn(10).width = 8; // Carga 3
    sheet.getColumn(11).width = 28; // Labores Acade-Adminis
    sheet.getColumn(12).width = 8; // Carga 4
    sheet.getColumn(13).width = 8; // Espacio vacío antes del resumen
    sheet.getColumn(14).width = 15; // Resumen hrs
    sheet.getColumn(15).width = 8; // Resumen %

    let currentRow = 1;

    // Encabezados iniciales
    const TECCell = sheet.getCell(currentRow, 5);
    TECCell.value = "INSTITUTO TECNOLOGICO DE COSTA RICA";
    TECCell.font = { name: "Arial", size: 12, bold: true };
    TECCell.alignment = { vertical: "middle" };
    currentRow++;

    const MaterialsCell = sheet.getCell(currentRow, 5);
    MaterialsCell.value = "ESCUELA DE CIENCIA E INGENIERÍA DE LOS MATERIALES";
    MaterialsCell.font = { name: "Arial", size: 10, bold: true };
    MaterialsCell.alignment = { vertical: "middle" };
    currentRow++;

    const LoadCell = sheet.getCell(currentRow, 6);
    LoadCell.value = "CARGA ACADEMICA x SEMESTRE 202x";
    LoadCell.font = { name: "Arial", size: 10, bold: true };
    LoadCell.alignment = { vertical: "middle" };
    currentRow += 2;

    // Separar los profesores en planta e interinos
    const permanentProfessors = professors.filter(
      (prof) => prof.getType() === "Permanent",
    );
    const temporaryProfessors = professors.filter(
      (prof) => prof.getType() === "Temporary",
    );

    // Función para escribir la carga académica de los profesores
    const writeProfessorsWorkload = (professors: Professor[]): void => {
      professors.forEach((professor) => {
        const hourCell = sheet.getCell(currentRow, 12);
        hourCell.value = "hrs";
        hourCell.font = { name: "Arial", size: 9, bold: true };
        hourCell.alignment = { vertical: "middle", horizontal: "center" };

        const percentageCell = sheet.getCell(currentRow, 13);
        percentageCell.value = "%";
        percentageCell.font = { name: "Arial", size: 9, bold: true };
        percentageCell.alignment = { vertical: "middle", horizontal: "center" };

        currentRow++;

        const titleCell = sheet.getCell(currentRow, 2);
        titleCell.value = "Profesor:";
        titleCell.font = { name: "Arial", size: 9, bold: true };
        titleCell.alignment = { vertical: "middle", horizontal: "center" };
        titleCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" },
        };

        const loadedWorkload = this.professorDao
          .getWorkloadByProfessorId(professor.getId())
          .map((workload) =>
            Workload.reinstantiate(workload as unknown as WorkloadInterface),
          )
          .filter((workload): workload is Workload => workload !== null);

        const workloadRows: { [key: string]: WorkloadData[] } = {
          course: [],
          research: [],
          special: [],
          administrative: [],
        };

        loadedWorkload.forEach((workload) => {
          const workloadType = workload.getWorkloadType();
          const fill = workloadTypeColors[workloadType];

          const rowData: WorkloadData = {
            code: workload.getCode() ?? "",
            name:
              workload.getActivityType() === "course" &&
              workload.getName() !== "Proyecto Final de Graduación" &&
              workload.getName() !== "Proyecto de Graduación (tribunal)"
                ? `${workload.getName()} G${workload.getGroupNumber()}`
                : workload.getName(),
            hours: workload.getHours() ?? 0,
            students: workload.getStudents() ?? 0,
            workload: workload.getWorkload(),
            fill: fill as FillPattern,
          };

          workloadRows[workload.getActivityType()].push(rowData);
        });

        const professorCell = sheet.getCell(currentRow, 3);
        professorCell.value = professor.getName().toUpperCase();
        professorCell.font = { name: "Arial", size: 9, bold: true };
        professorCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" },
        };

        const normalTotal = loadedWorkload
          .filter((w) => w.getWorkloadType() === "normal")
          .reduce((sum, w) => sum + w.getWorkload()!, 0);
        const extendedTotal = loadedWorkload
          .filter((w) => w.getWorkloadType() === "extended")
          .reduce((sum, w) => sum + w.getWorkload()!, 0);
        const doubleTotal = loadedWorkload
          .filter((w) => w.getWorkloadType() === "double")
          .reduce((sum, w) => sum + w.getWorkload()!, 0);
        const adHonoremTotal = loadedWorkload
          .filter((w) => w.getWorkloadType() === "adHonorem")
          .reduce((sum, w) => sum + w.getWorkload()!, 0);
        const sumTotal = normalTotal + extendedTotal + doubleTotal;
        const facultyTotal = loadedWorkload
          .filter(
            (w) =>
              w.getActivityType() === "course" ||
              w.getActivityType() === "administrative",
          )
          .reduce((sum, w) => sum + (w.getWorkload() || 0), 0);

        const summaryStartCol = 11;

        const summaryHeaders = [
          "Carga normal:",
          "Ampliación:",
          "Doble ampliación:",
          "Ad Honorem:",
          "Carga total:",
          "Carga escuela/total",
        ];
        const summaryValues = [
          normalTotal,
          extendedTotal,
          doubleTotal,
          adHonoremTotal,
          sumTotal,
          facultyTotal,
        ];

        summaryHeaders.forEach((header, index) => {
          const headerCell = sheet.getCell(currentRow + index, summaryStartCol);
          headerCell.value = header;
          headerCell.font = { name: "Arial", size: 9, bold: true };
          headerCell.alignment = { vertical: "middle", horizontal: "right" };

          const valueCell = sheet.getCell(
            currentRow + index,
            summaryStartCol + 1,
          );
          valueCell.value = summaryValues[index];
          valueCell.font = { name: "Arial", size: 9, bold: true };
          valueCell.alignment = { vertical: "middle", horizontal: "center" };
          switch (index) {
            case 0:
              if (summaryValues[index] < 40) {
                valueCell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FF5ED14F" },
                };
              } else if (summaryValues[index] < 44) {
                valueCell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFFFC000" },
                };
              } else {
                valueCell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFFF0000" },
                };
              }
              break;
            case 1:
              valueCell.fill = workloadTypeColors.extended;
              break;
            case 2:
              valueCell.fill = workloadTypeColors.double;
              break;
            case 3:
              valueCell.fill = workloadTypeColors.adHonorem;
              break;
            case 4:
              valueCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF42F923" },
              };
              break;
            default:
              break;
          }

          if (index === 4) {
            const totalRow = sheet.getCell(
              currentRow + index,
              summaryStartCol + 2,
            );
            totalRow.value = {
              formula: `SUM(M${currentRow + index - 4}:M${currentRow + index - 1})`,
              result: 0,
            };
            totalRow.font = { name: "Arial", size: 9, bold: true };
            totalRow.alignment = { vertical: "middle", horizontal: "center" };
            totalRow.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FF42F923" },
            };
          }
          if (index === 5) {
            const totalRow = sheet.getCell(
              currentRow + index,
              summaryStartCol + 2,
            );
            totalRow.value = summaryValues[index - 1];
            totalRow.font = { name: "Arial", size: 9, bold: true };
            totalRow.alignment = { vertical: "middle", horizontal: "center" };
          }
        });

        currentRow += 6;

        const headerRow = sheet.getRow(currentRow);
        headerRow.getCell(2).value = "Código";
        headerRow.getCell(3).value = "Labores docentes";
        headerRow.getCell(4).value = "Hr";
        headerRow.getCell(5).value = "Est";
        headerRow.getCell(6).value = "Carga1";
        headerRow.getCell(7).value = "Labores de investigación";
        headerRow.getCell(8).value = "Carga 2";
        headerRow.getCell(9).value = "Labores especiales";
        headerRow.getCell(10).value = "Carga 3";
        headerRow.getCell(11).value = "Labores Acade-Adminis";
        headerRow.getCell(12).value = "Carga 4";
        headerRow.font = { name: "Arial", size: 9, bold: true };
        headerRow.eachCell((cell) => {
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.border = {
            top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" },
          };
        });

        currentRow++;

        const maxRows = Math.max(
          workloadRows.course.length,
          workloadRows.research.length,
          workloadRows.special.length,
          workloadRows.administrative.length,
        );

        for (let i = 0; i < maxRows; i++) {
          const row = sheet.getRow(currentRow);

          const applyCellData = (
            col: number,
            data: string | number | null,
            fill: FillPattern,
            applyFill: boolean = false,
          ): void => {
            const cell = row.getCell(col);
            cell.value = data !== null ? data : "";
            if (applyFill) {
              cell.fill = fill;
            }
            cell.font = { name: "Arial", size: 9 };
            cell.border = {
              top: { style: "thin" },
              left: { style: col === 2 ? "medium" : "thin" },
              bottom: { style: "thin" },
              right: {
                style: [6, 8, 10, 12].includes(col) ? "medium" : "thin",
              },
            };
          };

          if (i < workloadRows.course.length) {
            const course = workloadRows.course[i];
            applyCellData(2, course.code, course.fill);
            applyCellData(3, course.name.toUpperCase(), course.fill, true);
            applyCellData(4, course.hours, course.fill);
            applyCellData(5, course.students, course.fill);
            applyCellData(6, course.workload, course.fill);
          }

          if (i < workloadRows.research.length) {
            const research = workloadRows.research[i];
            applyCellData(7, research.name, research.fill, true);
            applyCellData(8, research.workload, research.fill);
          }

          if (i < workloadRows.special.length) {
            const special = workloadRows.special[i];
            applyCellData(9, special.name, special.fill, true);
            applyCellData(10, special.workload, special.fill);
          }

          if (i < workloadRows.administrative.length) {
            const administrative = workloadRows.administrative[i];
            applyCellData(11, administrative.name, administrative.fill, true);
            applyCellData(12, administrative.workload, administrative.fill);
          }

          for (let col = 2; col <= 12; col++) {
            const cell = row.getCell(col);
            if (!cell.value) {
              cell.value = "";
            }
            cell.border = {
              top: { style: "thin" },
              left: { style: col === 2 ? "medium" : "thin" },
              bottom: { style: i === maxRows - 1 ? "medium" : "thin" },
              right: {
                style: [6, 8, 10, 12].includes(col) ? "medium" : "thin",
              },
            };
          }

          currentRow++;
        }

        currentRow++;
        const adHonoremRow = sheet.getRow(currentRow);
        adHonoremRow.getCell(2).value =
          "Actividades con cero horas en carga se realizan Adhonorem";
        adHonoremRow.getCell(2).font = {
          name: "Arial",
          size: 9,
          italic: true,
        };
        sheet.mergeCells(currentRow, 2, currentRow, 3);
        adHonoremRow.getCell(2).fill = workloadTypeColors.adHonorem;
        adHonoremRow.getCell(3).fill = workloadTypeColors.adHonorem;

        currentRow += 4;

        currentRow += 2;
      });
    };

    writeProfessorsWorkload(permanentProfessors);

    const interinosCell = sheet.getCell(currentRow, 3);
    interinosCell.value = "PROFESORES INTERINOS";
    interinosCell.font = { name: "Arial", size: 10, bold: true, italic: true };
    interinosCell.alignment = { vertical: "middle", horizontal: "center" };
    interinosCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF0000" },
    };
    currentRow += 2;

    writeProfessorsWorkload(temporaryProfessors);
  }

  /**
   *                                                        STUDENTS FILE
   */

  /**
   *Exports the full students file with all the necessary sheets of data.
   */
  public async exportStudentsFile(): Promise<void> {
    const existingFile = this.getSavedFile("studentsFile");
    const workbook = new ExcelJS.Workbook();

    if (existingFile.success) {
      await workbook.xlsx.load(existingFile.fileBuffer!);
    }

    this.exportStudentListSheet(workbook);
    this.exportGroupsSheet(workbook);
    this.exportAdvisorsSheet(workbook);
    this.exportPresentationsSheet(workbook);
    this.exportInvitationsSheet(workbook);

    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = existingFile.fileName!;
    const newFileName = fileName.replace(/\.[^/.]+$/, ".xlsx");

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = newFileName;
    anchor.click();

    window.URL.revokeObjectURL(url);
  }

  /**
   * Exports the students information sheet for the students Excel file
   * @param ExcelFile The Excel file to export to.
   */
  private exportStudentListSheet(ExcelFile: Workbook): void {
    const sheet = this.removeAndAddSheet(ExcelFile, "Lista de estidiantes");
    const studentList = this.studentDao.getStudents();

    sheet.getColumn(2).width = 35; // Nombre completo
    sheet.getColumn(3).width = 35; // Correo electrónico
    sheet.getColumn(4).width = 17; // Teléfono celular
    sheet.getColumn(5).width = 20; // Carnet institucional

    const titleRow = sheet.getRow(4);
    const titleCell = titleRow.getCell(2);
    titleCell.value = "Proyecto Final de Graduación CM-5300";
    titleCell.font = {
      name: "Calibri",
      size: 12,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF305496" },
    };
    sheet.mergeCells(4, 2, 4, 5);

    const headerRow = sheet.getRow(5);
    headerRow.getCell(2).value = "Nombre completo";
    headerRow.getCell(3).value = "Correo electrónico";
    headerRow.getCell(4).value = "Teléfono celular";
    headerRow.getCell(5).value = "Carnet institucional";
    headerRow.font = {
      name: "Calibri",
      size: 12,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF305496" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      }
    });

    let currentRow = 6;
    studentList.forEach((student) => {
      const row = sheet.getRow(currentRow);
      row.getCell(2).value = student.getName();
      row.getCell(3).value = student.getEmail();
      row.getCell(4).value = student.getPhoneNum();
      row.getCell(5).value = student.getUniversityId();

      if (student.getIsEnabled()) {
        row.getCell(2).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEBF1DE" },
        };
      } else {
        row.getCell(2).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFC7CE" },
        };
      }

      row.eachCell((cell, colNumber) => {
        if (colNumber > 1) {
          cell.font = { name: "Arial", size: 10 };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      });

      currentRow++;
    });

    sheet.eachRow((row) => {
      row.height = 15;
    });
  }

  /**
   *Exports the groups sheet for the students Excel file
   * @param ExcelFile The Excel file to export to.
   */
  private exportGroupsSheet(ExcelFile: Workbook): void {
    const sheet = this.removeAndAddSheet(ExcelFile, "Grupos");
    const groupList = this.groupDao.getGroups();

    let maxProfessors = 0;
    let maxStudents = 0;

    groupList.forEach((group) => {
      const nonModeratorProfessors = group
        .getProfessors()
        .filter(
          (professor) => professor.getId() !== group.getModerator()?.getId(),
        );
      maxProfessors = Math.max(maxProfessors, nonModeratorProfessors.length);
      maxStudents = Math.max(maxStudents, group.getStudents().length);
    });

    let currentColumn = 3;
    let colorIndex = 0;

    groupList.forEach((group) => {
      const color = groupColors[colorIndex % groupColors.length];
      let currentRow = 3;

      const applyMediumBorder = (
        startRow: number,
        endRow: number,
        startCol: number,
        endCol: number,
      ): void => {
        for (let row = startRow; row <= endRow; row++) {
          for (let col = startCol; col <= endCol; col++) {
            const cell = sheet.getRow(row).getCell(col);
            const border: Partial<ExcelJS.Borders> = {};
            if (row === startRow) {
              border.top = { style: "medium" };
            }
            if (row === endRow) {
              border.bottom = { style: "medium" };
            }
            if (col === startCol) {
              border.left = { style: "medium" };
            }
            if (col === endCol) {
              border.right = { style: "medium" };
            }
            cell.border = border;
          }
        }
      };

      const groupTitle = `Grupo ${group.getGroupNumber()}`;
      const classroom = `Aula: ${group.getClassroom() ?? "Sin asignar"}`;
      const moderatorName = group.getModerator()
        ? `${group.getModerator()!.getName()} (Moderador)`
        : "Sin moderador";

      const groupHeader = sheet.getRow(currentRow);
      groupHeader.getCell(currentColumn).value = groupTitle;
      groupHeader.getCell(currentColumn).font = {
        name: "Calibri",
        size: 14,
        bold: true,
      };
      groupHeader.getCell(currentColumn).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      groupHeader.getCell(currentColumn).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: color },
      };
      sheet.mergeCells(
        currentRow,
        currentColumn,
        currentRow,
        currentColumn + 1,
      );
      currentRow++;

      const classroomHeader = sheet.getRow(currentRow);
      classroomHeader.getCell(currentColumn).value = classroom;
      classroomHeader.getCell(currentColumn).font = {
        name: "Calibri",
        size: 12,
        bold: true,
      };
      classroomHeader.getCell(currentColumn).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      classroomHeader.getCell(currentColumn).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: color },
      };
      sheet.mergeCells(
        currentRow,
        currentColumn,
        currentRow,
        currentColumn + 1,
      );
      currentRow++;

      const moderatorRow = sheet.getRow(currentRow);
      moderatorRow.getCell(currentColumn).value = moderatorName;
      moderatorRow.getCell(currentColumn).font = { name: "Calibri", size: 10 };
      moderatorRow.getCell(currentColumn).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      moderatorRow.getCell(currentColumn).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: color },
      };
      sheet.mergeCells(
        currentRow,
        currentColumn,
        currentRow,
        currentColumn + 1,
      );
      currentRow++;

      const nonModeratorProfessors = group
        .getProfessors()
        .filter(
          (professor) => professor.getId() !== group.getModerator()?.getId(),
        );

      nonModeratorProfessors.forEach((professor) => {
        const row = sheet.getRow(currentRow);
        row.getCell(currentColumn).value = professor.getName();
        row.getCell(currentColumn).font = { name: "Calibri", size: 10 };
        row.getCell(currentColumn).alignment = {
          vertical: "middle",
          horizontal: "center",
        };
        row.getCell(currentColumn).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: color },
        };
        sheet.mergeCells(
          currentRow,
          currentColumn,
          currentRow,
          currentColumn + 1,
        );
        currentRow++;
      });

      for (let i = nonModeratorProfessors.length; i < maxProfessors; i++) {
        const row = sheet.getRow(currentRow);
        row.getCell(currentColumn).value = "";
        row.getCell(currentColumn).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: color },
        };
        sheet.mergeCells(
          currentRow,
          currentColumn,
          currentRow,
          currentColumn + 1,
        );
        currentRow++;
      }

      applyMediumBorder(3, currentRow - 1, currentColumn, currentColumn + 1);

      const studentHeader = sheet.getRow(currentRow);
      studentHeader.getCell(currentColumn).value = "Nombre";
      studentHeader.getCell(currentColumn + 1).value = "Carnet";
      studentHeader.font = {
        name: "Calibri",
        size: 10,
        bold: true,
        color: { argb: "FF000000" },
      };
      studentHeader.alignment = { vertical: "middle", horizontal: "center" };

      studentHeader.getCell(currentColumn).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      studentHeader.getCell(currentColumn).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: color },
      };

      studentHeader.getCell(currentColumn + 1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      studentHeader.getCell(currentColumn + 1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: color },
      };
      studentHeader.getCell(currentColumn).border = borderStyles;
      studentHeader.getCell(currentColumn + 1).border = borderStyles;

      sheet.getColumn(currentColumn).width = 40;
      sheet.getColumn(currentColumn + 1).width = 15;

      currentRow++;

      group.getStudents().forEach((student) => {
        const row = sheet.getRow(currentRow);
        row.getCell(currentColumn).value = student.getName();
        row.getCell(currentColumn + 1).value = student.getUniversityId();
        row.getCell(currentColumn).font = { name: "Calibri", size: 10 };
        row.getCell(currentColumn + 1).font = { name: "Calibri", size: 10 };
        row.getCell(currentColumn).alignment = {
          vertical: "middle",
          horizontal: "center",
        };
        row.getCell(currentColumn + 1).alignment = {
          vertical: "middle",
          horizontal: "center",
        };
        row.getCell(currentColumn).border = borderStyles;
        row.getCell(currentColumn + 1).border = borderStyles;
        currentRow++;
      });

      for (let i = group.getStudents().length; i < maxStudents; i++) {
        const row = sheet.getRow(currentRow);
        row.getCell(currentColumn).value = "";
        row.getCell(currentColumn + 1).value = "";
        row.getCell(currentColumn).border = borderStyles;
        row.getCell(currentColumn + 1).border = borderStyles;
        currentRow++;
      }

      currentColumn += 2;
      colorIndex++;
    });
  }

  /**
   *Exports the advisor professors sheet for the students Excel file
   * @param ExcelFile The Excel file to export to.
   */
  public exportAdvisorsSheet(ExcelFile: ExcelJS.Workbook): void {
    const sheet = this.removeAndAddSheet(ExcelFile, "Profesores");
    const studentProfesorList =
      this.studentProfessorDao.getStudentsProfessors();
    const studentOnlyList = this.studentDao.getStudents();

    sheet.getColumn(2).width = 35; // Estudiante
    sheet.getColumn(3).width = 15; // Carnet
    sheet.getColumn(4).width = 35; // Profesor guía
    sheet.getColumn(5).width = 35; // Profesor lector
    sheet.getColumn(6).width = 35; // Profesor lector
    sheet.getColumn(9).width = 35; // Profesor sumas
    sheet.getColumn(10).width = 35; // Cantidad guías
    sheet.getColumn(11).width = 35; // Cantidad lecturas

    const titleRow = sheet.getRow(4);
    const titleCell = titleRow.getCell(2);
    titleCell.value = "Proyecto Final de Graduación CM-5300";
    titleCell.font = {
      name: "Calibri",
      size: 12,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF305496" },
    };
    sheet.mergeCells(4, 2, 4, 6);

    const headerRow = sheet.getRow(5);
    headerRow.getCell(2).value = "Estudiante";
    headerRow.getCell(3).value = "Carnet";
    headerRow.getCell(4).value = "Profesor Guía";
    headerRow.getCell(5).value = "Profesor lector";
    headerRow.getCell(6).value = "Profesor lector";
    headerRow.font = {
      name: "Calibri",
      size: 12,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF305496" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      }
    });

    let currentRow = 6;
    studentProfesorList.forEach((one) => {
      const student = one.getStudent();
      const row = sheet.getRow(currentRow);
      row.getCell(2).value = student.name;
      row.getCell(3).value = studentOnlyList
        .find((oneStudent) => oneStudent.getName() === student.name)
        ?.getUniversityId();

      const professors = one.getProfessors();
      const advisor = professors.find(
        (professor) => +professor.isAdvisor === 1,
      );
      const nonAdvisors = professors.filter(
        (professor) => +professor.isAdvisor === 0,
      );

      while (nonAdvisors.length < 2) {
        nonAdvisors.push({ id: 0, name: "No asignado", isAdvisor: false });
      }

      row.getCell(4).value = advisor ? advisor.name : "No asignado";
      row.getCell(5).value = nonAdvisors[0]
        ? nonAdvisors[0].name
        : "No asignado";
      row.getCell(6).value = nonAdvisors[1]
        ? nonAdvisors[1].name
        : "No asignado";

      row.getCell(2).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEBF1DE" },
      };

      row.eachCell((cell, colNumber) => {
        if (colNumber > 1) {
          cell.font = { name: "Arial", size: 10 };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      });

      currentRow++;
    });

    sheet.eachRow((row) => {
      row.height = 15;
    });

    // Summary table
    const startColumn = 9;
    const headerRow2 = sheet.getRow(5);
    headerRow2.getCell(startColumn).value = "Profesor";
    headerRow2.getCell(startColumn + 1).value =
      "Cantidad de guias por profesor";
    headerRow2.getCell(startColumn + 2).value =
      "Cantidad de lecturas por profesor";
    headerRow2.font = {
      name: "Calibri",
      size: 12,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    headerRow2.alignment = { vertical: "middle", horizontal: "center" };
    headerRow2.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF305496" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    const professorMap = new Map<
      string,
      { guides: number; readings: number }
    >();

    studentProfesorList.forEach((one) => {
      const professors = one.getProfessors();
      const advisor = professors.find(
        (professor) => +professor.isAdvisor === 1,
      );
      const nonAdvisors = professors.filter(
        (professor) => +professor.isAdvisor === 0,
      );

      if (advisor) {
        if (!professorMap.has(advisor.name)) {
          professorMap.set(advisor.name, { guides: 0, readings: 0 });
        }
        professorMap.get(advisor.name)!.guides += 1;
      }
      nonAdvisors.forEach((professor) => {
        if (professor.name !== "No asignado") {
          if (!professorMap.has(professor.name)) {
            professorMap.set(professor.name, { guides: 0, readings: 0 });
          }
          professorMap.get(professor.name)!.readings += 1;
        }
      });
    });

    let newTableRow = 6;
    professorMap.forEach((counts, professorName) => {
      if (counts.guides > 0 || counts.readings > 0) {
        const row = sheet.getRow(newTableRow);
        row.getCell(startColumn).value = professorName;
        row.getCell(startColumn + 1).value = counts.guides;
        row.getCell(startColumn + 2).value = counts.readings;

        row.eachCell((cell) => {
          cell.font = { name: "Arial", size: 10 };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        newTableRow++;
      }
    });
  }

  /**
   *Exports the presentations sheet for the students Excel file
   * @param ExcelFile The Excel file to export to.
   */
  public exportPresentationsSheet(ExcelFile: ExcelJS.Workbook): void {
    const sheet = this.removeAndAddSheet(ExcelFile, "Presentaciones");
    const presentationsList = this.studentProfessorDao.getPresentations();
    const studentList = this.studentDao.getStudents();

    sheet.getColumn(2).width = 10; // Aula
    sheet.getColumn(3).width = 35; // Estudiante
    sheet.getColumn(4).width = 20; // Carnet institucional
    sheet.getColumn(5).width = 20; // Hora de presentación
    sheet.getColumn(6).width = 25; // Fecha de presentación
    sheet.getColumn(7).width = 25; // Profesor Guía
    sheet.getColumn(8).width = 25; // Profesor Lector
    sheet.getColumn(9).width = 25; // Profesor Lector

    let currentRow = 2;
    let lastClassroom = "";
    let lastDate = "";

    presentationsList.forEach((presentation, index) => {
      const presentationDate = new Date(
        presentation.getStartTime(),
      ).toLocaleDateString();
      const classroom = presentation.getClassroom();

      if (classroom !== lastClassroom || presentationDate !== lastDate) {
        if (index > 0) {
          currentRow++;
        }
        const headerRow = sheet.getRow(currentRow);
        const headers = [
          "Aula",
          "Estudiante",
          "Carnet institucional",
          "Hora de Presentación",
          "Fecha de presentación",
          "Profesor Guía",
          "Profesor Lector",
          "Profesor Lector",
        ];
        headers.forEach((header, colIndex) => {
          const cell = headerRow.getCell(colIndex + 2);
          cell.value = header;
          cell.font = {
            name: "Calibri",
            size: 12,
            bold: true,
            color: { argb: "FFFFFFFF" },
          };
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF305496" },
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        currentRow++;
        lastClassroom = classroom;
        lastDate = presentationDate;
      }

      const student = presentation.getAttendees().getStudent();
      const professors = presentation.getAttendees().getProfessors();

      const advisor = professors.find((professor) => professor.isAdvisor);
      const nonAdvisors = professors.filter(
        (professor) => !professor.isAdvisor,
      );

      while (nonAdvisors.length < 2) {
        nonAdvisors.push({
          id: 0,
          name: "No asignado",
          email: "",
          isAdvisor: false,
        });
      }

      const row = sheet.getRow(currentRow);
      row.getCell(2).value = classroom;
      row.getCell(3).value = student.name;
      row.getCell(4).value = studentList
        .find((oneStudent) => oneStudent.getName() === student.name)
        ?.getUniversityId();
      row.getCell(5).value = new Date(
        presentation.getStartTime(),
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      row.getCell(6).value = presentationDate;
      row.getCell(7).value = advisor ? advisor.name : "No asignado";
      row.getCell(8).value = nonAdvisors[0]
        ? nonAdvisors[0].name
        : "No asignado";
      row.getCell(9).value = nonAdvisors[1]
        ? nonAdvisors[1].name
        : "No asignado";

      row.eachCell((cell) => {
        cell.font = { name: "Arial", size: 10 };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      currentRow++;
    });

    sheet.eachRow((row) => {
      row.height = 15;
    });

    let startRow = 3;
    while (startRow < currentRow) {
      let endRow = startRow;
      while (
        endRow < currentRow &&
        sheet.getRow(endRow).getCell(2).value ===
          sheet.getRow(startRow).getCell(2).value &&
        sheet.getRow(endRow).getCell(6).value ===
          sheet.getRow(startRow).getCell(6).value
      ) {
        endRow++;
      }
      endRow--;

      sheet.mergeCells(startRow, 2, endRow, 2);
      sheet.mergeCells(startRow, 6, endRow, 6);

      startRow = endRow + 1;
    }
  }

  public exportInvitationsSheet(ExcelFile: ExcelJS.Workbook): void {
    const presentations = this.studentProfessorDao.getPresentations();

    const calendarSheet = this.removeAndAddSheet(
      ExcelFile,
      "Invitaciones al Calendario",
    );
    const emailSheet = this.removeAndAddSheet(
      ExcelFile,
      "Invitaciones por correo",
    );

    const calendarHeaders = [
      "Asunto",
      "Lugar",
      "Fecha de comienzo",
      "Comienzo",
      "Fecha de finalizacion",
      "Finalizacion",
      "Asistentes (nombres)",
      "Attendees",
    ];

    const emailHeaders = [
      "Asunto",
      "Cuerpo",
      "Destinatarios (nombres)",
      "Destinatarios (correos)",
    ];

    calendarSheet.getRow(1).values = calendarHeaders;
    emailSheet.getRow(1).values = emailHeaders;

    presentations.forEach((presentation) => {
      const startTime = new Date(presentation.getStartTime());
      const endTime = new Date(presentation.getStartTime());
      endTime.setMinutes(
        endTime.getMinutes() + presentation.getMinuteDuration(),
      );
      const attendees = presentation.getAttendees();
      const student = attendees.getStudent();
      const professors = attendees.getProfessors();

      const advisor = professors.find((professor) => professor.isAdvisor);
      const nonAdvisors = professors.filter(
        (professor) => !professor.isAdvisor,
      );

      while (nonAdvisors.length < 2) {
        nonAdvisors.push({
          id: 0,
          name: "No asignado",
          email: "",
          isAdvisor: false,
        });
      }

      calendarSheet.addRow([
        `Defensa - ${student.name}`,
        presentation.getClassroom(),
        convertIsoStringToLocalDate(startTime, "hyphenated"),
        convertDateToLocalTime(startTime, false),
        convertIsoStringToLocalDate(endTime, "hyphenated"),
        convertDateToLocalTime(endTime, false),
        [
          student.name,
          advisor?.name || "",
          ...nonAdvisors.map((professor) => professor.name),
        ]
          .filter((name) => name)
          .join(", "),
        [
          student?.email || "",
          advisor?.email || "",
          ...nonAdvisors.map((professor) => professor.email),
        ]
          .filter((email) => email)
          .join(", "),
      ]);

      for (let i = 1; i < 9; i++) {
        const calendarColumn = calendarSheet.getColumn(i);
        calendarColumn.width = i == 1 ? 45 : 20;
        calendarColumn.alignment = { wrapText: true };
      }

      emailSheet.addRow([
        `Defensa - ${student.name}`,
        `Estimado(a) ${student.name}:\n\nSe le informa que su defensa de tesis está programada para el día ${convertIsoStringToLocalDate(startTime, "natural")} a las ${convertDateToLocalTime(startTime, true)} en el aula ${presentation.getClassroom()}.\n\nSaludos,`,
        [
          student.name,
          advisor?.name || "",
          ...nonAdvisors.map((professor) => professor.name),
        ]
          .filter((name) => name)
          .join(", "),
        [
          advisor?.email || "",
          ...nonAdvisors.map((professor) => professor.email),
        ]
          .filter((email) => email)
          .join(", "),
      ]);

      for (let i = 1; i < 5; i++) {
        const emailColumn = emailSheet.getColumn(i);
        emailColumn.width = i == 1 ? 40 : 56;
        emailColumn.alignment = { wrapText: true };
      }
    });
  }
}
