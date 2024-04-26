import ProfessorDao, { StudentFactor } from "../database/ProfessorDao";
import ExcelDao from "../database/ExcelDao";
import Professor from "../models/Professor";
import Course from "../models/Course";
import { stringSimilarity } from "string-similarity-js";
import Workload from "../models/Workload";
import CourseSchedule from "../models/CourseSchedule";

const projectCourses = ["CM4300", "CM5300", "CM5331"];

export default class ProfessorController {
  private professorDao: ProfessorDao;
  private excelDao: ExcelDao;

  constructor() {
    this.professorDao = new ProfessorDao();
    this.excelDao = new ExcelDao();
  }

  /**
   * Adds a professor to the database.
   * Throws an error if the professor could not be added.
   * @param type The type of the professor.
   * @param name The name of the professor.
   * @param email The email of the professor.
   * @returns The professor that was added.
   */
  public addProfessor(
    type: string,
    name: string,
    email?: string | null,
  ): Professor {
    const professor = new Professor(null, type, name, email || null);
    return this.professorDao.addProfessor(professor);
  }

  /**
   * Imports a list of professors from an Excel file.
   * @param fileBuffer The Excel file's array buffer.
   * @returns An object containing two arrays: one for the professors added successfully, and another for errors.
   */
  public importProfessors(fileBuffer: ArrayBuffer): {
    successfulInserts: Professor[];
    errors: Professor[];
  } {
    const professors = this.excelDao.getProfessors(fileBuffer);
    return this.professorDao.addProfessors(professors, true);
  }

  /**
   * Gets a professor from the database.
   * @param id The id of the professor to get.
   * @returns The professor with the given id.
   */
  public getProfessorById(id: number): Professor | null {
    return this.professorDao.getProfessorById(id);
  }

  /**
   * Gets all professors from the database.
   * @returns An array of all professors.
   */
  public getProfessors(): Professor[] {
    return this.professorDao.getProfessors();
  }

  /**
   * Updates a professor in the database.
   * Throws an error if the professor could not be added.
   * @param id The ID of the professor to update.
   * @param type The type of the professor.
   * @param name The name of the professor.
   * @param email The email of the professor.
   * @returns The professor that was updated.
   */
  public updateProfessor(
    id: number,
    type: string,
    name: string,
    email?: string | null,
  ): Professor {
    const professor = new Professor(id, type, name, email || null);
    return this.professorDao.updateProfessor(professor);
  }

  /**
   * Deletes a professor from the database.
   * @param id The id of the professor to delete.
   */
  public deleteProfessor(id: number): void {
    this.professorDao.deleteProfessor(id);
  }

