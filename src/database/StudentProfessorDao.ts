import StudentProfessor, {
  StudentProfessorInterface,
} from "../models/StudentProfessor";
import database from "./DatabaseProvider";
import Presentation from "../models/Presentation";
import { PresentationInterface } from "../interfaces/PresentationGeneration";

interface StudentProfessorRow {
  id: number | null;
  studentId: number;
  studentName: string;
  professorId: number | null;
  professorName: string | null;
  isAdvisor: boolean | null;
}

interface ProfessorsSuggestionsRow {
  professorId: number;
  name: string;
  students: number;
  suggestedStudents: number;
}

export default class StudentProfessorDao {
  /**
   * Gets all students and their professors.
   * @returns An array of StudentProfessor objects.
   */
  getStudentsProfessors(): StudentProfessor[] {
    const query = `
        SELECT
            sp.studentProfessorId AS id,
            s.studentId AS studentId,
            s.name AS studentName,
            p.professorId AS professorId,
            p.name AS professorName,
            sp.isAdvisor
        FROM
            Students s
        LEFT JOIN
            StudentProfessors sp ON s.studentId = sp.studentId
        LEFT JOIN
            Professors p ON sp.professorId = p.professorId
        Where S.isEnabled = 1;`;

    const rows: StudentProfessorRow[] = database
      .prepare(query)
      .all() as StudentProfessorRow[];

    const studentMap = new Map<number, StudentProfessorInterface>();

    rows.forEach((row) => {
      let studentProfessor = studentMap.get(row.studentId);

      if (!studentProfessor) {
        studentProfessor = {
          id: row.id,
          student: {
            id: row.studentId,
            name: row.studentName,
          },
          professors: [],
        };
        studentMap.set(row.studentId, studentProfessor);
      }

      if (row.professorId && row.professorName) {
        studentProfessor.professors.push({
          id: row.professorId,
          name: row.professorName,
          isAdvisor: row.isAdvisor ?? false,
        });
      }
    });

    return Array.from(studentMap.values()).map(
      (sp) => new StudentProfessor(sp.id, sp.student, sp.professors),
    );
  }

  /**
   * Assigns a professor to a student.
   * @param studentId The student ID.
   * @param professorId The professor ID.
   * @param isAdvisor Whether the professor is an advisor or not.
   */
  assignProfessor(
    studentId: number,
    professorId: number,
    isAdvisor: boolean,
  ): void {
    const queryCheck = `
      SELECT COUNT(*) AS count FROM StudentProfessors
      WHERE studentId = ? AND professorId = ?`;

    const queryInsert = `
      INSERT INTO StudentProfessors (studentId, professorId, isAdvisor)
      VALUES (?, ?, ?);`;

    const queryActivityAdvisor = `
      UPDATE Activities
      SET students = students + 1,
          load = (students + 1) * hours
      WHERE professorId = ? AND suggestedStudents IS NOT NULL;`;

    const queryActivityTribunal = `
      UPDATE Activities
      SET students = students + 1
      WHERE professorId = ? AND name = 'Proyecto de Graduación (tribunal)' AND workloadTypeId = 1;`;

    database.transaction(() => {
      const result: Record<string, number> = database
        .prepare(queryCheck)
        .get(studentId, professorId) as Record<string, number>;
      if (result.count > 0) {
        console.error("Este profesor ya está asignado a este estudiante.");
        return;
      }

      // Si no existe, procedemos a insertar y actualizar
      database
        .prepare(queryInsert)
        .run(studentId, professorId, isAdvisor ? 1 : 0);
      if (isAdvisor) {
        database.prepare(queryActivityAdvisor).run(professorId);
      } else {
        database.prepare(queryActivityTribunal).run(professorId);
      }
    })();
  }

  /**
   * Returns the professors suggestions.
   * @returns An array of ProfessorsSuggestionsRow objects.
   */
  getProfessorsSuggestions(): ProfessorsSuggestionsRow[] {
    const query = `SELECT P.professorId, P.name, A.students, A.suggestedStudents, A.activityId, hours
    FROM Activities A
    INNER JOIN Professors P ON P.professorId = A.professorId
    WHERE P.name IS NOT NULL AND A.students IS NOT NULL AND A.suggestedStudents IS NOT NULL
    `;

    const rows: ProfessorsSuggestionsRow[] = database
      .prepare(query)
      .all() as ProfessorsSuggestionsRow[];

    return rows;
  }

