import database from "./DatabaseProvider";
import Professor from "../models/Professor";
import Course from "../models/Course";
import ImportedWorkload from "../models/ImportedWorkload";
import CourseSchedule from "../models/CourseSchedule";
import { projectCourses } from "../constants/Courses";
import Workload, { WorkloadInterface } from "../models/Workload";

interface ProfessorRow {
  id: number;
  name: string;
  email: string;
  type: string;
}

interface ExperienceFactor {
  experience:
    | "New"
    | "Existing"
    | "Taught before"
    | "Parallel 1"
    | "Parallel 2";
  courseType: "Theoretical" | "Practical" | "Project" | "Theoretical-Practical";
  factor: number;
}

export interface StudentFactor {
  courseType: "Theoretical" | "Practical" | "Theoretical-Practical";
  minStudents: number;
  minHours: number;
  factor: number;
}

export default class ProfessorDao {
  /**
   * Adds a professor to the database.
   * Throws an error if the professor could not be added.
   * @param professor The professor to be added.
   * @returns The professor that was added.
   */
  addProfessor(professor: Professor): Professor {
    const query = `
      INSERT INTO Professors (name, email, professorTypeId)
      VALUES (?, ?, (SELECT professorTypeId FROM ProfessorTypes WHERE typeName = ?));`;
    const result = database
      .prepare(query)
      .run(professor.getName(), professor.getEmail(), professor.getType());
    if (result.changes === 0) {
      throw new Error(`Failed to add professor: ${professor.getName()}`);
    }

    const id = result.lastInsertRowid;
    return this.getProfessorById(id as number);
  }

  /**
   * Adds multiple professors into the database.
   * Continues adding professors even if one fails, collecting errors for each failed insertion.
   * @param list Array of Professor objects to be added.
   * @param shouldClearList Whether to clear the list of professors before adding new ones.
   * @returns An object containing two arrays: one for the professors added successfully, and another for errors.
   */
  addProfessors(
    list: Professor[],
    shouldClearList: boolean = false,
  ): {
    successfulInserts: Professor[];
    errors: Professor[];
  } {
    const successfulInserts: Professor[] = [];
    const errors: Professor[] = [];

    const insertQuery = database.prepare(`
      INSERT INTO Professors (name, professorTypeId)
      VALUES (?, (SELECT professorTypeId FROM ProfessorTypes WHERE typeName = ?));
    `);

    database.transaction(() => {
      if (shouldClearList) {
        database
          .prepare(
            `
            DELETE
            FROM ActivityCourses;`,
          )
          .run();
        database
          .prepare(
            `
            DELETE
            FROM Activities;`,
          )
          .run();
        database
          .prepare(
            `
            DELETE
            FROM Professors;`,
          )
          .run();
      }

      list.forEach((professor) => {
        try {
          const result = insertQuery.run(
            professor.getName(),
            professor.getType(),
          );
          if (result.changes === 0) {
            throw new Error(
              `Failed to insert professor: ${professor.getName()}`,
              { cause: professor },
            );
          }
          successfulInserts.push(professor);
        } catch (error) {
          console.error(error);
          errors.push(professor);
        }
      });
    })();

    return { successfulInserts, errors };
  }

  /**
   * Gets a professor from the database.
   * @param id The id of the professor to get.
   * @returns The professor with the given id.
   */
  getProfessorById(id: number): Professor {
    const query = `
      SELECT name, professorId AS 'id', email, typeName as type
      FROM Professors
        JOIN ProfessorTypes USING (professorTypeId)
      WHERE professorId = ?`;
    const readQuery = database.prepare(query);
    const row = readQuery.get(id) as ProfessorRow;
    if (!row) {
      throw new Error(`No professor found with ID ${id}`);
    }
    return new Professor(row.id, row.type, row.name, row.email);
  }

  /**
   * Gets a list of all professors in the database.
   * @returns A list of all professors in the database.
   */
  getProfessors(): Professor[] {
    const query = `
      SELECT professorId AS 'id', name, email, typeName as type
      FROM Professors
       JOIN ProfessorTypes USING (professorTypeId)`;
    const readQuery = database.prepare(query);
    const rowList = readQuery.all() as ProfessorRow[];
    return rowList.map(
      (row) => new Professor(row.id, row.type, row.name, row.email),
    );
  }

