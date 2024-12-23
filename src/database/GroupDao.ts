import Group from "../models/Group";
import database from "./DatabaseProvider";
import Student, { StudentInterface } from "../models/Student";
import Professor from "../models/Professor";

interface GroupRow {
  groupId: number;
  groupNumber: number;
  classroom: string;
  students: string;
  professors: string;
  moderator: string | null;
}

/**
 * Data access object for groups.
 */

export default class GroupDao {
  /**
   * Adds a group to the database.
   * Throws an error if the group could not be added.
   * @param group The group to be added.
   * @returns The group that was added.
   */
  addGroup(group: Group): {
    success: boolean;
  } {
    const insertQuery = database.prepare(`
      INSERT INTO Groups (groupNumber, classroom)
      VALUES (?, ?);
    `);

    const insertProfessorsQuery = database.prepare(`
      INSERT INTO GroupProfessors (groupId, professorId, isModerator)
      VALUES (?, ?, ?);
    `);

    const insertStudentsQuery = database.prepare(`
      INSERT INTO GroupStudents (groupId, studentId)
      VALUES (?, ?);
    `);

    try {
      database.transaction(() => {
        // Insert the group into Groups table
        insertQuery.run(group.getGroupNumber(), group.getClassroom());
        const lastId = database
          .prepare(`SELECT last_insert_rowid();`)
          .get() as { "last_insert_rowid()": number };
        const id = lastId["last_insert_rowid()"];

        // Insert all associated professors
        group.getProfessors().forEach((professor) => {
          insertProfessorsQuery.run(
            id,
            professor.getId(),
            professor.getId() === group.getModerator()?.getId() ? 1 : 0,
          );
        });

        // Insert all associated students
        group.getStudents().forEach((student) => {
          insertStudentsQuery.run(id, student.getId());
        });
      })();
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Adds multiple groups into the database.
   * Continues adding groups even if one fails, collecting errors for each failed insertion.
   * @param list Array of Group objects to be added.
   * @param shouldClearList Whether to clear the list of groups before adding new ones.
   * @returns An object containing two arrays: one for the groups added successfully, and another for errors.
   */
  addGroups(list: Group[]): {
    successfulInserts: Group[];
    errors: Group[];
  } {
    const successfulInserts: Group[] = [];
    const errors: Group[] = [];

    const insertQuery = database.prepare(`
        INSERT INTO Groups (groupNumber, classroom)
        VALUES (?, ?);
        `);

    const insertProfessorsQuery = database.prepare(`
        INSERT INTO GroupProfessors (groupId, professorId, isModerator)
        VALUES (?, ?, ?);
        `);

    const insertStudentsQuery = database.prepare(`
        INSERT INTO GroupStudents (groupId, studentId)
        VALUES (?, ?);
        `);

    database.transaction(() => {
      list.forEach((group) => {
        try {
          insertQuery.run(group.getGroupNumber(), group.getClassroom());
          const lastId = database
            .prepare(`SELECT last_insert_rowid();`)
            .get() as { "last_insert_rowid()": number };
          const id = lastId["last_insert_rowid()"];
          group.getProfessors().forEach((professor) => {
            insertProfessorsQuery.run(
              id,
              professor.getId(),
              professor.getId() == group.getModerator()?.getId() ? 1 : 0,
            );
          });
          group.getStudents().forEach((student) => {
            insertStudentsQuery.run(id, student.getId());
          });
          successfulInserts.push(group);
        } catch (error) {
          errors.push(group);
        }
      });
    })();
    return { successfulInserts, errors };
  }

  /**
   * Retrieves a group from the database by its ID.
   * @param id The ID of the group to retrieve.
   * @returns The group with the specified ID.
   */
  getGroupById(id: number): Group {
    const query = `
    SELECT 
    Groups.groupId,
    Groups.groupNumber,
    Groups.classroom,
    (
        SELECT json_group_array(json_object('id', studentId, 'name', name, 'email', email, 'phoneNumber', phoneNumber, 'universityId', universityId, 'isEnabled', isEnabled))
        FROM (
            SELECT DISTINCT Students.studentId, Students.name, Students.phoneNumber, Students.email, Students.universityId, Students.isEnabled
            FROM GroupStudents
            JOIN Students ON GroupStudents.studentId = Students.studentId
            WHERE GroupStudents.groupId = Groups.groupId AND Students.isEnabled = 1
        )
    ) AS students,
    (
        SELECT json_group_array(json_object('id', professorId, 'name', name, 'type', typeName, 'email', email))
        FROM (
            SELECT DISTINCT Professors.professorId, Professors.name, Professors.email, ProfessorTypes.typeName
            FROM GroupProfessors
            JOIN Professors ON GroupProfessors.professorId = Professors.professorId
            JOIN ProfessorTypes ON Professors.professorTypeId = ProfessorTypes.professorTypeId
            WHERE GroupProfessors.groupId = Groups.groupId
        )
    ) AS professors,
    (
        SELECT json_object('id', professorId, 'name', name, 'type', typeName, 'email', email)
        FROM (
            SELECT Professors.professorId, Professors.name, Professors.email, ProfessorTypes.typeName
            FROM GroupProfessors
            JOIN Professors ON GroupProfessors.professorId = Professors.professorId
            JOIN ProfessorTypes ON Professors.professorTypeId = ProfessorTypes.professorTypeId
            WHERE GroupProfessors.groupId = Groups.groupId AND GroupProfessors.isModerator = 1
        )
    ) AS moderator
FROM 
    Groups
WHERE Groups.groupId = ?
GROUP BY 
    Groups.groupId, Groups.groupNumber, Groups.classroom;

`;

    const row = database.prepare(query).get(id) as GroupRow;
    if (!row) {
      throw new Error(`Group not found: ${id}`);
    }

    const students = JSON.parse(row.students).map(
      (student: {
        id: number | null;
        name: string;
        phoneNum: string;
        email: string;
        universityId: string;
        isEnabled: boolean;
      }) =>
        new Student(
          student.id,
          student.name,
          student.phoneNum,
          student.email,
          student.universityId,
          student.isEnabled,
        ),
    );
    const professors = JSON.parse(row.professors).map(
      (professor: {
        id: number | null;
        type: string;
        name: string;
        email: string | null;
      }) =>
        new Professor(
          professor.id,
          professor.type,
          professor.name,
          professor.email,
        ),
    );

    const moderator = row.moderator
      ? new Professor(
          JSON.parse(row.moderator).id,
          JSON.parse(row.moderator).type,
          JSON.parse(row.moderator).name,
          JSON.parse(row.moderator).email,
        )
      : null;

    return new Group(
      row.groupId,
      row.groupNumber,
      row.classroom,
      students,
      professors,
      moderator,
    );
  }

  /**
   * Retrieves a list of all groups in the database.
   * @returns A list of all groups in the database.
   */
  getGroups(): Group[] {
    const query = `
    SELECT 
    Groups.groupId,
    Groups.groupNumber,
    Groups.classroom,
    (
        SELECT json_group_array(json_object('id', studentId, 'name', name, 'email', email, 'phoneNumber', phoneNumber, 'universityId', universityId, 'isEnabled', isEnabled))
        FROM (
            SELECT DISTINCT Students.studentId, Students.name, Students.phoneNumber, Students.email, Students.universityId, Students.isEnabled
            FROM GroupStudents
            JOIN Students ON GroupStudents.studentId = Students.studentId
            WHERE GroupStudents.groupId = Groups.groupId AND Students.isEnabled = 1
        )
    ) AS students,
    (
        SELECT json_group_array(json_object('id', professorId, 'name', name, 'type', typeName, 'email', email))
        FROM (
            SELECT DISTINCT Professors.professorId, Professors.name, Professors.email, ProfessorTypes.typeName
            FROM GroupProfessors
            JOIN Professors ON GroupProfessors.professorId = Professors.professorId
            JOIN ProfessorTypes ON Professors.professorTypeId = ProfessorTypes.professorTypeId
            WHERE GroupProfessors.groupId = Groups.groupId
        )
    ) AS professors,
    (
        SELECT json_object('id', professorId, 'name', name, 'type', typeName, 'email', email)
        FROM (
            SELECT Professors.professorId, Professors.name, Professors.email, ProfessorTypes.typeName
            FROM GroupProfessors
            JOIN Professors ON GroupProfessors.professorId = Professors.professorId
            JOIN ProfessorTypes ON Professors.professorTypeId = ProfessorTypes.professorTypeId
            WHERE GroupProfessors.groupId = Groups.groupId AND GroupProfessors.isModerator = 1
        )
    ) AS moderator
FROM 
    Groups
GROUP BY 
    Groups.groupId, Groups.groupNumber, Groups.classroom;

`;

    const rowList = database.prepare(query).all() as GroupRow[];

    return rowList.map((row) => {
      const students = JSON.parse(row.students).map(
        (student: {
          id: number | null;
          name: string;
          phoneNum: string;
          email: string;
          universityId: string;
          isEnabled: boolean;
        }) =>
          new Student(
            student.id,
            student.name,
            student.phoneNum,
            student.email,
            student.universityId,
            student.isEnabled,
          ),
      );
      const professors = JSON.parse(row.professors).map(
        (professor: {
          id: number | null;
          type: string;
          name: string;
          email: string | null;
        }) =>
          new Professor(
            professor.id,
            professor.type,
            professor.name,
            professor.email,
          ),
      );

      const moderator = row.moderator
        ? new Professor(
            JSON.parse(row.moderator).id,
            JSON.parse(row.moderator).type,
            JSON.parse(row.moderator).name,
            JSON.parse(row.moderator).email,
          )
        : null;

      return new Group(
        row.groupId,
        row.groupNumber,
        row.classroom,
        students,
        professors,
        moderator,
      );
    });
  }

  /**
   * Updates a group in the database.
   * @param group The group to update.
   * @returns Whether the update was successful.
   */
  updateGroup(group: Group): { success: boolean } {
    const updateQuery = database.prepare(`
      UPDATE Groups
      SET groupNumber = ?, classroom = ?
      WHERE groupId = ?;
    `);

    const deleteProfessorsQuery = database.prepare(`
      DELETE FROM GroupProfessors
      WHERE groupId = ?;
    `);

    const deleteStudentsQuery = database.prepare(`
      DELETE FROM GroupStudents
      WHERE groupId = ?;
    `);

    const insertProfessorsQuery = database.prepare(`
      INSERT INTO GroupProfessors (groupId, professorId, isModerator)
      VALUES (?, ?, ?);
    `);

    const insertStudentsQuery = database.prepare(`
      INSERT INTO GroupStudents (groupId, studentId)
      VALUES (?, ?);
    `);

    try {
      database.transaction(() => {
        updateQuery.run(
          group.getGroupNumber(),
          group.getClassroom(),
          group.getId(),
        );
        deleteProfessorsQuery.run(group.getId());
        deleteStudentsQuery.run(group.getId());

        group.getProfessors().forEach((professor) => {
          insertProfessorsQuery.run(
            group.getId(),
            professor.getId(),
            professor.getId() === group.getModerator()?.getId() ? 1 : 0,
          );
        });

        group.getStudents().forEach((student) => {
          insertStudentsQuery.run(group.getId(), student.getId());
        });
      })();
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Deletes a group from the database.
   * @param id The ID of the group to delete.
   * @returns Whether the deletion was successful.
   */
  deleteGroup(id: number): { success: boolean } {
    const deleteProfessorsQuery = database.prepare(`
      DELETE FROM GroupProfessors
      WHERE groupId = ?;
    `);

    const deleteStudentsQuery = database.prepare(`
      DELETE FROM GroupStudents
      WHERE groupId = ?;
    `);

    const deleteQuery = database.prepare(`
      DELETE FROM Groups
      WHERE groupId = ?;
    `);

    try {
      database.transaction(() => {
        deleteProfessorsQuery.run(id);
        deleteStudentsQuery.run(id);
        deleteQuery.run(id);
      })();
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Deletes all groups from the database.
   * @returns Whether the deletion was successful.
   *
   */
  deleteGroups(): { success: boolean } {
    const deleteProfessorsQuery = database.prepare(`
      DELETE FROM GroupProfessors
    `);

    const deleteStudentsQuery = database.prepare(`
      DELETE FROM GroupStudents
    `);

    const deleteQuery = database.prepare(`
      DELETE FROM Groups;
    `);

    const resetProfessorsQuery = database.prepare(`
      UPDATE sqlite_sequence SET seq = 0 WHERE name = 'GroupProfessors';
    `);

    const resetStudentsQuery = database.prepare(`
      UPDATE sqlite_sequence SET seq = 0 WHERE name = 'GroupStudents';
    `);

    const resetGroupsQuery = database.prepare(`
      UPDATE sqlite_sequence SET seq = 0 WHERE name = 'Groups';
    `);

    try {
      database.transaction(() => {
        deleteProfessorsQuery.run();
        deleteStudentsQuery.run();
        deleteQuery.run();
        resetProfessorsQuery.run();
        resetStudentsQuery.run();
        resetGroupsQuery.run();
      })();
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Retrieves all students that are not in a group.
   * @returns A list of students that are not in a group.
   */
  getStudentsWithoutGroup(): Student[] {
    const query = `
    SELECT 
    studentId,
    name,
    phoneNumber,
    email,
    universityId,
    isEnabled
FROM
    Students
WHERE
    studentId NOT IN (
        SELECT DISTINCT studentId
        FROM GroupStudents
    ) AND isEnabled = 1;
`;

    const rows = database.prepare(query).all() as StudentInterface[];

    return rows.map(
      (row) =>
        new Student(
          row.studentId,
          row.name,
          row.phoneNum,
          row.email,
          row.universityId,
          row.isEnabled,
        ),
    );
  }

  /**
   * Deletes a professor from all groups.
   * @param professorId The ID of the professor to delete.
   * @returns Whether the deletion was successful.
   */
  deleteProfessorFromGroups(professorId: number): {
    success: boolean;
  } {
    const deleteQuery = database.prepare(`
      DELETE FROM GroupProfessors
      WHERE professorId = ?;
    `);

    try {
      database.transaction(() => {
        deleteQuery.run(professorId);
      })();
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
}