  addPresentations(
    presentations: PresentationInterface[],
    shouldClearTable: boolean = false,
  ): void {
    if (shouldClearTable) {
      const query = `DELETE FROM Presentations;`;
      database.prepare(query).run();
    }

    const query = `
      INSERT INTO Presentations (startTime, minuteDuration, classroom, studentId)
      VALUES (?, ?, ?, ?);`;

    database.transaction(() => {
      presentations.forEach((presentation) => {
        const { student, startTime, endTime, classroom } = presentation;
        const studentId = student.id;
        const minuteDuration =
          (endTime.getTime() - startTime.getTime()) / 60000;

        database
          .prepare(query)
          .run(startTime.toISOString(), minuteDuration, classroom, studentId);
      });
    })();
  }

  /**
   * Adds a presentation to the database.
   * @param studentId The student ID.
   * @param startTime The start time of the presentation.
   * @param duration The duration of the presentation.
   * @param classroom The classroom of the presentation.
   */
  addPresentation(
    studentId: number,
    startTime: Date,
    duration: number,
    classroom: string,
  ): void {
    const query = `
      INSERT INTO Presentations (startTime, minuteDuration, classroom, studentId)
      VALUES (?, ?, ?, ?);`;

    database
      .prepare(query)
      .run(startTime.toISOString(), duration, classroom, studentId);
  }

  /**
   * Retrieves presentations from the database.
   * @returns An array of Presentation objects.
   */
  getPresentations(): Presentation[] {
    const query = `
      SELECT presentationId                                                       AS id,
             startTime,
             minuteDuration,
             classroom,
             SP.studentProfessorId                                                AS studentProfessorId,
             S.studentId                                                          AS studentId,
             S.name                                                               AS studentName,
             S.email                                                              AS studentEmail,
             json_group_array(json_object(
               'id', Pr.professorId,
               'name', Pr.name,
               'email', Pr.email,
               'isAdvisor', SP.isAdvisor
                              )) AS professors
      FROM Presentations P
             INNER JOIN Students S ON P.studentId = S.studentId
             INNER JOIN StudentProfessors SP ON S.studentId = SP.studentId
             INNER JOIN Professors Pr ON SP.professorId = Pr.professorId
      GROUP BY P.classroom, P.startTime, P.presentationId
      ORDER BY P.classroom, P.startTime;`;

    const rows = database.prepare(query).all() as {
      id: number;
      startTime: string;
      minuteDuration: number;
      classroom: string;
      studentProfessorId: number;
      studentId: number;
      studentName: string;
      studentEmail: string;
      professors: string;
    }[];

    return rows.map((row) => {
      const professors = JSON.parse(row.professors) as {
        id: number;
        name: string;
        email: string;
        isAdvisor: number;
      }[];

      const attendees = professors.map((professor) => ({
        id: professor.id,
        name: professor.name,
        email: professor.email,
        isAdvisor: professor.isAdvisor !== 0,
      }));

      return new Presentation(
        row.id,
        row.startTime,
        row.minuteDuration,
        row.classroom,
        {
          id: row.studentProfessorId,
          student: {
            id: row.studentId,
            name: row.studentName,
            email: row.studentEmail,
          },
          professors: attendees,
        },
      );
    });
  }

  /**
   * Retrieves a presentation from the database.
   * @param id The presentation ID.
   * @returns A Presentation object.
   */
  getPresentation(id: number): Presentation {
    const query = `
      SELECT presentationId                                                       AS id,
             startTime,
             minuteDuration,
             classroom,
             SP.studentProfessorId                                                AS studentProfessorId,
             S.studentId                                                          AS studentId,
             S.name                                                               AS studentName,
             S.email                                                              AS studentEmail,
             json_group_array(json_object(
               'id', Pr.professorId,
               'name', Pr.name,
               'email', Pr.email,
               'isAdvisor', SP.isAdvisor
                              )) AS professors
      FROM Presentations P
             INNER JOIN Students S ON P.studentId = S.studentId
             INNER JOIN StudentProfessors SP ON S.studentId = SP.studentId
             INNER JOIN Professors Pr ON SP.professorId = Pr.professorId
      WHERE P.presentationId = ?
      GROUP BY P.classroom, P.startTime, P.presentationId
      ORDER BY P.classroom, P.startTime;`;

    const row = database.prepare(query).get(id) as {
      id: number;
      startTime: string;
      minuteDuration: number;
      classroom: string;
      studentProfessorId: number;
      studentId: number;
      studentName: string;
      studentEmail: string;
      professors: string;
    };

    const professors = JSON.parse(row.professors) as {
      id: number;
      name: string;
      email: string;
      isAdvisor: number;
    }[];

    const attendees = professors.map((professor) => ({
      id: professor.id,
      name: professor.name,
      email: professor.email,
      isAdvisor: professor.isAdvisor !== 0,
    }));

    return new Presentation(
      row.id,
      row.startTime,
      row.minuteDuration,
      row.classroom,
      {
        id: row.studentProfessorId,
        student: {
          id: row.studentId,
          name: row.studentName,
          email: row.studentEmail,
        },
        professors: attendees,
      },
    );
  }