  /**
   * Updates a professor in the database.
   * Throws an error if the professor could not be updated.
   * @param professor The professor to update.
   * @returns The updated professor.
   */
  updateProfessor(professor: Professor): Professor {
    const query = `
      UPDATE Professors
      SET name            = ?,
          email           = ?,
          professorTypeId = (SELECT professorTypeId FROM ProfessorTypes WHERE typeName = ?)
      WHERE professorId = ?;`;
    const result = database
      .prepare(query)
      .run(
        professor.getName(),
        professor.getEmail(),
        professor.getType(),
        professor.getId(),
      );
    if (result.changes === 0) {
      throw new Error(`Failed to update professor: ${professor.getName()}`);
    }

    return this.getProfessorById(professor.getId() as number);
  }

  /**
   * Deletes a professor from the database.
   * Throws an error if the professor could not be deleted.
   */
  deleteProfessor(id: number): void {
    const query = `DELETE
                   FROM Professors
                   WHERE professorId = ?;`;
    const result = database.prepare(query).run(id);
    if (result.changes === 0) {
      throw new Error(`No professor found with ID ${id} to delete.`);
    }
  }

  /**
   * Adds multiple courses into the database.
   * Continues adding courses even if one fails, collecting errors for each failed insertion.
   * @param list Array of Course objects to be added.
   * @param shouldClearList Whether to clear the list of courses before adding new ones.
   * @returns An object containing two arrays: one for the courses added successfully, and another for errors.
   */
  addCourseHours(
    list: Course[],
    shouldClearList: boolean = false,
  ): {
    successfulInserts: Course[];
    errors: Course[];
  } {
    const successfulInserts: Course[] = [];
    const errors: Course[] = [];

    const insertQuery = database.prepare(`
      INSERT INTO Courses (code, name, hours, courseTypeID)
      VALUES (?, ?, ?, (SELECT courseTypeId FROM CourseTypes WHERE name = ?));`);

    database.transaction(() => {
      if (shouldClearList) {
        database
          .prepare(
            `
            DELETE
            FROM ActivityCourses;`,
          )
          .run();
        database
          .prepare(
            `
            DELETE
            FROM Activities;`,
          )
          .run();
        database
          .prepare(
            `
            DELETE
            FROM Courses;`,
          )
          .run();
      }

      list.forEach((course) => {
        try {
          const result = insertQuery.run(
            course.getCode(),
            course.getName(),
            course.getHours(),
            course.getType(),
          );
          if (result.changes === 0) {
            throw new Error(`Failed to insert course: ${course.getName()}`, {
              cause: course,
            });
          }
          successfulInserts.push(course);
        } catch (error) {
          console.error(error);
          errors.push(course);
        }
      });
    })();

    return { successfulInserts, errors };
  }

  /**
   * Gets experience and student factors from the database
   * @returns An object containing two arrays: one for experience factors and another for student factors.
   */
  getCourseFactors(): {
    experienceFactors: ExperienceFactor[];
    studentFactors: StudentFactor[];
  } {
    const experienceFactorQuery = `
      SELECT CE.name 'experience', CT.name 'courseType', EF.factor
      FROM ExperienceFactors EF
        JOIN main.CourseExperiences CE ON EF.courseExperienceId = CE.courseExperienceId
        JOIN main.CourseTypes CT ON EF.courseTypeId = CT.courseTypeId;`;

    const studentFactorQuery = `
      SELECT CT.name 'courseType', SF.minStudents, SF.minHours, SF.factor
      FROM StudentFactors SF
        JOIN main.CourseTypes CT on CT.courseTypeId = SF.courseTypeId;`;

    const experienceFactors = database
      .prepare(experienceFactorQuery)
      .all() as ExperienceFactor[];
    const studentFactors = database
      .prepare(studentFactorQuery)
      .all() as StudentFactor[];

    return { experienceFactors, studentFactors };
  }

