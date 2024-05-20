import StudentProfessor, {
  StudentProfessorInterface,
} from "../models/StudentProfessor";
import database from "./DatabaseProvider";

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

    const queryActivity = `
      UPDATE Activities
      SET students = students + 1,
          load = (students + 1) * hours
      WHERE professorId = ? AND suggestedStudents IS NOT NULL;`;

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
        database.prepare(queryActivity).run(professorId);
      }
    })();
  }

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
}