  /**
   * Updates a presentation in the database.
   * @param presentationId The presentation ID.
   * @param startTime The start time of the presentation.
   * @param duration The duration of the presentation.
   * @param classroom The classroom of the presentation.
   */
  updatePresentation(
    presentationId: number,
    startTime: Date,
    duration: number,
    classroom: string,
  ): void {
    const query = `
      UPDATE Presentations
      SET startTime = ?,
          minuteDuration = ?,
          classroom = ?
      WHERE presentationId = ?;`;

    database
      .prepare(query)
      .run(startTime.toISOString(), duration, classroom, presentationId);
  }

  /**
   * Swaps two presentations.
   * @param presentationId1 The first presentation ID.
   * @param presentationId2 The second presentation ID.
   */
  swapPresentations(presentationId1: number, presentationId2: number): void {
    // Retrieve each studentId
    const query1 = `SELECT studentId FROM Presentations WHERE presentationId = ?;`;

    const studentId1 = (
      database.prepare(query1).get(presentationId1) as { studentId: number }
    ).studentId;
    const studentId2 = (
      database.prepare(query1).get(presentationId2) as { studentId: number }
    ).studentId;

    // Update the student in each presentation
    const query2 = `UPDATE Presentations SET studentId = ? WHERE presentationId = ?;`;

    database.transaction(() => {
      database.prepare(query2).run(studentId2, presentationId1);
      database.prepare(query2).run(studentId1, presentationId2);
    })();
  }

  /**
   * Deletes a presentation
   * @param presentationId The presentation ID.
   */
  deletePresentation(presentationId: number): void {
    const query = `DELETE
                   FROM Presentations
                   WHERE presentationId = ?;`;
    const result = database.prepare(query).run(presentationId);
    if (result.changes === 0) {
      console.error(`No presentation found with ID ${presentationId}.`);
    }
  }

  /**
   * Deletes all presentations.
   */
  deletePresentations(): void {
    const query = `DELETE FROM Presentations;`;
    database.prepare(query).run();
  }

  /**
   * Deletes all student-professor assignments.
   */
  deleteProfessorsAssigments(): void {
    const query = `DELETE FROM StudentProfessors`;
    const clearActivity = `UPDATE Activities SET students = 0, load = 0 WHERE suggestedStudents IS NOT NULL OR (name = 'Proyecto de Graduación (tribunal)' AND workloadTypeId = 1);`;
    database.transaction(() => {
      database.prepare(query).run();
      database.prepare(clearActivity).run();
    })();
  }

  /**
   * Deletes a student-professor relationship.
   * @param studentProfessorId The student-professor relationship ID.
   */
  deleteStudentProfessor(studentProfessorId: number | null): void {
    const query = `DELETE FROM StudentProfessors WHERE studentId = ?;`;
    const result = database.prepare(query).run(studentProfessorId);
    if (result.changes === 0) {
      console.error(
        `No student-professor relationship found with ID ${studentProfessorId}.`,
      );
    }
  }