  /**
   * Inserts all workload data into the database.
   * @param workload List of workload objects to be added.
   * @param courseSchedule List of course schedule objects to be added.
   * @param shouldClearList Whether to clear the list of workload data before adding new ones.
   */
  addWorkloadData(
    workload: { professor: string; workload: ImportedWorkload[] }[],
    courseSchedule: CourseSchedule[],
    shouldClearList: boolean = false,
  ): void {
    database.transaction(() => {
      // Clear tables if requested
      if (shouldClearList) {
        database
          .prepare(
            `
            DELETE
            FROM ActivityCourses;`,
          )
          .run();
        database
          .prepare(
            `
            DELETE
            FROM Activities;`,
          )
          .run();
      }
      // Start by creating the temporary tables
      database
        .prepare(
          `
          CREATE TEMP TABLE rawWorkload (
            type TEXT,
            loadType TEXT,
            code TEXT,
            name TEXT,
            hours INTEGER,
            students INTEGER,
            workload REAL,
            professorName TEXT,
            groupNumber INTEGER,
            suggestedStudents INTEGER
          );`,
        )
        .run();

      database
        .prepare(
          `
          CREATE TEMP TABLE rawCourseSchedules (
            code TEXT,
            name TEXT,
            professorName TEXT,
            students INTEGER,
            experienceFactor REAL,
            studentFactor REAL,
            groupNumber INTEGER
          );`,
        )
        .run();

      const insertWorkloadQuery = database.prepare(`
        INSERT INTO rawWorkload (
          type, loadType, code, name, hours, students, workload, professorName, groupNumber, suggestedStudents
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);

      const insertCourseSchedulesQuery = database.prepare(`
        INSERT INTO rawCourseSchedules (
          code, name, professorName, students, experienceFactor, studentFactor, groupNumber
        )
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `);

      // Add workload data
      workload.forEach((w) => {
        w.workload.forEach((workloadEntry) => {
          insertWorkloadQuery.run(
            workloadEntry.getType(),
            workloadEntry.getLoadType(),
            workloadEntry.getCode(),
            workloadEntry.getName(),
            workloadEntry.getHours(),
            projectCourses.includes(workloadEntry.getCode() || "")
              ? 0
              : workloadEntry.getStudents(),
            projectCourses.includes(workloadEntry.getCode() || "")
              ? 0
              : workloadEntry.getWorkload(),
            w.professor,
            workloadEntry.getGroupNumber(),
            projectCourses.includes(workloadEntry.getCode() || "")
              ? workloadEntry.getStudents()
              : null,
          );
        });
      });

      // Add course workload data
      courseSchedule.forEach((course) => {
        course.getProfessors().forEach((professor) => {
          insertCourseSchedulesQuery.run(
            course.getCode(),
            course.getName(),
            professor.name,
            professor.students,
            professor.experienceFactor,
            professor.studentFactor,
            professor.groupNumber,
          );
        });
      });

      // Insert activities
      database
        .prepare(
          `
          INSERT INTO Activities (activityTypeId, name, hours, students, load, workloadTypeId, professorId, groupNumber, suggestedStudents)
          SELECT AT.activityTypeId,
            COALESCE(C.name, rWL.name),
            COALESCE(C.hours, rWL.hours),
            rWL.students,
            rWL.workload,
            WT.workloadTypeId,
            P.professorId,
            rWL.groupNumber,
            rWL.suggestedStudents
          FROM rawWorkload rWL
          JOIN ActivityTypes AT
            ON AT.name = rWL.type
          LEFT OUTER JOIN Courses C
            ON C.code = rWL.code
          JOIN WorkloadTypes WT
            ON rWL.loadType = WT.name
          JOIN Professors P
          ON P.name = rWL.professorName;`,
        )
        .run();

      // Insert course-specific data
      database
        .prepare(
          `
          INSERT INTO ActivityCourses (activityId, courseId, studentFactorId, courseExperienceId)
          SELECT A.activityId, C.courseId, SF.studentFactorId, CE.courseExperienceId
          FROM Activities A
            JOIN ActivityTypes AT
              ON A.activityTypeId = AT.activityTypeId
                AND AT.name = 'course'
            JOIN Courses C
              ON C.name = A.name
            JOIN Professors P
              ON A.professorId = P.professorId
            JOIN rawCourseSchedules rCW
              ON rCW.code = C.code
                AND rCW.professorName = P.name
                AND rCW.groupNumber = A.groupNumber
            JOIN StudentFactors SF
              ON SF.factor = rCW.studentFactor
            JOIN ExperienceFactors EF
              ON EF.factor = rCW.experienceFactor
            JOIN CourseTypes CT
              ON (SF.courseTypeId = CT.courseTypeId OR SF.courseTypeId IS NULL)
                AND (EF.courseTypeId = CT.courseTypeId OR EF.courseTypeId IS NULL)
                AND CT.courseTypeId = C.courseTypeId
            JOIN CourseExperiences CE
              ON EF.courseExperienceId = CE.courseExperienceId
          WHERE rCW.groupNumber IS NOT NULL
          UNION
          SELECT A.activityId, C.courseId, NULL, NULL
          FROM Activities A
            JOIN ActivityTypes AT
              ON A.activityTypeId = AT.activityTypeId
                AND AT.name = 'course'
            JOIN Courses C
              ON C.name = A.name
            JOIN Professors P
              ON A.professorId = P.professorId
            JOIN rawCourseSchedules rCW
              ON rCW.code = C.code
                AND rCW.professorName = P.name
                AND rCW.groupNumber IS NULL
                AND A.groupNumber IS NULL;`,
        )
        .run();

      // DROP TEMPORARY TABLES
      database.prepare("DROP TABLE rawWorkload;").run();
      database.prepare("DROP TABLE rawCourseSchedules;").run();
    })();
  }

  /**
   * Gets a professor's workload by professor ID.
   * @param professorId The ID of the professor.
   * @returns A list of workload objects for the professor.
   */
  getWorkloadByProfessorId(professorId: number): Workload[] {
    return (database.prepare(`SELECT
                                     A.activityId               AS 'activityId',
                                     AT.name                    AS 'activityType',
                                     WT.name                    AS 'workloadType',
                                     C.code                     AS 'code',
                                     COALESCE(C.name, A.name)   AS 'name',
                                     COALESCE(C.hours, A.hours) AS 'hours',
                                     A.students                 AS 'students',
                                     A.suggestedStudents        AS 'suggestedStudents',
                                     A.groupNumber              AS 'groupNumber',
                                     A.load                     AS 'workload',
                                     CASE
                                       WHEN SF.factor IS NOT NULL AND EF.factor IS NOT NULL THEN
                                         (EF.factor * C.hours + SF.factor) /
                                         (SELECT COUNT(P2.professorId)
                                          FROM Professors P2
                                                 JOIN Activities A2
                                                      ON P2.professorId = A2.professorId
                                                 JOIN ActivityCourses AC2
                                                      ON A2.activityId = AC2.activityId
                                                 JOIN Courses C2
                                                      ON AC2.courseId = C2.courseId

                                          WHERE C2.code = C.code
                                            AND A2.groupNumber = A.groupNumber)
                                       ELSE A.students * A.hours
                                       END                      AS 'suggestedWorkload'
                              FROM Activities A
                                     JOIN Professors P
                                          ON A.professorId = P.professorId
                                     LEFT JOIN ActivityCourses AC
                                               ON A.activityId = AC.activityId
                                     LEFT JOIN Courses C
                                               ON AC.courseId = C.courseId
                                     JOIN WorkloadTypes WT
                                          ON A.workloadTypeId = WT.workloadTypeId
                                     JOIN ActivityTypes AT
                                          ON A.activityTypeId = AT.activityTypeId
                                     LEFT JOIN StudentFactors SF
                                               ON AC.studentFactorId = SF.studentFactorId
                                     LEFT JOIN CourseExperiences CE
                                               ON AC.courseExperienceId = CE.courseExperienceId
                                     LEFT JOIN ExperienceFactors EF
                                               ON CE.courseExperienceId = EF.courseExperienceId
                                                 AND EF.courseTypeId = C.courseTypeId
                              WHERE P.professorId = ?
                              ORDER BY AT.name;`).all(professorId) as WorkloadInterface[]).map((workload) => Workload.reinstantiate(workload)!);
  }
}