  /**
   * Imports a list of courses from an Excel file.
   * @param fileBuffer The Excel file's array buffer.
   * @returns An object containing two arrays: one for the courses added successfully, and another for errors.
   */
  public async importCourses(fileBuffer: ArrayBuffer): Promise<{
    successfulInserts: Course[];
    errors: Course[];
  }> {
    //const coursesGuide = this.excelDao.getHourGuide(fileBuffer);
    const courseHours = this.excelDao.getCourseHours(fileBuffer);
    const courseSchedule = this.excelDao.getCourseSchedule(fileBuffer);
    const workload = await this.excelDao.getProfessorWorkload(fileBuffer);

    // Combine professors with their courses and workloads
    // And update experience factors

    const courseFactors = this.professorDao.getCourseFactors();

    courseSchedule.forEach((courseScheduleEntry) => {
      const courseAsObject = courseScheduleEntry.asObject();
      courseAsObject.professors.forEach((professor) => {
        let workloadEntry:
          | { professor: string; workload: Workload[] }
          | undefined = workload.find(
          (entry) => entry.professor === professor.name,
        );

        if (!workloadEntry) {
          // No workload entry found for this professor
          // Try to find a similar match
          let bestMatchScore = 0;
          workload.forEach((entry) => {
            try {
              const similarity = stringSimilarity(
                entry.professor,
                professor.name,
              );
              if (similarity > bestMatchScore) {
                bestMatchScore = similarity;
                workloadEntry = entry;
              }
            } catch (e) {
              console.error(e);
            }
          });

          if (workloadEntry && bestMatchScore >= 0.8) {
            // A match was found
            // TODO: Add a warning to the user
            console.warn(
              "Match found: " +
                professor.name +
                " → " +
                (workloadEntry as { professor: string; workload: Workload[] })
                  .professor,
            );
          } else {
            // TODO: Add an error to the user
            console.error(
              "No workload entry found for professor: " + professor.name,
            );
            if (workloadEntry) {
              console.error(
                `Best match (${bestMatchScore}): ` +
                  (
                    workloadEntry as {
                      professor: string;
                      workload: Workload[];
                    }
                  ).professor,
              );
            }
            return;
          }
        }

        // Find the course in the professor's workload
        const courseWorkload = workloadEntry.workload.find(
          (entry) =>
            entry.getCode() === courseScheduleEntry.getCode() &&
            (entry.getGroupNumber() === professor.groupNumber ||
              courseSchedule.filter(
                (c) => c.getCode() === courseScheduleEntry.getCode(),
              ).length === 1),
        );

        if (!courseWorkload) {
          // No course workload entry found for this professor
          // TODO: Add an error to the user
          console.error(
            "No workload entry found for course " +
              courseScheduleEntry.getCode() +
              " and professor " +
              workloadEntry.professor,
          );
          return;
        }

        // In multi-professor courses, the number of students is provided by the workload
        // In single-professor courses, the number of students is already provided by the course schedule
        if (courseScheduleEntry.getProfessors().length > 1) {
          // Add the number of students to the course schedule
          professor.students = courseWorkload.getStudents() || 0;
        }

        // From this point on, project courses are ignored
        if (
          projectCourses.includes(
            courseScheduleEntry.getCode().trim().toUpperCase(),
          )
        ) {
          return;
        }

        // Course factors are not explicitly stated in the Excel file
        // The student factor (which varies with student number and course hours)
        // can be calculated easily
        // The experience factor (whether the course has been taught before, etc.)
        // can be calculated as the result of an equation

        // Load = (ExperienceFactor * CourseHours + StudentFactor) / Professors

        // Get student factor
        const matchingCourse = courseHours.find(
          (course) => course.getCode() === courseScheduleEntry.getCode(),
        );

        if (!matchingCourse) {
          console.error(
            'Course not found in "horasCurso": ' +
              courseScheduleEntry.getCode() +
              ".",
          );
          return;
        }

        const matchingStudentFactor: StudentFactor | undefined =
          courseFactors.studentFactors.findLast(
            (studentFactor) =>
              studentFactor.courseType == matchingCourse.getType() &&
              studentFactor.minStudents <= professor.students &&
              studentFactor.minHours <= matchingCourse.getHours(),
          );

        if (!matchingStudentFactor) {
          console.error(
            "No student factor found for course " +
              courseScheduleEntry.getName() +
              " (" +
              courseScheduleEntry.getCode() +
              ") and professor " +
              professor.name +
              ".",
          );
          return;
        }

        // ExperienceFactor = (Load * Professors - StudentFactor) / CourseHours
        const experienceFactor =
          (courseWorkload.getWorkload() *
            (courseScheduleEntry.getProfessors().length || 1) -
            matchingStudentFactor.factor) /
          courseWorkload.getHours()!;

        // See if the experience factor exists
        // Otherwise, find the closest one
        let closestExperienceFactor: number | null = null;
        let smallestDifference: number | null = null;

        courseFactors.experienceFactors
          .filter((factor) => factor.courseType == matchingCourse.getType())
          .forEach((factor) => {
            const currentFactor = factor.factor;
            const currentDifference = Math.abs(
              currentFactor - experienceFactor,
            );

            if (
              closestExperienceFactor === null ||
              smallestDifference === null ||
              currentDifference < smallestDifference
            ) {
              closestExperienceFactor = currentFactor;
              smallestDifference = currentDifference;
            }
          });

        if (smallestDifference !== 0) {
          console.warn(
            "Experience factor " +
              experienceFactor +
              ' not found for course type "' +
              matchingCourse.getType() +
              '". Used closest match instead: ' +
              closestExperienceFactor +
              ". Course: " +
              matchingCourse.getCode() +
              ". Professor: " +
              professor.name +
              ".",
          );
        }

        professor.experienceFactor = closestExperienceFactor;
        professor.studentFactor = matchingStudentFactor.factor;
      });
      courseScheduleEntry = CourseSchedule.reinstantiate(
        courseAsObject,
      ) as CourseSchedule;
    });

    console.log(courseHours);
    console.log(courseSchedule);
    console.log(workload);

    const result = this.professorDao.addCourseHours(courseHours, true);

    this.professorDao.addWorkloadData(
      workload.map((w) => ({
        professor: w.professor,
        workload: w.workload.filter(
          (professorWorkload) =>
            !projectCourses.includes(professorWorkload.getCode() || ""),
        ),
      })),
      courseSchedule.filter((c) => !projectCourses.includes(c.getCode())),
    );

    return result;
  }
}