  /**
   * Updates the student-professor relationships.
   * @param studentId
   * @param professorGuia
   * @param profesorLector1
   * @param profesorLector2
   */
  updateStudentProfessor(
    studentId: number,
    professorGuia: number,
    profesorLector1: number,
    profesorLector2: number,
  ): void {
    const query1 = `DELETE FROM StudentProfessors WHERE studentId = ?;`;
    const result1 = database.prepare(query1).run(studentId);
    if (result1.changes === 0) {
      console.error(
        `Problem with deletion of student-professor relationships.`,
      );
    }

    const query2 = `INSERT INTO StudentProfessors (professorId, studentId, isAdvisor) VALUES (?, ?, ?);`;
    const result2 = database.prepare(query2).run(professorGuia, studentId, 1);
    if (result2.changes === 0) {
      console.error(`Problem with insertion of advisor.`);
    }

    const query3 = `INSERT INTO StudentProfessors (professorId, studentId, isAdvisor) VALUES (?, ?, ?);`;
    const result3 = database.prepare(query3).run(profesorLector1, studentId, 0);
    if (result3.changes === 0) {
      console.error(`Problem with insertion of lector 1.`);
    }

    const query4 = `INSERT INTO StudentProfessors (professorId, studentId, isAdvisor) VALUES (?, ?, ?);`;
    const result4 = database.prepare(query4).run(profesorLector2, studentId, 0);
    if (result4.changes === 0) {
      console.error(`Problem with insertion of lector 2.`);
    }
  }

  /**
   * Updates the activity advisor.
   * @param oldAdvisorId
   * @param newAdvisorId
   */
  updateActivityAdvisor(oldAdvisorId: number, newAdvisorId: number): void {
    const query1 = `UPDATE Activities
SET students = students - 1
WHERE name = 'Proyecto Final de Graduación'
AND workloadTypeId = 1
AND suggestedStudents IS NOT NULL
AND professorId = ?;`;
    const result1 = database.prepare(query1).run(oldAdvisorId);
    if (result1.changes === 0) {
      console.error(
        `Problema de resta con la actualización del asesor de actividad.`,
      );
    }

    const query2 = `UPDATE Activities
SET students = students + 1
WHERE name = 'Proyecto Final de Graduación'
AND workloadTypeId = 1
AND suggestedStudents IS NOT NULL
AND professorId = ?;`;
    const result2 = database.prepare(query2).run(newAdvisorId);
    if (result2.changes === 0) {
      console.error(
        `Problema de suma con la actualización del asesor de actividad.`,
      );
    }

    const query3 = `SELECT *
FROM Activities
WHERE professorId = ?
AND students = suggestedStudents;`;
    const result3 = database.prepare(query3).get(newAdvisorId);
    if (result3) {
      const query4 = `UPDATE Activities SET workloadTypeId = 5 WHERE professorId = ?;`;
      const result4 = database.prepare(query4).run(newAdvisorId);
      if (result4.changes === 0) {
        console.error(`Problem with update workload type of advisor.`);
      }
    }
  }

  /**
   * Updates the activity lector.
   * @param oldLectorId
   * @param newLectorId
   */
  updateActivityLector(oldLectorId: number, newLectorId: number): void {
    const query1 = `UPDATE Activities
SET students = students - 1
WHERE name = 'Proyecto de Graduación (tribunal)'
AND workloadTypeId = 1
AND professorId = ?;`;
    const result1 = database.prepare(query1).run(oldLectorId);
    if (result1.changes === 0) {
      console.error(`Problem with update of activity lector.`);
    }

    const query2 = `UPDATE Activities
SET students = students + 1
WHERE name = 'Proyecto de Graduación (tribunal)'
AND workloadTypeId = 1
AND professorId = ?;`;
    const result2 = database.prepare(query2).run(newLectorId);
    if (result2.changes === 0) {
      console.error(`Problem with update of activity lector.`);
    }
  }

  /**
   * Get the amount of students assigned to a professor.
   * @param professorId
   * @returns The amount of students assigned to the professor.
   */
  getStudentsByProfessorId(professorId: number): number | null {
    const query = `SELECT students FROM Activities WHERE name = "Proyecto Final de Graduación" AND suggestedStudents IS NOT NULL AND professorId = ?;`;
    const result = database.prepare(query).get(professorId);
    if (typeof result === "number") {
      return result;
    } else {
      return null;
    }
  }

  /**
   * Get the amount of suggested students assigned to a professor.
   * @param professorId
   * @returns The amount of suggested students assigned to the professor.
   */
  getSuggestedStudentsByProfessorId(professorId: number): number | null {
    const query = `SELECT suggestedStudents FROM Activities WHERE name = "Proyecto Final de Graduación" AND suggestedStudents IS NOT NULL AND professorId = ?;`;
    const result = database.prepare(query).get(professorId);
    if (typeof result === "number") {
      return result;
    } else {
      return null;
    }
  }
}
