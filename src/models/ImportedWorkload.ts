export interface ImportedWorkloadInterface {
  type: "course" | "research" | "special" | "administrative";
  loadType: "normal" | "extended" | "double" | "overload" | "adHonorem";
  code: string | null;
  name: string;
  hours: number | null;
  students: number | null;
  workload: number;
  groupNumber: number | null;
}

export default class ImportedWorkload {
  private type: "course" | "research" | "special" | "administrative";
  private loadType: "normal" | "extended" | "double" | "overload" | "adHonorem";
  private code: string | null;
  private name: string;
  private hours: number | null;
  private students: number | null;
  private workload: number;
  private groupNumber: number | null;

  constructor(
    type: "course" | "research" | "special" | "administrative",
    loadType: "normal" | "extended" | "double" | "overload" | "adHonorem",
    code: string | null,
    name: string,
    hours: number | null,
    students: number | null,
    workload: number,
    groupNumber: number | null,
  ) {
    this.type = type;
    this.loadType = loadType;
    this.code = code;
    this.name = name;
    this.hours = hours;
    this.students = students;
    this.workload = workload;
    this.groupNumber = groupNumber;
  }

  static reinstantiate(workload: ImportedWorkloadInterface | null): ImportedWorkload | null {
    if (!workload) {
      return null;
    }
    return new ImportedWorkload(
      workload.type,
      workload.loadType,
      workload.code,
      workload.name,
      workload.hours,
      workload.students,
      workload.workload,
      workload.groupNumber,
    );
  }

  public asObject(): ImportedWorkloadInterface {
    return {
      type: this.type,
      loadType: this.loadType,
      code: this.code,
      name: this.name,
      hours: this.hours,
      students: this.students,
      workload: this.workload,
      groupNumber: this.groupNumber,
    };
  }

  public getType(): "course" | "research" | "special" | "administrative" {
    return this.type;
  }

  public getLoadType():
    | "normal"
    | "extended"
    | "double"
    | "overload"
    | "adHonorem" {
    return this.loadType;
  }

  public getCode(): string | null {
    return this.code;
  }

  public getName(): string {
    return this.name;
  }

  public getHours(): number | null {
    return this.hours;
  }

  public getStudents(): number | null {
    return this.students;
  }

  public getWorkload(): number {
    return this.workload;
  }

  public getGroupNumber(): number | null {
    return this.groupNumber;
  }
}
