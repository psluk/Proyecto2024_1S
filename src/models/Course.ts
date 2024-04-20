export interface CourseInterface {
  id: number | null;
  type: string;
  code: string;
  name: string | null;
  hours: number | null;
}

export default class Course {
  private id: number | null;
  private type: string;
  private code: string;
  private name: string;
  private hours: number | null;

  constructor(
    id: number | null,
    type: string,
    code: string,
    name: string,
    hours: number | null,
  ) {
    this.id = id;
    this.type = type;
    this.code = code;
    this.name = name;
    this.hours = hours;
  }

  static reinstantiate(course: Course | null): Course | null {
    if (!course) {
      return null;
    }
    return new Course(
      course.id,
      course.type,
      course.code,
      course.name,
      course.hours,
    );
  }

  public asObject(): CourseInterface {
    return {
      id: this.id,
      type: this.type,
      code: this.code,
      name: this.name,
      hours: this.hours,
    };
  }

  public getType(): string {
    return this.type;
  }

  public getId(): number {
    if (!this.id) {
      throw new Error("Course ID is null");
    }
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getCode(): string | null {
    return this.code;
  }

  public getHours(): number {
    if (!this.hours) {
      throw new Error("Course hours is null");
    }
    return this.hours;
  }


}
