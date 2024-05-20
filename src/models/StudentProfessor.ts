export interface StudentProfessorInterface {
  id: number | null;
  student: {
    id: number;
    name: string;
  };
  professors: {
    id: number;
    name: string;
    isAdvisor: boolean;
  }[];
}

export default class StudentProfessor {
  private id: number | null;
  private student: {
    id: number;
    name: string;
  };
  private professors: {
    id: number;
    name: string;
    isAdvisor: boolean;
  }[];

  constructor(
    id: number | null,
    student: {
      id: number;
      name: string;
    },
    professors: {
      id: number;
      name: string;
      isAdvisor: boolean;
    }[],
  ) {
    this.id = id;
    this.student = student;
    this.professors = professors;
  }

  static reinstantiate(
    studentProfessor: StudentProfessorInterface | null,
  ): StudentProfessor | null {
    if (!studentProfessor) {
      return null;
    }
    return new StudentProfessor(
      studentProfessor.id,
      studentProfessor.student,
      studentProfessor.professors,
    );
  }

  public asObject(): StudentProfessorInterface {
    return {
      id: this.id,
      student: this.student,
      professors: this.professors,
    };
  }

  public getId(): number {
    if (!this.id) {
      throw new Error("ID is null");
    }
    return this.id;
  }

  public getStudent(): {
    id: number;
    name: string;
  } {
    return this.student;
  }

  public getProfessors(): {
    id: number;
    name: string;
    isAdvisor: boolean;
  }[] {
    return this.professors;
  }

  public addProfessor(professor: {
    id: number;
    name: string;
    isAdvisor: boolean;
  }): void {
    this.professors.push(professor);
  }

  public removeProfessor(id: number): void {
    this.professors = this.professors.filter(
      (professor) => professor.id !== id,
    );
  }

  public setStudent(student: { id: number; name: string }): void {
    this.student = student;
  }

  public setProfessors(
    professors: {
      id: number;
      name: string;
      isAdvisor: boolean;
    }[],
  ): void {
    this.professors = professors;
  }

  public setId(id: number): void {
    this.id = id;
  }

  public getStudentId(): number {
    return this.student.id;
  }
}
