import Student, { StudentInterface } from "./Student";
import Professor, { ProfessorInterface } from "./Professor";

export interface GroupInterface {
  groupId: number | null;
  groupNumber: number | null;
  classroom: string | null;
  students: StudentInterface[];
  professors: ProfessorInterface[];
  moderator: ProfessorInterface | null;
}

export default class Group {
  private groupId: number | null;
  private groupNumber: number | null;
  private classroom: string | null;
  private students: Student[];
  private professors: Professor[];
  private moderator: Professor | null;

  constructor(
    groupId: number | null,
    groupNumber: number | null,
    classroom: string | null,
    students: Student[],
    professors: Professor[],
    moderator: Professor | null,
  ) {
    this.groupId = groupId;
    this.groupNumber = groupNumber;
    this.classroom = classroom;
    this.students = students;
    this.professors = professors;
    this.moderator = moderator;
  }

  static reinstantiate(group: GroupInterface | null): Group | null {
    if (!group) {
      return null;
    }
    return new Group(
      group.groupId,
      group.groupNumber,
      group.classroom,
      group.students.map((student) => Student.reinstantiate(student) as Student),
      group.professors.map((professor) => Professor.reinstantiate(professor) as Professor),
      group.moderator ? Professor.reinstantiate(group.moderator) as Professor : null,
    );
  }

  public asObject(): GroupInterface {
    return {
      groupId: this.groupId,
      groupNumber: this.groupNumber,
      classroom: this.classroom,
      students: this.students.map((student) => student.asObject()),
      professors: this.professors.map((professor) => professor.asObject()),
      moderator: this.moderator?.asObject() || null,
    };
  }

  public getId(): number {
    if (!this.groupId) {
      throw new Error("Group ID is null");
    }
    return this.groupId;
  }

  public getGroupNumber(): number {
    if (!this.groupNumber) {
      throw new Error("Group number is null");
    }
    return this.groupNumber;
  }

  public getClassroom(): string | null{
    return this.classroom;
  }

  public getStudents(): Student[] {
    return this.students;
  }

  public getProfessors(): Professor[] {
    return this.professors;
  }

  public getModerator(): Professor | null {
    return this.moderator;
  }

  public setClassroom(classroom: string | null): void {
    this.classroom = classroom;
  }

  public setStudents(students: Student[]): void {
    this.students = students;
  }

  public setProfessors(professors: Professor[]): void {
    this.professors = professors;
  }

  public setModerator(moderator: Professor | null): void {
    this.moderator = moderator;
  }

  public addStudent(student: Student): void {
    this.students.push(student);
  }

  public addProfessor(professor: Professor): void {
    this.professors.push(professor);
  }

  public removeStudent(student: Student): void {
    this.students = this.students.filter((s) => s.getId() !== student.getId());
  }

  public removeProfessor(professor: Professor): void {
    this.professors = this.professors.filter((p) => p.getId() !== professor.getId());
  }
  
}
