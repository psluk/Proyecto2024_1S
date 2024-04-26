export interface CourseScheduleProfessorInterface {
  name: string;
  students: number;
  experienceFactor: number | null;
  studentFactor: number | null;
  groupNumber: number | null;
}

export interface CourseScheduleInterface {
  code: string;
  name: string;
  professors: CourseScheduleProfessorInterface[];
}

export default class CourseSchedule {
  private code: string;
  private name: string;
  private professors: CourseScheduleProfessorInterface[];

  constructor(
    code: string,
    name: string,
    professors: CourseScheduleProfessorInterface[],
  ) {
    this.code = code;
    this.name = name;
    this.professors = professors;
  }

  static reinstantiate(
    courseSchedule: CourseScheduleInterface | null,
  ): CourseSchedule | null {
    if (!courseSchedule) {
      return null;
    }
    return new CourseSchedule(
      courseSchedule.code,
      courseSchedule.name,
      courseSchedule.professors,
    );
  }

  public asObject(): CourseScheduleInterface {
    return {
      code: this.code,
      name: this.name,
      professors: this.professors,
    };
  }

  public getCode(): string {
    return this.code;
  }

  public getName(): string {
    return this.name;
  }

  public getProfessors(): CourseScheduleProfessorInterface[] {
    return this.professors;
  }
}
