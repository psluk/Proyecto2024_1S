export interface StudentInterface {
  studentId: number | null;
  name: string;
  phoneNum: string;
  email: string;
  universityId: string;
  isEnabled: boolean;
}

export default class Student {
  private studentId: number | null;
  private name: string;
  private phoneNum: string;
  private email: string;
  private universityId: string;
  private isEnabled: boolean;

  constructor(
    studentId: number | null,
    name: string,
    phoneNum: string,
    email: string,
    universityId: string,
    isEnabled: boolean,
  ) {
    this.studentId = studentId;
    this.name = name;
    this.phoneNum = phoneNum;
    this.email = email;
    this.universityId = universityId;
    this.isEnabled = isEnabled;
  }

  static reinstantiate(student: StudentInterface | null): Student | null {
    if (!student) {
      return null;
    }
    return new Student(
      student.studentId,
      student.name,
      student.phoneNum,
      student.email,
      student.universityId,
      student.isEnabled,
    );
  }

  public asObject(): StudentInterface {
    return {
      studentId: this.studentId,
      name: this.name,
      phoneNum: this.phoneNum,
      email: this.email,
      universityId: this.universityId,
      isEnabled: this.isEnabled,
    };
  }

  public getId(): number {
    if (!this.studentId) {
      throw new Error("Student ID is null");
    }
    return this.studentId;
  }

  public getName(): string {
    return this.name;
  }

  public getPhoneNum(): string {
    return this.phoneNum;
  }

  public getEmail(): string {
    return this.email;
  }

  public getUniversityId(): string {
    return this.universityId;
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }
}
