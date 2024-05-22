import StudentProfessor, {
  StudentProfessorInterface,
} from "../models/StudentProfessor";
import database from "./DatabaseProvider";
import Presentation from "../models/Presentation";

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
            Professors p ON sp.professorId = p.professorId;`;

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
             json_array('id', Pr.professorId, 'name', Pr.name, 'email', Pr.email, 'isAdvisor', SP.isAdvisor) AS professors
      FROM Presentations P
             INNER JOIN Students S ON P.studentId = S.studentId
             INNER JOIN StudentProfessors SP ON S.studentId = SP.studentId
             INNER JOIN Professors Pr ON SP.professorId = Pr.professorId;`;

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
}
